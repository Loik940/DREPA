-- Ajoute le suivi de traitement aux signalements communautaires.
-- La date et l'action restent conservées même si le compte modérateur est supprimé.
-- Le mobile ne peut pas modifier le journal après son insertion.
-- Les administrateurs voient la file sans identifiant privé de membre.
-- Les changements de visibilité sont enregistrés automatiquement.

ALTER TABLE public.community_reports
  ADD COLUMN reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN resolution_note text,
  ADD CONSTRAINT community_reports_resolution_note_length_check
    CHECK (
      resolution_note IS NULL
      OR pg_catalog.char_length(resolution_note) <= 500
    );

-- Prépare les décisions historiques avant d'imposer la cohérence du nouvel état.
UPDATE public.community_reports
SET
  reviewed_at = COALESCE(updated_at, created_at),
  reviewed_by = NULL,
  resolution_note = NULL
WHERE status IN ('reviewed', 'dismissed');

ALTER TABLE public.community_reports
  ADD CONSTRAINT community_reports_review_state_check
    CHECK (
      (
        status = 'pending'
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
      )
      OR
      (
        status IN ('reviewed', 'dismissed')
        AND reviewed_at IS NOT NULL
      )
    );

-- Force côté base les champs réservés lors de chaque signalement mobile.
CREATE OR REPLACE FUNCTION public.enforce_community_report_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  authenticated_user_id uuid := auth.uid();
BEGIN
  IF authenticated_user_id IS NOT NULL THEN
    NEW.reporter_id := authenticated_user_id;
    NEW.status := 'pending';
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
    NEW.resolution_note := NULL;
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
$function$;

-- Un compte ne lit directement que son propre rôle ; is_admin() reste autonome.
DROP POLICY "Users can read own role or admins can read all roles"
  ON public.user_roles;

CREATE POLICY user_roles_select_own
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Cette table conserve une trace minimale de chaque action de modération.
CREATE TABLE public.community_moderation_actions (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  report_id uuid REFERENCES public.community_reports(id) ON DELETE SET NULL,
  moderator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type text NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN (
    'hide_post',
    'hide_comment',
    'dismiss_report',
    'restore_post',
    'restore_comment'
  )),
  note text CHECK (
    note IS NULL
    OR pg_catalog.char_length(note) <= 500
  ),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now()
);

CREATE INDEX community_moderation_actions_report_created_idx
  ON public.community_moderation_actions (report_id, created_at DESC);

CREATE INDEX community_moderation_actions_target_idx
  ON public.community_moderation_actions (target_type, target_id);

ALTER TABLE public.community_moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_moderation_actions_select_admin
ON public.community_moderation_actions
FOR SELECT
TO authenticated
USING (public.is_admin());

REVOKE ALL ON TABLE public.community_moderation_actions
  FROM PUBLIC, anon, authenticated;

-- Un administrateur qui n'est pas l'auteur peut seulement changer la visibilité.
CREATE OR REPLACE FUNCTION public.protect_community_post_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := COALESCE(public.is_admin(), false);
BEGIN
  NEW.id := OLD.id;
  NEW.user_id := OLD.user_id;
  NEW.author_alias := OLD.author_alias;
  NEW.created_at := OLD.created_at;

  IF OLD.deleted_at IS NOT NULL THEN
    NEW.deleted_at := OLD.deleted_at;
    NEW.is_hidden := true;
    NEW.content := OLD.content;
    NEW.category := OLD.category;
  ELSIF current_user_is_admin AND OLD.user_id IS DISTINCT FROM current_user_id THEN
    NEW.deleted_at := OLD.deleted_at;
    NEW.content := OLD.content;
    NEW.category := OLD.category;
  ELSIF NOT current_user_is_admin THEN
    IF NEW.deleted_at IS NOT NULL THEN
      NEW.deleted_at := pg_catalog.now();
      NEW.is_hidden := true;
      NEW.content := OLD.content;
      NEW.category := OLD.category;
    ELSE
      NEW.deleted_at := OLD.deleted_at;
      NEW.is_hidden := OLD.is_hidden;
      NEW.content := pg_catalog.btrim(NEW.content);
    END IF;
  ELSE
    NEW.deleted_at := NULL;
    NEW.content := pg_catalog.btrim(NEW.content);
  END IF;

  -- Seuls les triggers de compteurs peuvent changer ces valeurs.
  IF OLD.deleted_at IS NOT NULL OR pg_catalog.pg_trigger_depth() = 1 THEN
    NEW.support_count := OLD.support_count;
    NEW.comments_count := OLD.comments_count;
  END IF;

  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$function$;

