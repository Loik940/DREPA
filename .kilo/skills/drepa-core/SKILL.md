---
name: drepa-core
description: Règles permanentes de développement et de validation du projet mobile DRÉPA.
---

# DRÉPA Core

## Stack et périmètre

- React Native, Expo SDK 57, TypeScript et Expo Router.
- Supabase Auth, PostgreSQL, RLS, Edge Functions et migrations versionnées.
- TanStack Query, React Hook Form, Zod, SecureStore, Notifications, Location et EAS Build.
- Android est la seule plateforme livrée dans le MVP.
- Ne pas utiliser Kotlin, Flutter, Android natif ou PWA.

Le parcours authentification/onboarding existe déjà. Implémenter ensuite par lots validables : design system, journal, médicaments/rappels, contacts/SOS, ressources, communauté/modération, puis tests et livraison.

## Avant toute modification

1. Lire les fichiers concernés et les règles documentaires.
2. Présenter les fichiers à créer ou modifier.
3. Expliquer le comportement et les risques.
4. Ne jamais remplacer ou supprimer un fichier sans autorisation explicite.
5. Ne pas modifier `DREPA-Cahier.md`, `README.md` ou `docs/` sans demande explicite.
6. Ne jamais ajouter de clé, token, mot de passe ou secret.

## Après modification

- Afficher les fichiers créés, modifiés et supprimés.
- Mettre à jour `docs/project-file-reference.md` si la modification est significative.
- Vérifier TypeScript, lint et les tests adaptés au lot.
- Signaler les validations non exécutées et les risques restants.
- Ne pas lancer de commande destructive sans confirmation.
