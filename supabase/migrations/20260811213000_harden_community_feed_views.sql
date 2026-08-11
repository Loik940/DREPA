-- Cette migration corrige les alertes Security Definer View du fil communautaire.
-- Elle supprime uniquement les deux vues existantes, jamais les tables sources.
-- Les fonctions contrôlent elles-mêmes la visibilité avant de renvoyer les données.
-- Aucun identifiant de membre n'est exposé par les fonctions ou les vues.
-- Seuls les membres authentifiés peuvent exécuter les fonctions et lire les vues.
-- Le chemin de recherche vide empêche la résolution d'objets SQL non qualifiés.

-- Retire les vues signalées avant de les reconstruire avec les options sûres.
DROP VIEW public.community_comments_feed;
DROP VIEW public.community_posts_feed;

-- Lit uniquement les publications visibles et calcule la propriété côté base.
CREATE FUNCTION public.read_community_posts_feed()
RETURNS TABLE (
  id uuid,
  author_alias text,
  category text,
  content text,
  support_count integer,
  comments_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  is_own boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    posts.id,
    posts.author_alias,
    posts.category,
    posts.content,
    posts.support_count,
    posts.comments_count,
    posts.created_at,
    posts.updated_at,
    posts.user_id = auth.uid() AS is_own
  FROM public.community_posts AS posts
  WHERE NOT posts.is_hidden
    AND posts.deleted_at IS NULL;
$function$;

-- Lit seulement les commentaires visibles dont la publication reste visible.
CREATE FUNCTION public.read_community_comments_feed()
RETURNS TABLE (
  id uuid,
  post_id uuid,
  author_alias text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  is_own boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT
    comments.id,
    comments.post_id,
    comments.author_alias,
    comments.content,
    comments.created_at,
    comments.updated_at,
    comments.user_id = auth.uid() AS is_own
  FROM public.community_comments AS comments
  JOIN public.community_posts AS posts
    ON posts.id = comments.post_id
  WHERE NOT comments.is_hidden
    AND comments.deleted_at IS NULL
    AND NOT posts.is_hidden
    AND posts.deleted_at IS NULL;
$function$;

-- Ferme l'exécution implicite puis l'ouvre seulement aux sessions authentifiées.
REVOKE ALL ON FUNCTION public.read_community_posts_feed() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.read_community_comments_feed() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.read_community_posts_feed() TO authenticated;
GRANT EXECUTE ON FUNCTION public.read_community_comments_feed() TO authenticated;

COMMENT ON FUNCTION public.read_community_posts_feed() IS
  'Expose le fil visible sans user_id et calcule is_own avec auth.uid().';
COMMENT ON FUNCTION public.read_community_comments_feed() IS
  'Expose les commentaires visibles sans user_id et masque ceux d une publication invisible.';

-- Les vues utilisent les droits de l'appelant et gardent une barrière de sécurité.
CREATE VIEW public.community_posts_feed
WITH (security_invoker = true, security_barrier = true)
AS
SELECT *
FROM public.read_community_posts_feed();

CREATE VIEW public.community_comments_feed
WITH (security_invoker = true, security_barrier = true)
AS
SELECT *
FROM public.read_community_comments_feed();

-- Aucune lecture anonyme ou publique n'est permise sur les vues du fil.
REVOKE ALL ON TABLE public.community_posts_feed FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.community_comments_feed FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.community_posts_feed TO authenticated;
GRANT SELECT ON TABLE public.community_comments_feed TO authenticated;

COMMENT ON VIEW public.community_posts_feed IS
  'Vue security_invoker du fil visible, sans UUID de membre exposé.';
COMMENT ON VIEW public.community_comments_feed IS
  'Vue security_invoker des commentaires visibles, sans UUID de membre exposé.';
