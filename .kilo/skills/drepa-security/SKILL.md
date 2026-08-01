---
name: drepa-security
description: Règles de sécurité Supabase, session, données privées et secrets pour DRÉPA.
---

# DRÉPA Security

- La source d’identité est exclusivement `session.user.id` / `auth.uid()`.
- Les requêtes utilisateur attendent une session prête et utilisent son identifiant.
- `getSession()` et `onAuthStateChange` ne doivent pas provoquer de course ou de double redirection.
- Les changements d’utilisateur isolent ou purgent le cache privé TanStack Query.
- SecureStore est réservé à la session et aux valeurs sensibles locales nécessaires.
- `profiles.id` est lié à `auth.users.id`.
- Les lignes privées utilisent `auth.uid()` dans les policies.
- Ne jamais utiliser `service_role` dans React Native.
- Toute évolution SQL passe par une nouvelle migration versionnée.
- Ne jamais modifier une migration déjà appliquée.
- Aucun accès global ou policy `anon` ne doit être ajouté aux tables privées.
- Ne jamais logger données médicales, e-mails, mots de passe, JWT, tokens ou clés.
- Une absence normale de ligne ne doit jamais être classée comme une erreur RLS.
- Tester l’isolation entre deux utilisateurs et les changements de session.
