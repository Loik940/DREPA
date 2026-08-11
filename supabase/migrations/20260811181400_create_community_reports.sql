-- Définit les signalements et leurs valeurs autorisées.
-- Chaque signalement appartient au compte authentifié qui l’envoie.
-- Une seule cible est acceptée entre publication et commentaire.
-- Le statut initial reste géré côté base de données.
-- Les motifs autorisés couvrent les besoins de modération du premier lot.
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN (
    'dangerous_medical_advice',
    'harassment',
    'misleading_information',
    'scam_or_advertising',
    'personal_data',
    'other'
  )),
  details text CHECK (char_length(details) <= 500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(post_id, comment_id) = 1)
);

-- Accélère les recherches et interdit les doublons par cible.
CREATE INDEX community_reports_reporter_created_at_idx
  ON public.community_reports (reporter_id, created_at DESC);
CREATE INDEX community_reports_post_id_idx
  ON public.community_reports (post_id)
  WHERE post_id IS NOT NULL;
CREATE INDEX community_reports_comment_id_idx
  ON public.community_reports (comment_id)
  WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX community_reports_reporter_post_unique_idx
  ON public.community_reports (reporter_id, post_id)
  WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX community_reports_reporter_comment_unique_idx
  ON public.community_reports (reporter_id, comment_id)
  WHERE comment_id IS NOT NULL;

-- Bloque au-delà de dix signalements par heure et par compte.
CREATE FUNCTION public.enforce_community_report_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  authenticated_user_id uuid := auth.uid();
BEGIN
  IF authenticated_user_id IS NOT NULL THEN
    NEW.reporter_id := authenticated_user_id;
    NEW.status := 'pending';
    NEW.created_at := pg_catalog.now();
  END IF;

  IF NEW.details IS NOT NULL THEN
    NEW.details := pg_catalog.btrim(NEW.details);
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.reporter_id::text, 0)
  );

  IF (
    SELECT count(*)
    FROM public.community_reports AS reports
    WHERE reports.reporter_id = NEW.reporter_id
      AND reports.created_at >= pg_catalog.now() - interval '1 hour'
  ) >= 10 THEN
    RAISE EXCEPTION 'Limite de 10 signalements par heure atteinte'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_community_report_rate_limit
BEFORE INSERT ON public.community_reports
FOR EACH ROW
EXECUTE FUNCTION public.enforce_community_report_rate_limit();

CREATE FUNCTION public.set_community_report_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.reporter_id := OLD.reporter_id;
  NEW.post_id := OLD.post_id;
  NEW.comment_id := OLD.comment_id;
  NEW.reason := OLD.reason;
  NEW.details := OLD.details;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_community_report_updated_at
BEFORE UPDATE ON public.community_reports
FOR EACH ROW
EXECUTE FUNCTION public.set_community_report_updated_at();

-- Autorise chaque membre à créer et consulter ses propres signalements.
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_reports_select_own_or_admin
ON public.community_reports
FOR SELECT
TO authenticated
USING (
  reporter_id = (SELECT auth.uid())
  OR public.is_admin()
);

CREATE POLICY community_reports_insert_own_pending_existing_target
ON public.community_reports
FOR INSERT
TO authenticated
WITH CHECK (
  reporter_id = (SELECT auth.uid())
  AND status = 'pending'
  AND (
    (post_id IS NOT NULL AND comment_id IS NULL AND EXISTS (
      SELECT 1
      FROM public.community_posts AS posts
      WHERE posts.id = community_reports.post_id
    ))
    OR
    (comment_id IS NOT NULL AND post_id IS NULL AND EXISTS (
      SELECT 1
      FROM public.community_comments AS comments
      WHERE comments.id = community_reports.comment_id
    ))
  )
);

-- Réserve la mise à jour aux administrateurs et interdit toute suppression.
CREATE POLICY community_reports_update_admin
ON public.community_reports
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

REVOKE ALL ON TABLE public.community_reports FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.enforce_community_report_rate_limit() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_community_report_updated_at() FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.community_reports TO authenticated;