-- L'insertion garde sa préparation existante, la mise à jour a sa protection dédiée.
DROP TRIGGER community_comments_10_prepare ON public.community_comments;

CREATE TRIGGER community_comments_10_prepare
BEFORE INSERT ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.prepare_community_comment();

CREATE OR REPLACE FUNCTION public.protect_community_comment_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := COALESCE(public.is_admin(), false);
BEGIN
  NEW.id := OLD.id;
  NEW.post_id := OLD.post_id;
  NEW.user_id := OLD.user_id;
  NEW.author_alias := OLD.author_alias;
  NEW.created_at := OLD.created_at;

  IF OLD.deleted_at IS NOT NULL THEN
    NEW.deleted_at := OLD.deleted_at;
    NEW.is_hidden := true;
    NEW.content := OLD.content;
  ELSIF current_user_is_admin AND OLD.user_id IS DISTINCT FROM current_user_id THEN
    NEW.deleted_at := OLD.deleted_at;
    NEW.content := OLD.content;
  ELSIF NOT current_user_is_admin THEN
    IF NEW.deleted_at IS NOT NULL THEN
      NEW.deleted_at := pg_catalog.now();
      NEW.is_hidden := true;
      NEW.content := OLD.content;
    ELSE
      NEW.deleted_at := OLD.deleted_at;
      NEW.is_hidden := OLD.is_hidden;
      NEW.content := pg_catalog.btrim(NEW.content);
    END IF;
  ELSE
    NEW.deleted_at := NULL;
    NEW.content := pg_catalog.btrim(NEW.content);
  END IF;

  NEW.updated_at := pg_catalog.statement_timestamp();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER community_comments_10_protect_update
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.protect_community_comment_update();

-- Enregistre seulement les changements de visibilité faits par un administrateur.
CREATE FUNCTION public.audit_community_visibility_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  linked_report_id uuid;
  configured_report_id uuid;
  configured_report_id_text text := pg_catalog.current_setting(
    'app.moderation_report_id',
    true
  );
  configured_note text := pg_catalog.current_setting('app.moderation_note', true);
  moderation_action text;
BEGIN
  IF OLD.is_hidden IS NOT DISTINCT FROM NEW.is_hidden
    OR NOT COALESCE(public.is_admin(), false) THEN
    RETURN NEW;
  END IF;

  IF TG_ARGV[0] = 'post' THEN
    moderation_action := CASE
      WHEN NEW.is_hidden THEN 'hide_post'
      ELSE 'restore_post'
    END;
  ELSIF TG_ARGV[0] = 'comment' THEN
    moderation_action := CASE
      WHEN NEW.is_hidden THEN 'hide_comment'
      ELSE 'restore_comment'
    END;
  ELSE
    RAISE EXCEPTION 'Type de cible de modération invalide.'
      USING ERRCODE = '22023';
  END IF;

  -- Le contexte relie l'audit, mais n'autorise jamais l'action : is_admin() reste exigé.
  IF configured_report_id_text ~* (
    '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-'
    || '[0-9a-f]{4}-[0-9a-f]{12}$'
  ) THEN
    configured_report_id := configured_report_id_text::uuid;
  END IF;

  -- Le signalement configuré doit désigner exactement la cible modifiée et son type.
  IF configured_report_id IS NOT NULL THEN
    SELECT reports.id
      INTO linked_report_id
      FROM public.community_reports AS reports
      WHERE reports.id = configured_report_id
        AND (
          (TG_ARGV[0] = 'post' AND reports.post_id = NEW.id)
          OR
          (TG_ARGV[0] = 'comment' AND reports.comment_id = NEW.id)
        );
  END IF;

  -- Un changement administrateur direct reste lié au dernier signalement connu.
  IF linked_report_id IS NULL THEN
    IF TG_ARGV[0] = 'post' THEN
      SELECT reports.id
        INTO linked_report_id
        FROM public.community_reports AS reports
        WHERE reports.post_id = NEW.id
        ORDER BY reports.created_at DESC, reports.id DESC
        LIMIT 1;
    ELSE
      SELECT reports.id
        INTO linked_report_id
        FROM public.community_reports AS reports
        WHERE reports.comment_id = NEW.id
        ORDER BY reports.created_at DESC, reports.id DESC
        LIMIT 1;
    END IF;
  END IF;

  INSERT INTO public.community_moderation_actions (
    report_id,
    moderator_id,
    target_type,
    target_id,
    action,
    note
  )
  VALUES (
    linked_report_id,
    auth.uid(),
    TG_ARGV[0],
    NEW.id,
    moderation_action,
    -- La note vient du contexte local posé par la RPC, vide devenant NULL.
    NULLIF(configured_note, '')
  );

  RETURN NEW;
