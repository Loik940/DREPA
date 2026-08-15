#  DRÉPA

## Ma santé, ma force, ma communauté.

DRÉPA est une application mobile Android francophone destinée à accompagner les personnes vivant avec la drépanocytose en Afrique francophone.

Le projet est porté par Oswald Loïk Tchegnon, développeur full-stack au Bénin et personne vivant avec la drépanocytose.

## Objectifs

DRÉPA vise à aider les utilisateurs à :

- suivre leur état de santé au quotidien ;
- conserver un historique personnel ;
- organiser leurs traitements prescrits ;
- recevoir des rappels ;
- contacter leurs proches en cas de besoin ;
- consulter des ressources fiables ;
- échanger avec une communauté de soutien.

## Fonctionnalités actuellement implémentées

- authentification ;
- profil utilisateur ;
- journal de santé ;
- historique et statistiques descriptives ;
- gestion des médicaments prescrits ;
- rappels locaux ;
- communauté et modération de base.

Les contacts d’urgence, le SOS et les ressources éducatives restent prévus mais ne sont pas encore livrés dans l’application actuelle.

## Stack prévue

- React Native ;
- Expo ;
- TypeScript ;
- Expo Router ;
- Supabase Auth ;
- Supabase PostgreSQL ;
- Supabase Edge Functions ;
- Supabase Row Level Security ;
- TanStack Query ;
- React Hook Form ;
- Zod ;
- Expo Notifications ;
- Expo Screen Capture ;
- Expo SecureStore ;
- EAS Build.

## État actuel

Le projet contient désormais l’application Expo Android, les migrations Supabase, les tests automatisés, les workflows CI/EAS et les premiers lots fonctionnels. La validation juridique, la recette Android physique et certains modules du MVP restent à terminer.

Les diagrammes fonctionnels, techniques et de séquence sont disponibles dans le dossier [`docs/`](./docs/).

## Documentation

- [Cahier des charges](./DREPA-Cahier.md)
- [Documentation technique](./docs/README.md)
- [Architecture](./docs/architecture.md)
- [Cas d'utilisation](./docs/use-cases.md)
- [Diagramme de classes](./docs/class-diagram.md)
- [Schéma de base de données](./docs/database-schema.md)
- [Décisions de conception](./docs/design-decisions.md)

## Avertissement médical

DRÉPA est un outil d'accompagnement et de suivi personnel. L'application ne fournit pas de diagnostic, ne prescrit aucun traitement et ne remplace pas un professionnel de santé ou un service d'urgence.

## Programme

Projet développé dans le cadre du programme Imọlẹ Build — 30 jours.

## Licence

La licence du projet sera définie ultérieurement.
