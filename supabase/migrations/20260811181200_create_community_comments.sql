-- Cette table conserve les commentaires et supprime ceux dont la publication parente disparaît.
-- Chaque commentaire appartient à un compte authentifié.
-- L’alias affiché est préparé côté base de données.
-- La visibilité reste contrôlée par les règles de modération.
-- Les contraintes limitent la longueur du contenu envoyé.
CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_alias text NOT NULL CHECK (char_length(btrim(author_alias)) BETWEEN 1 AND 80),
  content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 1000),
  is_hidden boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ces index accélèrent l’affichage par publication et le contrôle des envois récents par membre.
CREATE INDEX community_comments_post_created_idx
  ON public.community_comments (post_id, created_at DESC);
CREATE INDEX community_comments_user_created_idx
  ON public.community_comments (user_id, created_at DESC);

-- Ces fonctions imposent l’identité du profil, protègent les champs sensibles et limitent le spam.
CREATE FUNCTION public.prepare_community_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := COALESCE(public.is_admin(), false);
BEGIN
  NEW.content := pg_catalog.btrim(NEW.content);

  IF TG_OP = 'INSERT' THEN
    IF current_user_id IS NOT NULL THEN
      NEW.user_id := current_user_id;
      NEW.is_hidden := false;
      NEW.created_at := pg_catalog.statement_timestamp();
    END IF;

    NEW.author_alias := public.get_or_create_community_alias(NEW.user_id);
    NEW.deleted_at := NULL;
  ELSE
    NEW.id := OLD.id;
    NEW.user_id := OLD.user_id;
    NEW.author_alias := OLD.author_alias;
    NEW.created_at := OLD.created_at;
    NEW.post_id := OLD.post_id;

    IF OLD.deleted_at IS NOT NULL THEN
      NEW.deleted_at := OLD.deleted_at;
      NEW.is_hidden := true;
      NEW.content := OLD.content;
    ELSIF NOT current_user_is_admin THEN
      IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        NEW.deleted_at := pg_catalog.now();
        NEW.is_hidden := true;
        NEW.content := OLD.content;
      ELSE
        NEW.deleted_at := OLD.deleted_at;
        NEW.is_hidden := OLD.is_hidden;
      END IF;
    ELSE
      NEW.deleted_at := NULL;
    END IF;
  END IF;

  NEW.updated_at := pg_catalog.statement_timestamp();
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.limit_community_comment_spam()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  recent_comments integer;
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.user_id::text, 0)
  );

  SELECT count(*)
    INTO recent_comments
    FROM public.community_comments AS c
    WHERE c.user_id = NEW.user_id
      AND c.created_at >= pg_catalog.statement_timestamp() - interval '10 minutes';

  IF recent_comments >= 20 THEN
    RAISE EXCEPTION 'Vous avez atteint la limite de 20 commentaires en 10 minutes.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER community_comments_10_prepare
BEFORE INSERT OR UPDATE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.prepare_community_comment();

CREATE TRIGGER community_comments_20_limit_spam
BEFORE INSERT ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.limit_community_comment_spam();

-- Ce trigger garde le nombre de commentaires visibles exact sans jamais produire une valeur négative.
CREATE FUNCTION public.sync_community_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT NEW.is_hidden THEN
      UPDATE public.community_posts AS p
      SET comments_count = COALESCE(p.comments_count, 0) + 1
      WHERE p.id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF NOT OLD.is_hidden THEN
      UPDATE public.community_posts AS p
      SET comments_count = GREATEST(COALESCE(p.comments_count, 0) - 1, 0)
      WHERE p.id = OLD.post_id;
    END IF;
  ELSIF OLD.post_id IS DISTINCT FROM NEW.post_id THEN
    IF NOT OLD.is_hidden THEN
      UPDATE public.community_posts AS p
      SET comments_count = GREATEST(COALESCE(p.comments_count, 0) - 1, 0)
      WHERE p.id = OLD.post_id;
    END IF;
    IF NOT NEW.is_hidden THEN
      UPDATE public.community_posts AS p
      SET comments_count = COALESCE(p.comments_count, 0) + 1
      WHERE p.id = NEW.post_id;
    END IF;
  ELSIF OLD.is_hidden IS DISTINCT FROM NEW.is_hidden THEN
    UPDATE public.community_posts AS p
    SET comments_count = GREATEST(
      COALESCE(p.comments_count, 0) + CASE WHEN NEW.is_hidden THEN -1 ELSE 1 END,
      0
    )
    WHERE p.id = NEW.post_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER community_comments_sync_count
AFTER INSERT OR DELETE OR UPDATE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.sync_community_post_comments_count();

-- Les règles RLS réservent chaque action aux membres authentifiés selon la visibilité et la propriété.
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_comments_select_authenticated
ON public.community_comments
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR COALESCE(public.is_admin(), false)
  OR (
    NOT is_hidden
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.community_posts AS p
      WHERE p.id = post_id
        AND NOT p.is_hidden
        AND p.deleted_at IS NULL
    )
  )
);

CREATE POLICY community_comments_insert_own_visible_post
ON public.community_comments
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND NOT is_hidden
  AND EXISTS (
    SELECT 1
    FROM public.community_posts AS p
    WHERE p.id = post_id
      AND NOT p.is_hidden
      AND p.deleted_at IS NULL
  )
);

CREATE POLICY community_comments_update_own_or_admin
ON public.community_comments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR COALESCE(public.is_admin(), false))
WITH CHECK (user_id = auth.uid() OR COALESCE(public.is_admin(), false));

-- Cette vue expose les commentaires visibles sans identifiant de membre.
CREATE VIEW public.community_comments_feed
WITH (security_barrier = true)
AS
SELECT
  comments.id,
  comments.post_id,
  comments.author_alias,
  comments.content,
  comments.created_at,
  comments.updated_at,
  comments.user_id = auth.uid() AS is_own
FROM public.community_comments AS comments
WHERE NOT comments.is_hidden
  AND comments.deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.community_posts AS posts
    WHERE posts.id = comments.post_id
      AND NOT posts.is_hidden
      AND posts.deleted_at IS NULL
  );

REVOKE ALL ON TABLE public.community_comments FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.community_comments_feed FROM anon, PUBLIC;

-- Sans droit DELETE mobile, supprimer puis recréer ne contourne plus l’anti-spam.
GRANT SELECT (id, post_id, is_hidden, deleted_at) ON TABLE public.community_comments TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.community_comments TO authenticated;
GRANT SELECT ON TABLE public.community_comments_feed TO authenticated;

REVOKE ALL ON FUNCTION public.prepare_community_comment() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.limit_community_comment_spam() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.sync_community_post_comments_count() FROM anon, authenticated, PUBLIC;
