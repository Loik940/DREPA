-- Crée les rôles applicatifs associés aux comptes authentifiés.
-- Chaque compte reçoit le rôle utilisateur par défaut.
-- Le rôle administrateur reste attribué côté serveur.
-- Les membres peuvent seulement consulter les rôles autorisés.
-- Une fonction dédiée centralise la vérification administrateur.
CREATE TABLE public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  community_alias text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ce pseudonyme communautaire reste stable après sa première attribution.
COMMENT ON COLUMN public.user_roles.community_alias IS
  'Pseudonyme communautaire stable attribué au premier message.';

-- Deux membres ne peuvent pas partager le même pseudonyme, même avec une casse différente.
CREATE UNIQUE INDEX user_roles_community_alias_lower_unique_idx
  ON public.user_roles (pg_catalog.lower(community_alias))
  WHERE community_alias IS NOT NULL;

CREATE TRIGGER set_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Attribue automatiquement le rôle utilisateur à chaque nouveau compte.
CREATE FUNCTION public.assign_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_default_user_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_user_role();

-- Complète les rôles manquants pour les comptes déjà présents.
INSERT INTO public.user_roles (user_id, role)
SELECT auth.users.id, 'user'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Attribue une seule fois un pseudonyme communautaire sûr et stable.
CREATE FUNCTION public.get_or_create_community_alias(target_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  stored_alias text;
  base_alias text;
BEGIN
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Un compte est requis pour créer le pseudonyme communautaire.'
      USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(target_user_id::text, 0)
  );

  SELECT roles.community_alias
    INTO stored_alias
    FROM public.user_roles AS roles
    WHERE roles.user_id = target_user_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Le rôle du compte est introuvable.'
      USING ERRCODE = 'P0002';
  END IF;

  IF stored_alias IS NOT NULL THEN
    RETURN stored_alias;
  END IF;

  SELECT nullif(pg_catalog.btrim(profiles.first_name), '')
    INTO base_alias
    FROM public.profiles AS profiles
    WHERE profiles.id = target_user_id;

  base_alias := coalesce(base_alias, 'Membre DRÉPA');

  IF pg_catalog.lower(base_alias) IN (
    'drepa',
    'drépa',
    'equipe drepa',
    'équipe drépa',
    'admin',
    'administrateur',
    'moderateur',
    'modérateur',
    'support',
    'support drepa',
    'support drépa'
  ) THEN
    RAISE EXCEPTION 'Ce pseudonyme communautaire est réservé.'
      USING ERRCODE = '22023';
  END IF;

  stored_alias := base_alias;

  IF EXISTS (
    SELECT 1
    FROM public.user_roles AS other_roles
    WHERE other_roles.user_id <> target_user_id
      AND pg_catalog.lower(other_roles.community_alias) = pg_catalog.lower(base_alias)
  ) THEN
    stored_alias := pg_catalog.left(base_alias, 75)
      || '-'
      || pg_catalog.substr(pg_catalog.md5(target_user_id::text), 1, 4);
  END IF;

  BEGIN
    UPDATE public.user_roles AS roles
    SET community_alias = stored_alias
    WHERE roles.user_id = target_user_id;
  EXCEPTION
    WHEN unique_violation THEN
      stored_alias := pg_catalog.left(base_alias, 75)
        || '-'
        || pg_catalog.substr(pg_catalog.md5(target_user_id::text), 1, 4);

      UPDATE public.user_roles AS roles
      SET community_alias = stored_alias
      WHERE roles.user_id = target_user_id;
  END;

  RETURN stored_alias;
END;
$$;

-- Expose un contrôle administrateur sûr sans accès direct en écriture.
CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE public.user_roles.user_id = auth.uid()
      AND public.user_roles.role = 'admin'
  );
$$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role or admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- Limite le mobile à la lecture autorisée et à la vérification administrateur.
REVOKE ALL ON TABLE public.user_roles FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.user_roles TO authenticated;

REVOKE ALL ON FUNCTION public.assign_default_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_community_alias(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