END;
$function$;

CREATE TRIGGER audit_community_post_visibility_change
AFTER UPDATE OF is_hidden ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.audit_community_visibility_change('post');

CREATE TRIGGER audit_community_comment_visibility_change
AFTER UPDATE OF is_hidden ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.audit_community_visibility_change('comment');

-- Retourne une page de signalements sans UUID de membre ni adresse e-mail.
CREATE FUNCTION public.get_community_moderation_queue(
  target_status text DEFAULT 'pending',
  cursor_created_at timestamptz DEFAULT NULL,
  cursor_id uuid DEFAULT NULL,
  page_size integer DEFAULT 20
)
RETURNS TABLE (
  report_id uuid,
  target_type text,
  target_id uuid,
  reason text,
  details text,
  status text,
  report_created_at timestamptz,
  reviewed_at timestamptz,
  resolution_note text,
  author_alias text,
  content text,
  category text,
  content_created_at timestamptz,
  is_hidden boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  effective_page_size integer := LEAST(
    GREATEST(COALESCE(page_size, 20), 1),
    50
  );
BEGIN
  IF NOT COALESCE(public.is_admin(), false) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.'
      USING ERRCODE = '42501';
  END IF;

  IF target_status IS NULL
    OR target_status NOT IN ('pending', 'reviewed', 'dismissed') THEN
    RAISE EXCEPTION 'Statut de modération invalide.'
      USING ERRCODE = '22023';
  END IF;

  IF (cursor_created_at IS NULL) IS DISTINCT FROM (cursor_id IS NULL) THEN
    RAISE EXCEPTION 'Le curseur de pagination est incomplet.'
      USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    reports.id,
    CASE WHEN reports.post_id IS NOT NULL THEN 'post' ELSE 'comment' END,
    COALESCE(reports.post_id, reports.comment_id),
    reports.reason,
    reports.details,
    reports.status,
    reports.created_at,
    reports.reviewed_at,
    reports.resolution_note,
    COALESCE(posts.author_alias, comments.author_alias),
    COALESCE(posts.content, comments.content),
    posts.category,
    COALESCE(posts.created_at, comments.created_at),
    COALESCE(posts.is_hidden, comments.is_hidden)
  FROM public.community_reports AS reports
  LEFT JOIN public.community_posts AS posts
    ON posts.id = reports.post_id
  LEFT JOIN public.community_comments AS comments
    ON comments.id = reports.comment_id
  WHERE reports.status = target_status
    AND (
      cursor_created_at IS NULL
      OR reports.created_at < cursor_created_at
      OR (
        reports.created_at = cursor_created_at
        AND reports.id < cursor_id
      )
    )
  ORDER BY reports.created_at DESC, reports.id DESC
  LIMIT effective_page_size;
END;
$function$;

-- Retourne un signalement précis avec le même contrat sûr que la file.
CREATE FUNCTION public.get_community_moderation_report(target_report_id uuid)
RETURNS TABLE (
  report_id uuid,
  target_type text,
  target_id uuid,
  reason text,
  details text,
  status text,
  report_created_at timestamptz,
  reviewed_at timestamptz,
  resolution_note text,
  author_alias text,
  content text,
  category text,
  content_created_at timestamptz,
  is_hidden boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NOT COALESCE(public.is_admin(), false) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    reports.id,
    CASE WHEN reports.post_id IS NOT NULL THEN 'post' ELSE 'comment' END,
    COALESCE(reports.post_id, reports.comment_id),
    reports.reason,
    reports.details,
    reports.status,
    reports.created_at,
    reports.reviewed_at,
    reports.resolution_note,
    COALESCE(posts.author_alias, comments.author_alias),
    COALESCE(posts.content, comments.content),
    posts.category,
    COALESCE(posts.created_at, comments.created_at),
    COALESCE(posts.is_hidden, comments.is_hidden)
  FROM public.community_reports AS reports
  LEFT JOIN public.community_posts AS posts
    ON posts.id = reports.post_id
  LEFT JOIN public.community_comments AS comments
    ON comments.id = reports.comment_id
  WHERE reports.id = target_report_id;
END;
$function$;

-- Retourne uniquement les éléments utiles de l'historique d'un signalement.
CREATE FUNCTION public.get_community_moderation_history(target_report_id uuid)
RETURNS TABLE (
  action text,
  note text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF NOT COALESCE(public.is_admin(), false) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    actions.action,
    actions.note,
    actions.created_at
  FROM public.community_moderation_actions AS actions
  WHERE actions.report_id = target_report_id
  ORDER BY actions.created_at DESC, actions.id DESC;
END;
$function$;

-- Verrouille le signalement avant de prendre une décision unique et cohérente.
CREATE FUNCTION public.moderate_community_report(
  target_report_id uuid,
  decision text,
  note text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  selected_report public.community_reports%ROWTYPE;
  normalized_decision text := pg_catalog.lower(pg_catalog.btrim(decision));
  normalized_note text := NULLIF(pg_catalog.btrim(note), '');
  selected_target_type text;
  selected_target_id uuid;
  target_is_hidden boolean;
  target_deleted_at timestamptz;
  target_found boolean := false;
  resulting_status text;
BEGIN
  IF NOT COALESCE(public.is_admin(), false) THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs.'
      USING ERRCODE = '42501';
  END IF;

  IF normalized_decision IS NULL
    OR normalized_decision NOT IN ('hide', 'dismiss', 'restore') THEN
    RAISE EXCEPTION 'Décision de modération invalide.'
      USING ERRCODE = '22023';
  END IF;

  IF normalized_note IS NOT NULL
    AND pg_catalog.char_length(normalized_note) > 500 THEN
    RAISE EXCEPTION 'La note de résolution dépasse 500 caractères.'
      USING ERRCODE = '22001';
  END IF;

  SELECT reports.*
    INTO selected_report
    FROM public.community_reports AS reports
    WHERE reports.id = target_report_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Signalement introuvable.'
      USING ERRCODE = 'P0002';
  END IF;

  IF selected_report.post_id IS NOT NULL THEN
    selected_target_type := 'post';
    selected_target_id := selected_report.post_id;

    SELECT posts.is_hidden, posts.deleted_at
      INTO target_is_hidden, target_deleted_at
      FROM public.community_posts AS posts
      WHERE posts.id = selected_target_id
      FOR UPDATE;
    target_found := FOUND;
  ELSE
    selected_target_type := 'comment';
    selected_target_id := selected_report.comment_id;

    SELECT comments.is_hidden, comments.deleted_at
      INTO target_is_hidden, target_deleted_at
      FROM public.community_comments AS comments
      WHERE comments.id = selected_target_id
      FOR UPDATE;
    target_found := FOUND;
  END IF;

  IF selected_report.status <> 'pending'
    AND normalized_decision <> 'restore' THEN
    RAISE EXCEPTION 'Ce signalement a déjà été traité.'
      USING ERRCODE = '55000';
  END IF;

  -- Une restauration concerne uniquement un signalement déjà traité par masquage.
  IF normalized_decision = 'restore'
    AND selected_report.status <> 'reviewed' THEN
    RAISE EXCEPTION 'La restauration est autorisée uniquement après traitement.'
      USING ERRCODE = '55000';
  END IF;

  IF normalized_decision = 'restore'
    AND (
      NOT target_found
      OR target_deleted_at IS NOT NULL
      OR NOT target_is_hidden
    ) THEN
    RAISE EXCEPTION 'La cible ne peut pas être restaurée.'
      USING ERRCODE = '55000';
  END IF;

  IF normalized_decision = 'hide'
    AND (NOT target_found OR target_deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'La cible est indisponible.'
      USING ERRCODE = '55000';
  END IF;

  -- Le contexte local sert seulement à relier le trigger au signalement verrouillé.
  IF normalized_decision IN ('hide', 'restore') THEN
    PERFORM pg_catalog.set_config(
      'app.moderation_report_id',
      selected_report.id::text,
      true
    );
    PERFORM pg_catalog.set_config(
      'app.moderation_note',
      COALESCE(normalized_note, ''),
      true
    );
  END IF;

  IF normalized_decision = 'hide' THEN
    IF target_is_hidden THEN
      -- Aucun changement de visibilité ne déclenche le trigger : journalise une fois ici.
      INSERT INTO public.community_moderation_actions (
        report_id,
        moderator_id,
        target_type,
        target_id,
        action,
        note
      )
      VALUES (
        selected_report.id,
        auth.uid(),
        selected_target_type,
        selected_target_id,
        CASE
          WHEN selected_target_type = 'post' THEN 'hide_post'
          ELSE 'hide_comment'
        END,
        normalized_note
      );
    ELSIF selected_target_type = 'post' THEN
      UPDATE public.community_posts AS posts
      SET is_hidden = true
      WHERE posts.id = selected_target_id;
    ELSE
      UPDATE public.community_comments AS comments
      SET is_hidden = true
      WHERE comments.id = selected_target_id;
    END IF;
  ELSIF normalized_decision = 'restore' THEN
    IF selected_target_type = 'post' THEN
      UPDATE public.community_posts AS posts
      SET is_hidden = false
      WHERE posts.id = selected_target_id;
    ELSE
      UPDATE public.community_comments AS comments
      SET is_hidden = false
      WHERE comments.id = selected_target_id;
    END IF;
  END IF;

  resulting_status := CASE
    WHEN normalized_decision = 'dismiss' THEN 'dismissed'
    ELSE 'reviewed'
  END;

  UPDATE public.community_reports AS reports
  SET
    status = resulting_status,
    reviewed_by = auth.uid(),
    reviewed_at = pg_catalog.now(),
    resolution_note = normalized_note
  WHERE reports.id = selected_report.id;

  IF normalized_decision = 'dismiss' THEN
    INSERT INTO public.community_moderation_actions (
      report_id,
      moderator_id,
      target_type,
      target_id,
      action,
      note
    )
    VALUES (
      selected_report.id,
      auth.uid(),
      selected_target_type,
      selected_target_id,
      'dismiss_report',
      normalized_note
    );
  END IF;

  RETURN resulting_status;
END;
$function$;

-- Le mobile doit passer par les RPC pour toute décision de modération.
-- Il peut créer un signalement et récupérer uniquement son identifiant.
REVOKE SELECT, UPDATE ON TABLE public.community_reports FROM authenticated;
GRANT SELECT (id), INSERT ON TABLE public.community_reports TO authenticated;

REVOKE ALL ON FUNCTION public.protect_community_post_update()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_community_comment_update()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.audit_community_visibility_change()
  FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.get_community_moderation_queue(text, timestamptz, uuid, integer)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_moderation_report(uuid)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_community_moderation_history(uuid)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.moderate_community_report(uuid, text, text)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_community_moderation_queue(text, timestamptz, uuid, integer)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_moderation_report(uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_community_moderation_history(uuid)
  TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_community_report(uuid, text, text)
  TO authenticated;

COMMENT ON TABLE public.community_moderation_actions IS
  'Journal durable et minimal des décisions de modération communautaire.';
COMMENT ON FUNCTION public.protect_community_post_update() IS
  'Protège le contenu, l identité et les compteurs pendant une modération.';
COMMENT ON FUNCTION public.protect_community_comment_update() IS
  'Protège le contenu et l identité du commentaire pendant une modération.';
COMMENT ON FUNCTION public.audit_community_visibility_change() IS
  'Journalise la visibilité et la relie au signalement administrateur validé.';
COMMENT ON FUNCTION public.get_community_moderation_queue(text, timestamptz, uuid, integer) IS
  'Retourne aux administrateurs une file paginée sans donnée privée de membre.';
COMMENT ON FUNCTION public.get_community_moderation_report(uuid) IS
  'Retourne aux administrateurs un signalement précis sans donnée privée de membre.';
COMMENT ON FUNCTION public.get_community_moderation_history(uuid) IS
  'Retourne aux administrateurs l historique minimal d un signalement.';
COMMENT ON FUNCTION public.moderate_community_report(uuid, text, text) IS
  'Traite un signalement verrouillé et journalise la décision correspondante.';
