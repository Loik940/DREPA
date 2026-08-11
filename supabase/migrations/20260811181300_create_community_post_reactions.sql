-- Cette table conserve une seule réaction de soutien par membre et par publication.
-- Chaque réaction appartient à un compte authentifié.
-- Le type de réaction reste limité au soutien dans le premier lot.
-- La contrainte unique empêche les soutiens en double.
-- Le compteur de la publication est synchronisé côté base de données.
CREATE TABLE public.community_post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'support' CHECK (reaction_type = 'support'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_post_reactions_post_user_unique UNIQUE (post_id, user_id)
);

-- Cet index accélère la recherche des réactions appartenant à un membre.
CREATE INDEX community_post_reactions_user_id_idx
  ON public.community_post_reactions (user_id);

-- Ce trigger impose l’identité authentifiée avant les contrôles RLS.
CREATE FUNCTION public.prepare_community_post_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER community_post_reactions_prepare
BEFORE INSERT ON public.community_post_reactions
FOR EACH ROW EXECUTE FUNCTION public.prepare_community_post_reaction();

-- Ce trigger synchronise le compteur de soutiens après chaque ajout ou suppression sans valeur négative.
CREATE FUNCTION public.sync_community_post_support_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts AS p
    SET support_count = COALESCE(p.support_count, 0) + 1
    WHERE p.id = NEW.post_id;
    RETURN NEW;
  END IF;

  UPDATE public.community_posts AS p
  SET support_count = GREATEST(COALESCE(p.support_count, 0) - 1, 0)
  WHERE p.id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER community_post_reactions_sync_support_count
AFTER INSERT OR DELETE ON public.community_post_reactions
FOR EACH ROW EXECUTE FUNCTION public.sync_community_post_support_count();

-- Ces règles RLS autorisent la lecture selon la visibilité et réservent les écritures au propriétaire.
ALTER TABLE public.community_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_post_reactions_select_authenticated
ON public.community_post_reactions
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR COALESCE(public.is_admin(), false)
);

CREATE POLICY community_post_reactions_insert_own_visible_post
ON public.community_post_reactions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND reaction_type = 'support'
  AND EXISTS (
    SELECT 1
    FROM public.community_posts AS p
    WHERE p.id = post_id
      AND NOT p.is_hidden
      AND p.deleted_at IS NULL
  )
);

CREATE POLICY community_post_reactions_delete_own_visible_post
ON public.community_post_reactions
FOR DELETE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1
    FROM public.community_posts AS p
    WHERE p.id = post_id
      AND NOT p.is_hidden
      AND p.deleted_at IS NULL
  )
);

-- Ces droits retirent tout accès anonyme ou public et excluent volontairement les mises à jour.
REVOKE ALL ON TABLE public.community_post_reactions FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.prepare_community_post_reaction() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.sync_community_post_support_count() FROM anon, authenticated, PUBLIC;
GRANT SELECT, INSERT, DELETE ON TABLE public.community_post_reactions TO authenticated;
