---
name: drepa-documentation
description: Règles de documentation permanente et de cohérence du dépôt DRÉPA.
---

# DRÉPA Documentation

- `docs/project-file-reference.md` décrit chaque fichier source, configuration, migration, asset et documentation utile.
- Tout nouveau fichier doit être ajouté à cette référence.
- Toute modification significative doit mettre à jour son rôle, ses dépendances et ses risques.
- Les fichiers absents mais prévus doivent rester explicitement signalés.
- Ne pas modifier `DREPA-Cahier.md`, `README.md` ou `docs/` pendant une tâche de code, sauf demande explicite.
- Ne pas modifier une migration Supabase déjà appliquée.
- Ne jamais copier `.env.local`, `.env`, tokens, mots de passe ou clés dans un document.
- Utiliser les noms exacts des tables, notamment `community_comments`, `community_post_reactions` et `user_consents`.
- Faire correspondre migrations, types `database.types.ts`, requêtes et diagrammes.
- Documenter les nouveaux flux d’authentification, d’onboarding, de cache ou de RLS.
- Distinguer le code réellement disponible des fonctionnalités prévues.

Après une évolution, documenter les fichiers créés/modifiés/supprimés, les responsabilités, dépendances, données, routes, risques et validations.
