# Documentation DRÉPA

Ce dossier rassemble la documentation de conception du MVP Android de DRÉPA. Le produit est une application mobile de suivi personnel et d'accompagnement pour les personnes vivant avec la drépanocytose. Il ne remplace ni un professionnel de santé ni un service d'urgence.

## Documents disponibles

| Document | Description |
|---|---|
| [`../DREPA-Cahier.md`](../DREPA-Cahier.md) | Cahier des charges fonctionnel et technique de référence. |
| [`plan-technique-initialisation.md`](plan-technique-initialisation.md) | Plan d'initialisation du socle Expo, de Supabase et de la première semaine. |
| [`design-decisions.md`](design-decisions.md) | Décisions de conception validées pour le MVP. |
| [`mvp-scope.md`](mvp-scope.md) | Périmètre, limites, planning et critères d'acceptation du MVP. |

## Ordre de lecture recommandé

1. Lire le cahier des charges pour comprendre le besoin, le public cible et les exigences fonctionnelles.
2. Lire les décisions de conception pour connaître les règles qui précisent ou complètent le cahier des charges.
3. Lire le périmètre du MVP pour distinguer les fonctionnalités livrées des fonctionnalités exclues.
4. Lire le plan technique d'initialisation avant toute mise en œuvre.

## Socle technique du MVP

- React Native avec Expo et TypeScript ;
- Expo Router pour la navigation ;
- Supabase Auth et PostgreSQL avec Row Level Security ;
- Supabase Edge Functions pour les opérations serveur privilégiées ;
- TanStack Query pour les données serveur ;
- React Hook Form et Zod pour les formulaires et leur validation ;
- Expo SecureStore pour la session locale ;
- notifications locales et localisation utilisée uniquement avec consentement ;
- EAS Build pour produire l'APK Android.

Android est la seule plateforme développée, testée et livrée dans le MVP.

## Principes obligatoires

- protéger les données privées et sensibles par des politiques RLS ;
- ne jamais placer de secret serveur dans l'application mobile ou la documentation ;
- limiter la collecte aux données nécessaires ;
- obtenir un consentement explicite et versionné ;
- prévoir les états de chargement, d'erreur réseau et d'absence de permission ;
- présenter les statistiques comme un suivi descriptif personnel ;
- ne fournir aucun diagnostic, aucune prescription et aucune prédiction de crise ;
- rappeler que le SOS dépend du téléphone, du réseau, des permissions et des services disponibles.

## Autorité documentaire

En cas d'ambiguïté, les décisions consignées dans `design-decisions.md` précisent le cahier des charges pour le MVP. Toute évolution doit être documentée avant sa mise en œuvre.
