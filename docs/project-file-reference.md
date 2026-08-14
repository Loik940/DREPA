# Référence des fichiers du projet DRÉPA

Document permanent de cartographie technique du dépôt DRÉPA.

Date de rédaction : 25 juillet 2026.  
Dernier commit de référence : non renseigné dans ce document.

## 1. Objectif du document

Ce fichier sert de carte technique du projet DRÉPA. Il relie les fichiers de configuration, les routes Expo Router, les sources TypeScript, les migrations Supabase, les assets et la documentation de conception.

Il doit être mis à jour après chaque modification significative : nouveau fichier, suppression, changement de responsabilité, nouvelle route, nouvelle migration, changement de dépendance ou évolution d’un flux de sécurité.

Cette référence décrit l’état réel observé dans le dépôt. Les routes ou dossiers uniquement prévus dans les documents mais absents du code sont signalés comme tels.

Les répertoires générés ou volumineux suivants sont volontairement exclus : `node_modules/`, `.expo/`, `.kilo/`, `.git/`, `supabase/.temp/`, `dist/`, `coverage/` et les autres fichiers temporaires ou générés automatiquement.

## 2. Règles de documentation

Chaque nouveau fichier ou chaque fichier modifié doit être documenté avec :

- son chemin ;
- son rôle ;
- ses responsabilités ;
- ses dépendances importantes ;
- les données manipulées ;
- les routes ou composants concernés ;
- les risques éventuels ;
- la date ou le commit de dernière mise à jour lorsque cette information est disponible.

Les valeurs de `.env.local`, `.env`, clés API, tokens, mots de passe, certificats privés et secrets ne sont jamais copiés dans cette référence. Seuls les noms de variables ou de dépendances nécessaires à la compréhension de l’architecture peuvent être mentionnés.

## 3. Architecture générale

DRÉPA est une application mobile Android francophone destinée à l’accompagnement et au suivi personnel des personnes vivant avec la drépanocytose. Elle ne fournit ni diagnostic, ni prescription, ni prédiction de crise et ne remplace pas un professionnel de santé ou un service d’urgence.

- **React Native** fournit le runtime mobile.
- **Expo SDK 57** fournit le workflow managed/CNG, les modules natifs et les outils de développement.
- **TypeScript** impose le typage strict des routes, services, schéma de données et formulaires.
- **Expo Router** utilise l’arborescence `app/` pour les routes publiques, les contrôles d’onboarding et les onglets protégés.
- **Supabase Auth** gère l’inscription, la connexion, la restauration de session, la déconnexion et la récupération du mot de passe.
- **Supabase PostgreSQL** stocke les profils, consentements, données privées de suivi et contenus du premier lot Communauté.
- **Supabase Edge Functions** portent les opérations serveur privilégiées, notamment la suppression de compte ; le dépôt contient actuellement `supabase/functions/delete-account/index.ts`.
- **Row Level Security (RLS)** limite les accès aux lignes appartenant à l’utilisateur authentifié et protège les opérations administratives côté Supabase.
- **TanStack Query** gère le cache et les requêtes de données serveur.
- **React Hook Form** gère les formulaires React Native.
- **Zod** valide les données d’authentification, de consentement et de profil.
- **Expo SecureStore** conserve localement la session Supabase ; il ne doit pas servir à stocker des données médicales.
- **Expo Notifications** présente et programme les rappels locaux génériques, y compris au premier plan.
- **React Native Community DateTimePicker** fournit les calendriers et sélecteurs d’heure natifs sans saisie clavier.
- **Expo Location** est installé pour les parcours futurs nécessitant une localisation avec consentement.
- **EAS Build** produit les development builds et APK Android.

## 4. Arborescence documentée

```text
DREPA/
├── .env.example
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── eas-preview.yml
│       └── quality.yml
├── .gitignore
├── DREPA-Cahier.md
├── README.md
├── app.config.js
├── eas.json
├── eslint.config.js
├── expo-env.d.ts
├── package-lock.json
├── package.json
├── tsconfig.json
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── auth/
│   │   │   └── callback.tsx
│   │   ├── forgot-password.tsx
│   │   ├── legal.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── reset-password.tsx
│   └── (app)/
│       ├── _layout.tsx
│       ├── complete-profile.tsx
│       ├── consent.tsx
│       ├── community/
│       │   ├── [id].tsx
│       │   ├── new.tsx
│       │   └── report.tsx
│       ├── admin/
│       │   ├── _layout.tsx
│       │   ├── moderation.tsx
│       │   └── report/
│       │       └── [id].tsx
│       ├── medication-form.tsx
│       ├── medication/
│       │   ├── [id].tsx
│       │   └── [id]/edit.tsx
│       ├── profile-edit.tsx
│       └── (tabs)/
│           ├── _layout.tsx
│           ├── community.tsx
│           ├── index.tsx
│           ├── journal.tsx
│           ├── medications.tsx
│           └── profile.tsx
├── assets/
│   ├── expo.icon/
│   └── images/
├── docs/
├── src/
│   ├── components/
│   ├── constants/
│   ├── features/
│   │   ├── community/
│   │   │   ├── components/
│   │   │   │   ├── CommentCard.tsx
│   │   │   │   ├── CommunityEmptyState.tsx
│   │   │   │   ├── CommunityFilters.tsx
│   │   │   │   ├── CommunityHeader.tsx
│   │   │   │   ├── CommunitySafetyBanner.tsx
│   │   │   │   ├── PostCard.tsx
│   │   │   │   └── SupportButton.tsx
│   │   │   ├── categories.ts
│   │   │   ├── community.test.ts
│   │   │   ├── errors.ts
│   │   │   ├── format.test.ts
│   │   │   ├── format.ts
│   │   │   ├── mutations.ts
│   │   │   ├── payload.ts
│   │   │   ├── queries.ts
│   │   │   └── schemas.ts
│   │   ├── moderation/
│   │   │   ├── components/
│   │   │   │   ├── ModerationDecisionForm.tsx
│   │   │   │   ├── ModerationEmptyState.tsx
│   │   │   │   ├── ModerationHistoryList.tsx
│   │   │   │   ├── ModerationReportCard.tsx
│   │   │   │   └── ModerationStatusBadge.tsx
│   │   │   ├── errors.ts
│   │   │   ├── moderation.test.ts
│   │   │   ├── mutations.ts
│   │   │   ├── queries.ts
│   │   │   ├── schemas.ts
│   │   │   └── types.ts
│   │   └── profile/
│   │       └── components/
│   │           └── ProfileForm.tsx
│   ├── lib/
│   ├── providers/
│   ├── services/
│   ├── theme/
│   └── types/
└── supabase/
    ├── .gitignore
    ├── config.toml
    ├── functions/
    │   └── delete-account/
    │       └── index.ts
    ├── migrations/
    └── seed.sql
```

`node_modules/`, `.expo/`, `.kilo/`, `.git/`, `supabase/.temp/`, `dist/`, `coverage/` et les fichiers secrets locaux ne font pas partie de cette arborescence documentée.

## 5. Fichiers racine

| Fichier | Rôle et contenu principal | Utilisé par | Données, précautions et risques |
|---|---|---|---|
| `README.md` | Présentation du produit, objectifs, fonctionnalités prévues, stack, état du projet et avertissement médical. | Développeurs, contributeurs et lecteurs du dépôt. | Ne pas y ajouter de clé, donnée patient ou promesse médicale non validée. Le texte décrit aussi des fonctionnalités futures qui ne sont pas toutes implémentées. |
| `DREPA-Cahier.md` | Cahier des charges fonctionnel et technique de référence : public cible, MVP, limites médicales, sécurité, navigation et exigences métier. | Documentation, décisions d’architecture et futures implémentations. | Document de référence à préserver. Toute évolution fonctionnelle doit rester compatible avec ce cahier ou être documentée avant mise en œuvre. |
| `package.json` | Manifeste Node : point d’entrée Expo Router, dépendances Expo/React Native/Supabase, DateTimePicker natif, AsyncStorage pour la préférence de bienvenue, scripts de développement, lint, tests, typecheck et builds EAS. | npm, Expo CLI, Jest, ESLint et EAS CLI. | Les versions Expo doivent rester alignées sur SDK 57. Les packages Expo doivent être installés avec `npx expo install`. L’override npm `uuid: 11.1.1` corrige la vulnérabilité transitive de `xcode` sans rétrograder Expo. |
| `package-lock.json` | Verrouille l’arbre exact des dépendances npm. | npm install et les environnements CI/build. | Ne pas modifier manuellement. Une modification de `package.json` doit être suivie d’une régénération contrôlée du lockfile. |
| `app.config.js` | Configuration Expo CommonJS : identité DRÉPA, plateforme Android, schéma de deep link, icône, permission `android.permission.SCHEDULE_EXACT_ALARM`, plugins dont DateTimePicker, splash natif DRÉPA, expériences et identifiant EAS. | Expo CLI, EAS CLI et les builds Android. | Conserver `name: DREPA`, `slug: drepa`, `scheme: drepa`, `platforms: ['android']`, `bj.drepa.app`, l’icône adaptative, les plugins et `extra.eas.projectId`. Le splash natif utilise le fond bordeaux et `drepa-splash-icon.png`; toute modification exige un nouveau build Android. Ne jamais y placer de secret. |
| `eas.json` | Profils EAS `development`, `preview` et `production`, tous configurés pour Android. | EAS Build. | Le profil development utilise `expo-dev-client` et produit un APK interne. Aucun secret ou identifiant Supabase ne doit être ajouté ici. |
| `tsconfig.json` | Étend la configuration Expo, active le mode strict, les types Jest et les alias `@/*` vers `src/*` et `@/assets/*` vers `assets/*`. | TypeScript, Babel/Jest et l’éditeur. | Les alias doivent rester cohérents avec les imports. Ne pas désactiver `strict` pour masquer une erreur de contrat. |
| `eslint.config.js` | Configuration ESLint flat basée sur `eslint-config-expo`, avec exclusion de `dist`. | `npm run lint`. | Toute règle désactivée doit être justifiée. Les fichiers générés ne doivent pas être ajoutés au lint sans nécessité. |
| `expo-env.d.ts` | Référence automatique aux types Expo. | TypeScript et l’éditeur. | Fichier généré à ne pas éditer manuellement. Il est ignoré par Git selon `.gitignore`. |
| `.env.example` | Noms vides des variables publiques attendues : `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` et `EXPO_PUBLIC_APP_ENV`. | Configuration locale et documentation de l’environnement. | Ne contient aucune valeur réelle. Les fichiers `.env` et `.env.local` restent ignorés et ne doivent jamais être lus ou commités dans cette référence. |
| `.gitignore` | Exclut dépendances, builds, environnements locaux, secrets, certificats, logs, caches et fichiers Expo générés. | Git. | Toute nouvelle source de secret ou de fichier généré doit être ajoutée ici sans ignorer des fichiers source utiles. |

### Automatisation GitHub

| Fichier | Rôle et déclenchement | Dépendances | Sécurité, limites et validation humaine |
|---|---|---|---|
| `.github/workflows/quality.yml` | CI « Qualité et sécurité » lancée sur les push vers `main`, les pull requests ciblant `main` et à la demande. Elle exécute l'installation déterministe, TypeScript, ESLint, Jest hors `.kilo`, les contrôles Expo et l'audit critique des dépendances de production. | GitHub Actions, `actions/checkout` et `actions/setup-node` épinglées sur des SHA immuables avec commentaires de tag `v4`, Node.js 22, npm et les scripts de `package.json`. | Permissions limitées à `contents: read`, aucun secret Supabase requis et concurrence annulant les anciens contrôles d'une même référence. Le scan Git exclut `package-lock.json`, recherche seulement des motifs longs de clés réelles ou une affectation non vide de `SUPABASE_SERVICE_ROLE_KEY`, puis n'affiche que le chemin et la ligne. L'audit bloque au niveau critique afin de ne pas casser la CI sur l'advisory `high` Metro/`image-size` sans correctif compatible Expo SDK 57. Une personne reste responsable de l'analyse des échecs et de la fusion. |
| `.github/workflows/eas-preview.yml` | CD manuel « Build Android Preview » lancé uniquement avec `workflow_dispatch`. Il soumet à EAS un build Android utilisant le profil `preview` et retourne immédiatement avec `--no-wait`. | GitHub Actions, `actions/checkout`, `actions/setup-node` et `expo/expo-github-action` épinglées sur des SHA immuables avec commentaires de tags `v4`, `v4` et `v8`, Node.js 22, npm, EAS CLI et le profil `preview` d'`eas.json`. | Le secret GitHub `EXPO_TOKEN` est obligatoire dans l'environnement `preview`; sa présence est vérifiée sans afficher sa valeur. Les builds d'un même groupe ne sont pas annulés. Une protection d'environnement GitHub peut imposer une approbation avant accès au secret. Le résultat EAS doit être contrôlé et testé humainement. Aucun build ou déploiement Production n'est automatique. |
| `.github/dependabot.yml` | Planifie chaque lundi à 06:00, fuseau `Africa/Porto-Novo`, les propositions de mise à jour npm et GitHub Actions. | Service GitHub Dependabot, manifeste et lockfile npm, références d'actions dans `.github/workflows/`. | Limite les pull requests ouvertes à 5 pour npm et 3 pour GitHub Actions, avec des labels dédiés. Aucun automerge n'est configuré : chaque mise à jour doit passer par la CI, une revue et une fusion humaines. |

Flux CI et CD :

```text
push main / pull request vers main / lancement manuel
    → quality.yml
    → installation, TypeScript, ESLint, Jest, Expo, audit critique et scan de secrets
    → lecture et décision humaines

lancement manuel du workflow Preview
    → approbation éventuelle de l'environnement preview
    → vérification de EXPO_TOKEN
    → eas-preview.yml
    → build EAS Android preview non bloquant
    → téléchargement, recette et décision humaines
```

La Production n'est jamais construite, publiée ou déployée automatiquement par ces workflows. Les faux positifs Herozion sont corrigés par l'épinglage des actions et par des noms ou données de test moins ambigus, sans désactiver ni contourner le scanner.

## 6. Dossier `app/`

Les groupes entre parenthèses d’Expo Router organisent les écrans sans apparaître dans l’URL publique. Le groupe `(auth)` est public sous condition de session ; le groupe `(app)` est protégé par session et onboarding.

| Fichier / route | URL ou groupe | Rôle | Accès, dépendances et états |
|---|---|---|---|
| `app/_layout.tsx` | Layout racine | Configure une fois la présentation sonore et visuelle des notifications au premier plan, puis monte `AppProvider` et le `Stack` Expo Router. | Point d’entrée de tous les écrans. Ne doit pas contenir une redirection concurrente avec les guards enfants ni exposer le contenu d’un traitement. |
| `app/index.tsx` | `/` | Observe l’état Auth et redirige vers la bienvenue, la connexion ou les onglets protégés. | Affiche `BrandedSplashScreen` pendant la restauration réelle de la session et de la préférence de bienvenue, sans délai artificiel. L’erreur de configuration conserve son écran `Réessayer`. |
| `app/+not-found.tsx` | Absent actuellement | Route de fallback prévue dans la documentation mais non créée dans le code actuel. | À créer avant d’exposer des routes supplémentaires ; toute page inconnue devrait proposer un retour sûr. |
| `app/(auth)/_layout.tsx` | Groupe public `(auth)` | Protège les écrans publics contre une session déjà authentifiée et autorise le mode récupération. | Utilise `useAuth`, `Redirect`, `Stack` et `ScreenPlaceholder`. États de session `loading`, `error`, `authenticated` et récupération de mot de passe. |
| `app/(auth)/welcome.tsx` | `/welcome` | Onboarding visuel local en trois étapes avant l’authentification. | Utilise AsyncStorage uniquement pour la préférence non sensible d’accueil déjà vu. Ne collecte aucune donnée médicale et ne crée aucune session. Le périmètre actif est en mode clair uniquement. |
| `app/(auth)/login.tsx` | `/login` | Formulaire de connexion par e-mail et mot de passe. | React Hook Form, Zod, `useAuth`, `signIn` et redirection vers `/`. Erreurs d’authentification affichées sans token ni détail sensible. |
| `app/(auth)/register.tsx` | `/register` | Formulaire d’inscription et confirmation du mot de passe. | React Hook Form, Zod, `useAuth.signUp`. Si Supabase exige une confirmation e-mail, l’écran affiche une instruction et n’ouvre pas les routes protégées sans session. |
| `app/(auth)/forgot-password.tsx` | `/forgot-password` | Demande de récupération par e-mail. | Utilise `requestPasswordReset`, `expo-linking` via le service Auth et une réponse neutre pour ne pas révéler l’existence d’un compte. |
| `app/(auth)/reset-password.tsx` | `/reset-password` | Formulaire de nouveau mot de passe dans le contexte `PASSWORD_RECOVERY`. | Utilise le schéma Zod, `updatePassword`, SecureStore via Supabase Auth et retour à la connexion après succès. |
| `app/(auth)/legal.tsx` | `/legal` | Placeholder pour les documents légaux et les consentements versionnés. | Ne doit pas enregistrer un consentement avant identification. Les versions effectives sont centralisées dans `src/constants/legal-versions.ts`. |
| `app/(auth)/auth/callback.tsx` | `/auth/callback` | Échange les paramètres du deep link de confirmation contre une session Supabase puis revient au routeur d’onboarding. | Utilise `Linking.useURL()` pour recevoir le lien initial et les liens suivants avec abonnement et nettoyage gérés par Expo, conserve le garde anti-double traitement, masque les erreurs techniques et évite les doubles redirections du layout public. |
| `app/(app)/_layout.tsx` | Groupe protégé `(app)` | Vérifie la session puis le statut d’onboarding. | Utilise `useAuth`, `useOnboardingStatus`, `useSegments` et `ScreenPlaceholder`. Priorité : consentements, profil, onglets. Les erreurs de données proposent `Réessayer`. |
| `app/(app)/consent.tsx` | `/consent` | Enregistre l’acceptation des versions courantes des CGU, de la politique de confidentialité et de la charte communautaire. | Protégé par session. Utilise React Hook Form, Zod, `legalVersions` et `useAcceptConsentMutation`. Après succès, la requête est invalidée et l’utilisateur va vers `complete-profile`. |
| `app/(app)/complete-profile.tsx` | `/complete-profile` | Wrapper d’onboarding qui configure le formulaire partagé pour créer le profil requis puis ouvre les onglets. | Protégé par session et réservé au profil incomplet par le guard. Utilise `ProfileForm`; les données et la sauvegarde restent gérées dans le composant partagé. |
| `app/(app)/profile-edit.tsx` | `/profile-edit` | Wrapper d’édition qui configure le formulaire partagé puis revient à l’onglet Profil après sauvegarde. | Protégé par session et accessible lorsque l’onboarding est complet. Utilise `ProfileForm`; un profil incomplet est toujours redirigé vers `complete-profile` par le guard existant. |
| `app/(app)/health-entry.tsx` | `/health-entry` | Formulaire de nouvelle entrée du journal avec champs facultatifs et brouillon mémoire. | Protégé par session. Utilise React Hook Form, Zod et `useCreateHealthLogMutation`. Ne persiste aucune donnée médicale localement et conserve les valeurs en cas d’erreur réseau. |
| `app/(app)/health-log/[id].tsx` | `/health-log/:id` | Détail privé d’une entrée avec modification et suppression confirmée. | Charge avec `id + user_id`, affiche uniquement des données déclaratives et utilise des mutations filtrées par propriétaire. |
| `app/(app)/health-statistics.tsx` | `/health-statistics` | Statistiques descriptives des 30 derniers jours. | Charge uniquement les colonnes nécessaires, limite à 500 lignes et n’affiche aucun diagnostic, prédiction ou niveau de danger. |
| `app/(app)/(tabs)/_layout.tsx` | Groupe protégé `(app)/(tabs)` | Déclare les onglets principaux. | Accessible après session, consentements et profil complet. |
| `app/(app)/(tabs)/index.tsx` | Onglet accueil | Dashboard scalable : identité, action d’enregistrement, raccourcis, résumé conditionnel du journal et dernière activité. | Réutilise le cache Profil et la requête des entrées des 7 derniers jours. N’invente aucune donnée, n’ajoute pas de SOS et ne produit aucune interprétation médicale. |
| `app/(app)/(tabs)/journal.tsx` | Onglet journal | Affiche l’état vide ou les 50 entrées récentes et ouvre le formulaire de saisie. | Utilise `useHealthLogsQuery`, les états UI partagés et des données privées filtrées par `session.user.id`. Les informations restent descriptives. |
| `app/(app)/medication-form.tsx` | `/medication-form` | Wrapper de création qui relie le formulaire partagé à la session et revient à la liste après succès. | `useAuth`, `MedicationForm` et mutation de création compensatoire ; aucun accès direct aux champs natifs ou à Supabase dans le formulaire partagé. |
| `app/(app)/medication/[id].tsx` | `/medication/:id` | Affiche les informations déclarées, les horaires et les actions Modifier, Arrêter/Réactiver et Supprimer. | Lecture `id + user_id`, confirmations d’arrêt et de suppression, cascade en base puis annulation des notifications locales. Aucun conseil médical. |
| `app/(app)/medication/[id]/edit.tsx` | `/medication/:id/edit` | Construit les valeurs initiales depuis le traitement et ses rappels puis synchronise les modifications. | États loading, erreur et absence structurée ; le succès revient au détail. Les horaires inchangés conservent leur ligne et leur notification. |
| `app/(app)/(tabs)/medications.tsx` | Onglet médicaments | Affiche les traitements, ouvre leur détail et expose Pris, Reporter 10 min et Ignorer sur les rappels actionnables. | Charge uniquement les lignes du propriétaire, calcule les statuts localement et affiche une erreur neutre propre à chaque mutation. |
| `app/(app)/(tabs)/community.tsx` | Onglet communauté | Fil réel paginé par lots de 10 publications, avec filtres Tout, Questions et Témoignages, états de chargement/erreur/vide, soutien et accès au détail ou au signalement. | Utilise la session, les queries/mutations Communauté et les composants partagés. Un verrou local bloque les doubles appuis rapides sur Soutenir. L’avertissement médical reste visible et aucune donnée fictive n’est affichée. |
| `app/(app)/community/new.tsx` | `/community/new` | Formulaire de publication avec catégorie, texte limité à 2 000 caractères et acceptation obligatoire de la charte. | React Hook Form, Zod, `useCreatePostMutation` et session authentifiée. Un verrou synchrone bloque une double soumission. Le mobile envoie seulement `user_id`, catégorie et contenu ; le trigger Supabase impose `auth.uid()` et attribue l’alias communautaire stable. Après succès, la route ouvre la publication créée. |
| `app/(app)/community/[id].tsx` | `/community/:id` | Détail réel d’une publication, soutien, commentaires paginés par lots de 20, ajout de commentaire et retrait confirmé de son propre contenu. | Queries et mutations Communauté, formulaire Zod et composants partagés. La propriété affichée vient de `is_own`, sans UUID de membre dans les vues. Un verrou synchrone bloque les doubles commentaires. Le retrait est un soft delete ; les autres membres peuvent signaler. |
| `app/(app)/community/report.tsx` | `/community/report?postId=:id&commentId=:id?` | Formulaire de signalement d’une publication ou d’un commentaire, avec une cible unique, un motif contrôlé et des précisions facultatives limitées à 500 caractères. | Valide les paramètres, utilise `useReportMutation`, traite doublon et limite anti-spam, puis confirme la transmission à une modération humaine. Il ne décide ni ne masque un contenu dans le mobile. |
| `app/(app)/admin/_layout.tsx` | Groupe protégé `/admin` | Ajoute un guard de rôle au groupe administrateur et bloque tout affichage privilégié avant la vérification fraîche du rôle. | Utilise `useCurrentUserRoleQuery`, `useAuth` et TanStack Query. Un compte non administrateur voit un accès refusé ; les caches `moderation-queue`, `moderation-report` et `moderation-history` sont supprimés sans toucher aux caches publics Communauté. Les RPC restent l’autorité réelle. |
| `app/(app)/admin/moderation.tsx` | `/admin/moderation` | Affiche la file humaine des signalements avec les statuts `pending`, `reviewed` et `dismissed`, pagination stable et états chargement, erreur ou vide. | Utilise `useModerationQueueQuery` et les cartes de modération. Les données viennent de la RPC sûre et ne contiennent aucun `user_id`, e-mail ou donnée médicale. |
| `app/(app)/admin/report/[id].tsx` | `/admin/report/:id` | Affiche le détail d’un signalement, permet une décision explicite masquer/rejeter/restaurer et présente l’historique. | Utilise les queries de détail/historique, `useModerateCommunityReportMutation` et les composants de modération. Le double envoi est verrouillé, les erreurs restent neutres et aucune décision n’est automatique. |
| `app/(app)/(tabs)/profile.tsx` | Onglet profil | Présente l’identité, les informations de suivi, les paramètres disponibles, la déconnexion et la suppression sécurisée du compte. Le bouton `Modifier` ouvre `/profile-edit`. | Utilise `useProfileQuery`, `useCurrentUserRoleQuery`, les composants Profil, Expo Router et `useAuth`. L’entrée Administration est transmise aux paramètres uniquement lorsque la requête de rôle retourne `admin`. La suppression passe par l’Edge Function après confirmation explicite. |

Les routes métier du SOS et des ressources éducatives restent absentes. Le premier lot Communauté et son interface de modération administrative humaine sont désormais présents. L’attribution du rôle `admin` reste exclusivement côté Supabase et aucun formulaire mobile ne peut modifier un rôle.

## 7. Dossier `src/`

### `src/components/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/components/screen-placeholder.tsx` | Composant d’état neutre pour les écrans de chargement, erreur ou fonctionnalité différée. Il accepte une action optionnelle comme `Réessayer`. | React Native uniquement. Conserver l’absence de données métier et ne pas y afficher de secret ou de diagnostic médical. |

### `src/components/ui/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/components/ui/AppText.tsx` | Texte typé avec variantes de typographie et couleur du thème actif. | `useAppTheme`, tokens typography. Ne pas utiliser de taille ou couleur locale sans justification. |
| `src/components/ui/BrandedSplashScreen.tsx` | Relais React du splash natif avec identité DRÉPA, slogan et trois points animés. | `Animated`, `AccessibilityInfo`, `StatusBar`, `expo-symbols` et tokens du thème. Respecte la réduction des animations, ne crée aucun délai et ne charge aucune donnée. |
| `src/components/ui/OnboardingIllustration.tsx` | Illustrations locales légères en formes React Native pour les trois slides de bienvenue. | `useAppTheme`, tokens de rayons. Aucun asset distant ou contenu médical réel ; conserver un rendu performant hors ligne. |
| `src/components/ui/ScreenContainer.tsx` | Conteneur Safe Area avec variantes scroll et fond de thème. | `react-native-safe-area-context`, `useAppTheme`. Conserver le support du clavier et des petits écrans. |
| `src/components/ui/Button.tsx` | Boutons primaire, brand, secondaire, ghost et danger avec chargement et accessibilité. | Tokens couleurs, tailles et rayons. Ne pas utiliser `danger` pour une action ordinaire. |
| `src/components/ui/TextField.tsx` | Champ texte partagé avec label, erreur, aide et élément à droite. | React Native, thème. Ne jamais afficher de valeur sensible dans les erreurs ou logs. |
| `src/components/ui/PasswordField.tsx` | Champ mot de passe avec affichage/masquage local et accessibilité. | `TextField`, React state. Ne pas persister ni loguer la valeur. |
| `src/components/ui/CheckboxRow.tsx` | Case à cocher accessible avec label et erreur. | Thème et React Native. Utilisé pour les consentements ; ne doit pas accepter silencieusement un consentement non visible. |
| `src/components/ui/Card.tsx` | Surface standard pour regrouper des informations. | Thème et ombres légères. Ne pas y placer des données fictives présentées comme réelles. |
| `src/components/ui/StatusBanner.tsx` | Bandeau d’information, succès, avertissement ou erreur. | Tokens sémantiques. Ne pas transmettre un diagnostic par la couleur seule. |
| `src/components/ui/LoadingState.tsx` | État de chargement léger et commun. | ActivityIndicator et thème. Éviter les animations coûteuses. |
| `src/components/ui/EmptyState.tsx` | État vide avec titre, description et action facultative. | Button et AppText. Une absence de donnée doit rester un état normal. |
| `src/components/ui/ErrorState.tsx` | Erreur neutre avec action Réessayer. | Button et AppText. Les détails techniques sont réservés aux panneaux de développement contrôlés. |

### `src/constants/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/constants/legal-versions.ts` | Centralise les versions `terms-v1`, `privacy-v1` et `community-v1` utilisées pour déterminer les consentements courants. | Utilisé par `consent.tsx`, `mutations.ts` et `completion.ts`. Toute modification de version doit être synchronisée avec les documents légaux et produire une nouvelle acceptation. |

### `src/features/auth/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/auth/auth-service.ts` | Encapsule `signUp`, `signIn`, `signOut`, la demande de récupération et la mise à jour du mot de passe. | Dépend de `expo-linking` et `src/lib/supabase.ts`. Ne retourne jamais de secret à l’interface et conserve les messages d’erreur génériques. |
| `src/features/auth/schemas.ts` | Schémas Zod pour connexion, inscription, récupération et nouveau mot de passe. La politique locale impose au moins 8 caractères. | Utilisé par les routes `(auth)`. Ne pas loguer les valeurs des champs. |
| `src/features/auth/schemas.test.ts` | Tests unitaires des e-mails, mots de passe et confirmations. | Jest/Babel ; utilise uniquement des valeurs de test non réelles assemblées à l'exécution afin d'éviter les faux positifs du scanner. |

### `src/features/profile/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/profile/queries.ts` | Requêtes TanStack Query pour `profiles` et `user_consents`. `profiles` utilise `maybeSingle()` afin que l’absence de ligne retourne `null`. Les erreurs sont classées en configuration, réseau, RLS, Supabase ou inconnues. | Dépend de Supabase et `database.types.ts`. Les identifiants viennent de `auth.users.id`; aucune requête ne doit utiliser un identifiant fourni par l’utilisateur. |
| `src/features/profile/mutations.ts` | `upsert` du profil et insertion des consentements versionnés. Invalide les clés TanStack Query correspondantes après succès. | Dépend de Supabase, `legal-versions`, `queries` et des schémas. La RLS reste l’autorité d’accès. |
| `src/features/profile/completion.ts` | Calcule `needs-consent`, `needs-profile`, `complete` et `error`. Une liste vide de consentements ou un profil `null` sont des états d’onboarding normaux. | Dépend des versions légales et des types de consentement. Ne doit pas effectuer de requête réseau. |
| `src/features/profile/use-onboarding-status.ts` | Combine l’utilisateur Auth, les requêtes profil/consentements, l’état de chargement, l’erreur structurée et le `refetch`. | Utilisé par `app/(app)/_layout.tsx`. La priorité est toujours `needs-consent → needs-profile → complete`. |
| `src/features/profile/schemas.ts` | Valide les champs de profil et les trois consentements obligatoires. | React Hook Form et Zod. Les champs facultatifs restent bornés avant envoi à PostgreSQL. |
| `src/features/profile/profile-flow.test.ts` | Vérifie les consentements courants, les consentements révoqués et les transitions d’onboarding. | Jest/Babel ; ne se connecte pas à Supabase. |

### `src/features/profile/components/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/profile/components/ProfileHeader.tsx` | Carte d’identité du profil avec initiales dérivées, nom d’affichage et localisation disponible. | `Profile`, composants UI et tokens. Ne doit jamais utiliser de nom ou de localisation fictifs. |
| `src/features/profile/components/ProfileForm.tsx` | Formulaire partagé entre finalisation de l’onboarding et édition du profil. Préremplit tous les champs existants, valide avec Zod et conserve les états de chargement et d’erreur. | `useAuth`, `useProfileQuery`, `useUpsertProfileMutation`, React Hook Form, `profileSchema` et composants UI. L’identité vient uniquement de la session ; les informations de suivi sont déclaratives et ne constituent pas un document médical. |
| `src/features/profile/components/ProfileInfoCard.tsx` | Présente les informations de suivi et les valeurs facultatives avec `Non renseigné`. | `Profile`, Card et AppText. Le groupe sanguin est explicitement marqué comme déclaré, non validé médicalement. |
| `src/features/profile/components/ProfileContactSection.tsx` | État visuel réservé aux futurs contacts d’urgence. | Aucun accès réseau et aucun contact fictif ; ne déclenche pas de SOS. |
| `src/features/profile/components/ProfileSettingsList.tsx` | Liste des paramètres disponibles et différés, avec accès aux conditions d’utilisation et entrée Administration conditionnelle. | Reçoit ses callbacks de la route Profil. L’entrée Administration n’existe dans le rendu que si `useCurrentUserRoleQuery` a confirmé le rôle `admin`; les lignes différées restent non actionnables. |

### `src/features/dashboard/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/dashboard/index.ts` | Exporte les composants visuels du dashboard. | Utilisé par l’Accueil ; ne contient pas de requête ou de donnée fictive. |
| `src/features/dashboard/dashboard.ts` | Fonctions pures pour aplatir les pages du journal, sélectionner l’activité récente, calculer le résumé et formater les valeurs non déclarées. | Réutilise les statistiques health-log ; aucun accès réseau. |
| `src/features/dashboard/DashboardHeader.tsx` | En-tête DRÉPA avec salutation, date et avatar dérivé du profil. | Tokens du thème et `AppText` ; ne doit pas afficher l’e-mail ou une identité inventée. |
| `src/features/dashboard/FeelingPromptCard.tsx` | Carte « Comment te sens-tu aujourd’hui ? » qui ouvre le Journal existant. | Expo Router et composants UI ; ne crée aucune entrée seule. |
| `src/features/dashboard/DashboardShortcuts.tsx` | Grille 2×2 vers Journal, Médicaments, Communauté et Profil. | Expo Router, Card et tokens ; les fonctions futures sont explicitement indiquées. |
| `src/features/dashboard/DashboardWeeklySummary.tsx` | Résumé descriptif des entrées réelles des 7 derniers jours. | Statistiques health-log ; `null` devient `—`, aucune interprétation médicale. |
| `src/features/dashboard/DashboardRecentActivity.tsx` | Dernière activité réellement enregistrée dans le Journal. | Données `health_logs` uniquement ; aucune activité fictive si la liste est vide. |
| `src/features/dashboard/DashboardState.tsx` | États chargement/erreur du dashboard avec action `Réessayer`. | React Native, Card et tokens ; messages utilisateur neutres. |
| `src/features/dashboard/dashboard.test.ts` | Tests des calculs, pages vides, dernière entrée et valeurs non déclarées. | Jest/Babel ; données synthétiques sans donnée médicale réelle. |

### `src/features/health-log/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/health-log/schemas.ts` | Schéma Zod et valeurs par défaut d’une entrée partielle du journal. | Zod. Borne douleur/fatigue de 0 à 10, limite les textes et refuse les dates futures sans interprétation médicale. |
| `src/features/health-log/schemas.test.ts` | Tests unitaires du contrat du journal. | Jest/Babel. Utilise uniquement des valeurs fictives et vérifie entrée partielle, bornes, date et longueur. |
| `src/features/health-log/errors.ts` | Erreurs structurées du journal : session, réseau, RLS, absence, Supabase et configuration. | Nettoie JWT, tokens et secrets avant tout diagnostic de développement. |
| `src/features/health-log/errors.test.ts` | Tests de classification et de nettoyage des erreurs. | Vérifie 401, 403, 42501, réseau, absence et masquage de secrets. |
| `src/features/health-log/queries.ts` | Historique paginé, détail propriétaire et source statistique limitée. | Supabase, TanStack Query, AuthProvider. Attend une session prête, inclut `user.id` dans les query keys et filtre par `user_id`. |
| `src/features/health-log/mutations.ts` | Crée, modifie et supprime une entrée avec invalidation ciblée du cache. | Supabase et TanStack Query. Injecte `session.user.id` et filtre update/delete par `id + user_id`. |
| `src/features/health-log/options.ts` | Libellés stables des symptômes, facteurs, hydratation et prise déclarée. | Utilisé par le formulaire, le détail et les statistiques. N’ajoute aucune interprétation médicale. |
| `src/features/health-log/payload.ts` | Normalisation pure du payload Supabase. | Convertit champs vides en `null`, température décimale et préserve `false`. |
| `src/features/health-log/payload.test.ts` | Tests de normalisation du payload. | Vérifie valeurs vides, décimales, booléens et date explicite. |
| `src/features/health-log/statistics.ts` | Calcule moyennes descriptives, jours suivis et fréquences. | Fonction pure sans accès réseau ni conclusion médicale. |
| `src/features/health-log/statistics.test.ts` | Tests des statistiques descriptives. | Vérifie moyennes, fréquences, jours uniques et historique vide. |
| `src/features/health-log/components/ScoreSelector.tsx` | Sélecteur accessible de score facultatif de 0 à 10. | Composants UI et thème clair. Le token logique `high` est mappé vers la couleur `sos` existante uniquement au rendu ; la valeur ne constitue pas un niveau de danger médical. |
| `src/features/health-log/components/ChoiceChips.tsx` | Chips accessibles pour choix multiples ou unique. | Composants UI et thème clair. Les options sont déclaratives et ne produisent aucune conclusion médicale. |
| `src/features/health-log/components/score.ts` | Calcul pur du token de couleur descriptif associé à un score, avec `high` pour les valeurs de 7 à 10. | Aucun accès réseau ; `null` reste neutre et le nom logique évite un faux positif Herozion. |
| `src/features/health-log/components/ScoreSelector.test.ts` | Teste les états neutre, succès, vigilance et haut du sélecteur de score. | Jest/Babel ; les couleurs restent descriptives et non diagnostiques. |

### `src/features/medications/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/medications/schemas.ts` | Valide le traitement prescrit, les dates et les horaires `HH:MM`. | Zod ; aucun nom, dosage ou horaire par défaut n’est inventé. |
| `src/features/medications/date-time.ts` | Convertit de façon pure les dates locales `AAAA-MM-JJ` et les heures `HH:MM` vers ou depuis `Date`. | Utilise uniquement les composantes locales de `Date` afin d’éviter un décalage UTC ; refuse les formats et dates invalides. |
| `src/features/medications/date-time.test.ts` | Vérifie le formatage, le parsing, l’heure sur 24 heures et l’aller-retour sans conversion UTC. | Jest et données calendaires synthétiques uniquement ; aucun accès réseau ou contenu médical. |
| `src/features/medications/errors.ts` | Classe les erreurs session, réseau, RLS et Supabase du module. | Messages utilisateur neutres ; aucun token ou détail sensible affiché. |
| `src/features/medications/queries.ts` | Charge le tableau de bord et le détail d’un traitement avec ses rappels. | Supabase, TanStack Query et `sessionReady`; clés isolées par `user.id`, filtres `user_id` explicites et absence structurée après `maybeSingle`. |
| `src/features/medications/mutations.ts` | Couvre création, modification synchronisée, arrêt, réactivation, suppression, prise, report et ignorance. | Toutes les écritures sont filtrées par `user_id`. Les nouvelles notifications sont compensées en cas d’échec ; une suppression DB réussie déclenche ensuite l’annulation locale des rappels quotidiens et reports. |
| `src/features/medications/notifications.ts` | Configure le canal, la permission, les rappels quotidiens, le test et le report local de dix minutes. | Expo Notifications avec son du canal via `true`. Tous les messages sont génériques, sans nom de médicament ni dosage. |
| `src/features/medications/components/MedicationForm.tsx` | Formulaire partagé de création et d’édition avec validation, dates, horaires et test générique de notification. | React Hook Form, Zod et composants UI ; ne lit pas Supabase, ne connaît pas la session et reçoit la sauvegarde par prop. |
| `src/features/medications/components/DatePickerField.tsx` | Champ accessible qui ouvre le calendrier natif, affiche la date en français et conserve `AAAA-MM-JJ` dans le formulaire. | DateTimePicker, design system et `date-time.ts`. Aucun clavier ; la date de fin peut être effacée et bornée par la date de début. |
| `src/features/medications/components/ReminderTimesField.tsx` | Champ accessible qui ajoute des heures natives sur 24 heures et les affiche en chips supprimables. | DateTimePicker, composants UI, `date-time.ts` et `parseReminderTimes`. Les heures sont uniques, triées et jamais saisies manuellement. |
| `src/features/medications/status.ts` | Calcule l’horaire original, l’horaire effectif, l’intake lié et les statuts `late`, `pending`, `taken`, `snoozed`, `skipped`. | Un report reste `snoozed` avant `snoozed_until`, puis devient `late`; fonction pure sans interprétation médicale. |
| `src/features/medications/components/ReminderCard.tsx` | Carte horizontale avec badge et actions accessibles Pris, Reporter 10 min et Ignorer. | Les actions sont absentes pendant une mutation ainsi que pour `taken` et `skipped`; libellés et couleurs communiquent ensemble l’état. |
| `src/features/medications/components/MedicationCard.tsx` | Carte pressable d’un traitement réellement saisi. | Affiche le contenu existant, l’état et un chevron ; le rôle et l’indication d’accessibilité annoncent l’ouverture du détail. |
| `src/features/medications/components/MedicationInfoCard.tsx` | Mention de prudence concernant les traitements prescrits. | Contenu générique non médical et sans dosage conseillé. |
| `src/features/medications/medications.test.ts` | Tests des horaires, validation, erreurs RLS, intakeId, prise, ignorance et report avant/après l’heure effective. | Jest/Babel et fonctions pures uniquement ; aucun composant natif importé et aucune donnée médicale réelle. |

### `src/features/community/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/community/categories.ts` | Centralise les cinq catégories `testimony`, `question`, `motivation`, `daily_life`, `resources`, les trois filtres du fil et les six motifs de signalement avec leurs libellés français. | Contrat partagé par les formulaires, filtres, schémas, formatage et types Supabase. La catégorie Conseils n’existe pas dans ce lot. |
| `src/features/community/schemas.ts` | Schémas Zod des publications, commentaires et signalements. | Publication limitée à 2 000 caractères avec charte obligatoire, commentaire à 1 000 et précisions de signalement à 500. Les textes sont nettoyés de leurs espaces extérieurs avant mutation. |
| `src/features/community/errors.ts` | Classe les erreurs de session, configuration, réseau, RLS, absence, limite anti-spam, doublon, Supabase et inconnues. | Transforme les codes contrôlés `42501`, `PGRST116`, `P0001` et `23505` en messages neutres sans exposer le contenu technique. |
| `src/features/community/queries.ts` | Charge le fil, le détail et les commentaires depuis `community_posts_feed` et `community_comments_feed`, avec des clés TanStack Query isolées par `userId`. Ajoute au résultat le soutien du membre connecté. | Supabase, AuthProvider, types de base et TanStack Query. Les vues excluent les contenus masqués ou supprimés et ne révèlent aucun UUID de membre ; `is_own` porte la propriété. Le fil est paginé par 10 et les commentaires par 20 avec tri stable `created_at + id`. |
| `src/features/community/mutations.ts` | Crée les publications/commentaires, effectue leur soft delete propriétaire, ajoute ou retire un soutien, crée un signalement et invalide les caches concernés. | Supabase, session, queries, payloads et schémas. Les créations ne relisent que l’`id`; les retraits mettent `deleted_at` et `is_hidden` avec filtres `id + user_id`. Les lignes conservées empêchent de contourner l’anti-spam par suppression puis recréation. |
| `src/features/community/payload.ts` | Construit les payloads purs de création des publications et commentaires. | Dépend des types Supabase et des valeurs validées. Exclut explicitement alias, compteurs, visibilité, dates et suppression, tous gérés côté base. |
| `src/features/community/format.ts` | Formate en français les dates relatives récentes puis les dates courtes, et traduit les catégories techniques. | Fonctions pures fondées sur `Intl.DateTimeFormat` et `categories.ts`, sans accès réseau ni donnée privée. |
| `src/features/community/format.test.ts` | Vérifie instant, minutes, heures, date ancienne, date invalide et libellés de catégories. | Jest avec dates synthétiques figées ; aucune dépendance React Native et aucune donnée réelle. |
| `src/features/community/community.test.ts` | Vérifie catégories, motifs, charte, espaces, limites de longueur, payloads client minimaux et classification RLS/anti-spam/doublon. | Jest, Zod et fonctions pures avec textes et identifiants fictifs. Aucun composant natif n’est importé ; les politiques RLS restent à valider aussi dans Supabase. |

### `src/features/community/components/`

Le dossier contient actuellement sept composants partagés. Aucun huitième fichier de composant n’est présent dans l’état réel du dépôt ; les petits composants `FeedPostCard` et `CommunityCommentCard` restent locaux à leurs routes afin de porter leurs mutations propres.

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/community/components/CommunityHeader.tsx` | En-tête de l’onglet avec titre et action Publier. | Bouton et typographie du design system. Aucun raccourci SOS n’est exposé. |
| `src/features/community/components/CommunityFilters.tsx` | Groupe radio accessible des filtres Tout, Questions et Témoignages. | `categories.ts` et tokens du thème clair ; ne filtre pas localement des données privées. |
| `src/features/community/components/CommunitySafetyBanner.tsx` | Affiche que les témoignages et échanges ne remplacent pas l’avis d’un professionnel de santé, avec action de charte facultative. | Card, Button et AppText. Le message doit rester visible et ne constitue pas un conseil médical. |
| `src/features/community/components/CommunityEmptyState.tsx` | État vide réel du fil avec action Publier. | `EmptyState`; n’insère aucune publication fictive. |
| `src/features/community/components/PostCard.tsx` | Carte texte d’une publication avec pseudonyme, date, catégorie, compteur de commentaires, Soutien et Signalement. | `format.ts`, `SupportButton`, design system et données de query. Aucun asset image, aucune identité complète et aucun contenu inventé. |
| `src/features/community/components/SupportButton.tsx` | Bouton accessible Soutenir/Soutenu avec compteur réel et état de chargement. | Tokens du thème ; `reaction_type` reste exclusivement `support`, sans like générique. |
| `src/features/community/components/CommentCard.tsx` | Carte d’un commentaire avec pseudonyme, date, contenu et action Supprimer pour l’auteur ou Signaler pour les autres. | `format.ts`, design system et données de vue. La route transmet la propriété `is_own`; aucun UUID d’auteur n’est exposé et l’autorisation réelle reste imposée par RLS. |

### `src/features/moderation/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/moderation/types.ts` | Définit `ModerationStatus`, `ModerationDecision`, la ligne sûre d’un signalement et l’élément minimal d’historique. | Dépend de `database.types.ts`. Le contrat ne doit jamais réintroduire `user_id`, e-mail, identifiant de modérateur ou donnée médicale. |
| `src/features/moderation/schemas.ts` | Valide les décisions `hide`, `dismiss`, `restore`, borne la note facultative à 500 caractères et expose `canRestore`. | Zod et types de modération. Une restauration est proposée seulement pour un contenu présent, masqué et déjà traité ; la RPC vérifie à nouveau l’état réel. |
| `src/features/moderation/errors.ts` | Classe les erreurs de rôle, liste, détail, historique et décision. | Transforme session, configuration, réseau, RLS, absence, conflit et erreur Supabase en messages neutres. Les codes techniques ne doivent pas révéler de données privées. |
| `src/features/moderation/queries.ts` | Charge le rôle courant, la file paginée, le détail et l’historique avec des clés privées contenant `userId`. | Supabase, AuthProvider, TanStack Query et RPC administrateur. Le rôle est périmé immédiatement, relu au montage, à la reconnexion et toutes les 30 secondes. La file utilise un curseur stable date + identifiant. |
| `src/features/moderation/mutations.ts` | Envoie une décision et sa note uniquement à `moderate_community_report`, puis invalide file, détail, historique et vues Communauté affectées. | Supabase, session et TanStack Query. Aucun `update` direct de table n’est permis ; le verrou serveur et l’invalidation globale des vues évitent une décision concurrente ou un contenu visible obsolète. |
| `src/features/moderation/moderation.test.ts` | Vérifie le schéma, `canRestore` et les classifications RLS/conflit. | Jest, Zod et fonctions pures avec valeurs fictives. Aucun module natif, secret ou contenu médical réel n’est importé. |

### `src/features/moderation/components/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/moderation/components/ModerationDecisionForm.tsx` | Présente uniquement les décisions permises, valide la note et rappelle que l’action sera enregistrée. | React Hook Form, Zod, `canRestore`, composants UI et `ChoiceChips`. Le formulaire ne décide jamais seul et ne remplace pas les contrôles RPC. |
| `src/features/moderation/components/ModerationEmptyState.tsx` | Adapte l’état vide aux trois statuts de la file. | `EmptyState` et `ModerationStatus`. Il n’invente aucun signalement et ne déclenche aucune action. |
| `src/features/moderation/components/ModerationHistoryList.tsx` | Affiche action, date et note de chaque décision sans identité administrative. | Formatage de date Communauté, Card et types d’historique. Les identifiants techniques et l’identité du modérateur restent absents. |
| `src/features/moderation/components/ModerationReportCard.tsx` | Résume type, motif, pseudonyme public, date, statut et extrait du contenu signalé. | Catégories, formatage Communauté, badge et design system. Les identifiants servent seulement à la navigation et ne sont pas rendus ; le contenu peut être indisponible. |
| `src/features/moderation/components/ModerationStatusBadge.tsx` | Rend le statut en texte et couleur accessible. | Thème clair et `ModerationStatus`. La couleur n’est jamais le seul moyen de transmettre l’état. |

### `src/lib/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/lib/env.ts` | Valide les variables publiques d’environnement et retourne `null` si la configuration est incomplète. | Zod et `process.env`. Ne jamais ajouter de valeur réelle ou de clé privilégiée dans le dépôt. |
| `src/lib/supabase.ts` | Crée le client Supabase typé avec l’URL publique, la clé anon publique et l’adaptateur SecureStore. | `@supabase/supabase-js`, polyfill URL, `secure-storage.ts`, `database.types.ts`. `service_role` est interdit dans l’application mobile. |
| `src/lib/query-client.ts` | Instance globale TanStack Query avec retry limité, durée de fraîcheur de 30 secondes et liste des racines privées, dont Communauté, `user-role` et les trois racines de modération. | Utilisée par `QueryProvider`, les mutations et `AuthProvider`. Les caches privés sont purgés lors d’un changement de compte ou d’une déconnexion ; le guard administrateur supprime seulement les caches de modération après un refus de rôle. |

### `src/providers/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/providers/app-provider.tsx` | Compose `QueryProvider` et `AuthProvider` pour l’arbre racine. | Utilisé par `app/_layout.tsx`. Ne pas monter plusieurs instances de providers globaux. |
| `src/providers/query-provider.tsx` | Fournit l’instance TanStack Query aux routes et composants. | `QueryClientProvider` et `query-client.ts`. |
| `src/providers/auth-provider.tsx` | Restaure la session, écoute `onAuthStateChange`, gère `PASSWORD_RECOVERY`, auto-refresh Android, expose les actions Auth et purge le cache à la déconnexion. | Supabase, SecureStore indirectement, AppState et QueryClient. Ne jamais afficher ou journaliser session, token ou mot de passe. |

### `src/services/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/services/secure-storage.ts` | Adapte `getItemAsync`, `setItemAsync` et `deleteItemAsync` d’Expo SecureStore au stockage de session Supabase. | `expo-secure-store`. Réservé aux sessions et secrets de session ; ne pas y stocker les données métier ou médicales. |

### `supabase/functions/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `supabase/functions/delete-account/index.ts` | Vérifie le bearer token, récupère l’utilisateur authentifié puis supprime uniquement son compte avec la clé serveur côté Supabase. | Deno et Supabase JS distant. `SUPABASE_SERVICE_ROLE_KEY` reste un secret de fonction et n’est jamais envoyé au mobile. |

### `src/theme/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/theme/colors.ts` | Tokens de couleurs Terre et Sang pour le mode clair unique du MVP. | Aucun service externe. Les composants doivent utiliser ces tokens plutôt que des hexadécimaux locaux. |
| `src/theme/spacing.ts` | Grille d’espacement, gouttière d’écran, padding de carte et zones tactiles. | Aucun service externe. Respecter les minimums d’accessibilité Android. |
| `src/theme/typography.ts` | Familles, poids et styles typographiques du premier lot, avec Inter comme police déclarée. | Aucun service externe dans ce lot. Bricolage Grotesque reste différée jusqu’à validation des performances et du chargement de police. |
| `src/theme/radii.ts` | Rayons partagés des champs, boutons, cartes et badges. | Aucun service externe. Éviter de recréer des rayons locaux incohérents. |
| `src/theme/sizes.ts` | Hauteurs de champs/boutons, tailles d’icônes, avatars et bouton SOS. | Aucun service externe. Les tailles tactiles ne doivent pas être réduites sous les seuils validés. |
| `src/theme/shadows.ts` | Ombres Android nulles ou très légères pour conserver une interface performante. | Aucun service externe. Ne pas compenser un mauvais contraste par une ombre forte. |
| `src/theme/use-app-theme.ts` | Retourne la palette claire unique du MVP. | `colors.ts`. Aucun mode sombre actif n’est exposé aux composants. |
| `src/theme/index.ts` | Export central et type `Theme` regroupant tous les tokens. | Consommé par les composants UI. Les extensions futures doivent préserver le mode clair du MVP. |

### `src/types/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/types/database.types.ts` | Types TypeScript pour les tables et vues Communauté, `community_moderation_actions`, les champs de traitement de `community_reports`, `is_admin` et les quatre RPC de modération. | Client Supabase et modules Communauté/Modération. Les vues et lignes RPC destinées à l’interface n’exposent aucun UUID de membre, e-mail ou donnée médicale. Toute migration de schéma doit entraîner une régénération ou une mise à jour vérifiée de ces types. |
| `src/types/domain.ts` | Type initial `ProfileCompletion` décrivant les indicateurs de complétude. | Disponible pour les futurs services d’onboarding. Garder ce type cohérent avec `completion.ts`. |

### Dossiers actuellement absents

- `src/utils/` n’existe pas actuellement ; aucun utilitaire partagé n’y est exposé.

## 8. Dossier `supabase/`

### Configuration et seed

| Fichier | Rôle | Données et précautions |
|---|---|---|
| `supabase/config.toml` | Configuration du projet Supabase local : `project_id = "DREPA"`, API, PostgreSQL 17, migrations et seed. | Les migrations sont activées et `seed.sql` est le seed courant. Les commentaires de configuration ne doivent jamais recevoir de secret réel. |
| `supabase/seed.sql` | Seed volontairement vide. | Aucune donnée réelle ou médicale n’est initialisée. |
| `supabase/.gitignore` | Exclut `.branches`, `.temp`, `.env.keys`, `.env.local` et les variantes locales Supabase. | Ne jamais documenter ou versionner `supabase/.temp/` ou les credentials locaux. |

### Migrations versionnées

| Migration | Tables et colonnes importantes | Relations, contraintes et RLS | Ordre |
|---|---|---|---|
| `supabase/migrations/20260723200000_create_profiles.sql` | Crée `public.profiles` avec `id`, identité, pays, informations facultatives et timestamps. | `id` référence `auth.users(id)` avec cascade. Trigger `set_updated_at`. RLS et policies select/insert/update/delete limitées à `auth.uid() = id`. | 1 |
| `supabase/migrations/20260723200100_create_emergency_contacts.sql` | Crée `public.emergency_contacts` avec `id`, `user_id`, nom, téléphone, relation, contact principal, consentement confirmé et date de création. | `user_id` référence `auth.users(id)` avec cascade. Index utilisateur, unicité du contact principal, RLS CRUD limitée à `auth.uid() = user_id`. | 2 dans le dépôt actuel |
| `supabase/migrations/20260723200200_create_user_consents.sql` | Crée `public.user_consents` avec versions CGU, confidentialité, charte, `accepted_at` et `revoked_at`. | `user_id` référence `auth.users(id)` avec cascade. RLS select/insert/update propriétaire. Trigger d’historique empêchant la modification des versions et la réactivation d’un consentement révoqué. | 3 dans le dépôt actuel |
| `supabase/migrations/20260726021000_grant_authenticated_table_privileges.sql` | Accorde les privilèges SQL nécessaires aux tables initiales. | Aucun accès `anon`; `user_consents` ne reçoit pas de privilège DELETE. | 4 dans le dépôt actuel |
| `supabase/migrations/20260803153000_create_health_logs.sql` | Crée `public.health_logs` avec mesures et observations facultatives, timestamps et `recorded_at`. | `user_id` référence `auth.users(id)`, contraintes 0–10, rejet des dates futures, index utilisateur/date, privilèges SQL et RLS CRUD propriétaire. | 5 dans le dépôt actuel |
| `supabase/migrations/20260807235000_create_medications.sql` | Crée `public.medications` avec traitement déclaré, fréquence, dates, notes et état actif. | Propriétaire lié à `auth.users`, contraintes de longueur/date, index, trigger `updated_at`, RLS CRUD et aucun accès `anon/public`. | 6 |
| `supabase/migrations/20260807235100_create_medication_reminders.sql` | Crée `public.medication_reminders` avec heure locale, activation et identifiant de notification locale. | Clé étrangère composite `(medication_id, user_id)` empêchant une association inter-utilisateurs, unicité horaire, RLS CRUD propriétaire. | 7 |
| `supabase/migrations/20260807235200_create_medication_intakes.sql` | Crée `public.medication_intakes` avec horaire prévu, prise déclarée et statut contraint. | Clé étrangère composite propriétaire, contrainte `taken_at`, unicité traitement/horaire, RLS CRUD et aucun accès `anon/public`. | 8 |
| `supabase/migrations/20260811005300_add_snooze_fields_to_medication_intakes.sql` | Ajoute `snoozed_until` et `snooze_notification_id` aux prises déclarées. | Identifiant limité à 200 caractères, cohérence obligatoire entre statut et heure reportée, index partiel propriétaire sur les reports ; la RLS existante reste inchangée. | 9 |
| `supabase/migrations/20260811181000_create_user_roles.sql` | Crée `user_roles` avec rôle `user` par défaut ou `admin`, pseudonyme `community_alias` nullable, puis ajoute les triggers de rôle/timestamp et `is_admin()`. | L’alias communautaire est attribué au premier contenu puis reste stable. RLS en lecture propriétaire ou admin, privilège mobile `SELECT` seulement, aucun accès `anon`. Le rôle et l’alias ne sont jamais choisis par le mobile. | 10, avant toutes les tables Communauté |
| `supabase/migrations/20260811181100_create_community_posts.sql` | Crée `community_posts` avec auteur, catégorie, texte, compteurs, visibilité, `deleted_at` et timestamps, puis la vue `community_posts_feed`. | `prepare_community_post` impose `auth.uid()`, attribue l’alias stable et limite à 5 publications en 10 minutes sous verrou. La vue masque `user_id`; `is_own` remplace la comparaison mobile. Le soft delete conserve la ligne et le droit DELETE n’est pas accordé, donc l’anti-spam ne peut pas être contourné. | 11, après `user_roles` |
| `supabase/migrations/20260811181200_create_community_comments.sql` | Crée `community_comments` avec alias, texte, visibilité, `deleted_at` et timestamps, puis la vue `community_comments_feed`. | Identité et alias stable sont imposés. La limite reste de 20 commentaires en 10 minutes, y compris après soft delete. La vue masque `user_id`, expose `is_own` et exclut les contenus retirés ou dont le parent est retiré. | 12, après `community_posts` |
| `supabase/migrations/20260811181300_create_community_post_reactions.sql` | Crée `community_post_reactions` avec une unique réaction `support` par membre et publication. | Les réactions sont privées : chaque membre lit uniquement les siennes, hors administration. La contrainte unique, `auth.uid()`, la visibilité du post et le trigger de compteur protègent ajout/retrait ; aucune mise à jour n’est accordée. | 13, après `community_posts` |
| `supabase/migrations/20260811181400_create_community_reports.sql` | Crée `community_reports` avec une cible unique publication ou commentaire, motif, détails, statut et timestamps. | Unicité d’un signalement par membre et cible, statut initial `pending`, limite de 10 signalements par heure et identité imposée par trigger. RLS : lecture propriétaire/admin, insertion propriétaire vers une cible existante, mise à jour admin, aucune suppression. La décision reste une modération humaine côté Supabase. | 14, après publications et commentaires |
| `supabase/migrations/20260811213000_harden_community_feed_views.sql` | Corrige les alertes Security Advisor `Security Definer View` de `community_posts_feed` et `community_comments_feed` avec les wrappers `read_community_posts_feed()` et `read_community_comments_feed()`. | Les fonctions `STABLE SECURITY DEFINER` à `search_path` vide appliquent directement les prédicats de visibilité, ne renvoient aucun `user_id` et sont exécutables uniquement par `authenticated`. Les vues recréées avec `security_invoker` et `security_barrier` ne révèlent aucun UUID de membre et restent en lecture authentifiée seulement, sans nouveau droit sur les tables. | 15, après toutes les migrations Communauté |
| `supabase/migrations/20260813203000_add_community_moderation_audit.sql` | Ajoute `reviewed_by`, `reviewed_at` et `resolution_note` à `community_reports`, puis crée le journal `community_moderation_actions`. | Le journal est immuable depuis le mobile ; `report_id` et `moderator_id` utilisent `ON DELETE SET NULL` pour conserver action, cible et date. Les changements de visibilité sont audités. `get_community_moderation_queue`, `get_community_moderation_report`, `get_community_moderation_history` et `moderate_community_report` exposent file, détail, historique et décision sans donnée privée de membre. La mise à jour directe des signalements est révoquée au rôle `authenticated`. | 16, après le durcissement des vues |

L’ordre 10 à 16 est obligatoire : `user_roles` fournit `is_admin()` et le `community_alias` stable avant les contenus et la modération. Les vues de fil ne révèlent aucun UUID de membre et utilisent `is_own`. Les réactions restent privées. Les soft deletes conservent les lignes dans les fenêtres anti-spam, sans privilège DELETE mobile : supprimer puis recréer ne réinitialise donc pas les limites. Les compteurs et l’audit de visibilité restent maintenus par triggers. Les migrations déjà appliquées ne doivent jamais être modifiées.

Le rôle `admin` est attribué et modifié côté Supabase uniquement. L’application React Native possède désormais une interface de modération privilégiée, mais aucun formulaire de rôle ni clé `service_role`. Le rôle est revérifié au montage, à la reconnexion et toutes les 30 secondes. Un refus supprime les caches privés de modération. Les RPC contrôlent `is_admin()` et chaque décision reste humaine et auditée.

L’Edge Function `delete-account` est présente et déployée pour la suppression sécurisée du compte authentifié.

## 9. Dossier `docs/`

| Fichier | Rôle et relation avec le code |
|---|---|
| `docs/README.md` | Index documentaire, ordre de lecture, stack, principes obligatoires et autorité documentaire. |
| `docs/architecture.md` | Architecture logique, couches mobile, services appareil, Supabase, frontières de confiance et flux principaux. |
| `docs/class-diagram.md` | Modèle des classes métier et invariants du domaine. |
| `docs/data-flow.md` | Classification et circulation des données d’authentification, profil, données privées, communauté, SOS et suppression. |
| `docs/database-schema.md` | Modèle relationnel PostgreSQL, relations, ordre théorique des migrations, contraintes, matrice RLS et suppression du compte. |
| `docs/deployment.md` | Chaîne de livraison Android, environnements, configuration Expo, variables, development build, APK, déploiement Supabase et recette. |
| `docs/design-decisions.md` | Décisions validées sur rôles, consentements, complétude du profil, journal, réactions, ressources, suppression, plateforme et limites médicales. |
| `docs/mvp-scope.md` | Périmètre inclus/exclus, planning de 30 jours, critères d’acceptation et sécurité minimale. |
| `docs/navigation.md` | Décision d’entrée, routes publiques/protégées, carte de navigation, onglets, SOS, deep links et comportement Android. Certaines routes y sont encore prospectives. |
| `docs/plan-technique-initialisation.md` | Plan historique d’initialisation Expo/Supabase, dépendances et arborescence cible. Il doit être lu comme plan de référence, l’état réel étant décrit ici. |
| `docs/security.md` | Authentification, SecureStore, RLS, rôles, opérations privilégiées, logs, suppression et menaces. |
| `docs/sequence-authentication.md` | Séquences d’inscription, connexion, session, récupération et déconnexion. |
| `docs/sequence-community.md` | Séquences prévues pour publications, commentaires, réactions et signalements. |
| `docs/sequence-health-log.md` | Séquences prévues pour créer, modifier, consulter et supprimer les entrées du journal. |
| `docs/sequence-medications.md` | Séquences prévues pour traitements, rappels et prises. |
| `docs/sequence-moderation.md` | Séquences de signalement et modération, avec les noms exacts `community_posts` et `community_comments`. |
| `docs/sequence-profile.md` | Séquence de création, lecture, modification et complétude du profil. |
| `docs/sequence-sos.md` | Séquence SOS manuel, permission de localisation, contact et limites du service. |
| `docs/use-cases.md` | Cas d’utilisation du MVP pour compte, profil, journal, traitements, urgence, ressources et communauté. |
| `docs/project-file-reference.md` | Présente référence permanente des fichiers et des dépendances du projet. Ce fichier se documente lui-même et doit être mis à jour avec chaque évolution significative. |

La documentation ne doit pas être dupliquée dans son intégralité ici. Chaque document conserve son objectif spécialisé ; cette référence indique sa place dans l’architecture et sa relation avec le code.

## 10. Assets

### Ressources utilisées par `app.config.js`

| Asset | Utilisation |
|---|---|
| `assets/images/icon.png` | Icône principale Expo/Android. |
| `assets/images/android-icon-foreground.png` | Premier plan de l’icône adaptative Android. |
| `assets/images/android-icon-background.png` | Arrière-plan de l’icône adaptative Android. |
| `assets/images/android-icon-monochrome.png` | Variante monochrome de l’icône adaptative Android. |
| `assets/images/drepa-splash-icon.png` | Médaillon ivoire et goutte bordeaux du splash natif Android. Asset transparent sans texte ni donnée personnelle. |

### Assets présents mais non référencés par les routes actuelles

- `assets/images/tabIcons/home.png`, `home@2x.png`, `home@3x.png` ;
- `assets/images/tabIcons/explore.png`, `explore@2x.png`, `explore@3x.png` ;
- `assets/images/tutorial-web.png` ;
- `assets/images/react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png` ;
- `assets/images/logo-glow.png` ;
- `assets/images/splash-icon.png` (ancien asset Expo remplacé par l’identité DRÉPA) ;
- `assets/images/favicon.png` ;
- `assets/images/expo-logo.png`, `expo-badge.png`, `expo-badge-white.png` ;
- `assets/expo.icon/icon.json`, `assets/expo.icon/Assets/grid.png` et `assets/expo.icon/Assets/expo-symbol 2.svg`.

Ces fichiers proviennent du template ou d’éléments de design et ne doivent pas être supprimés sans vérifier leur usage futur. Aucun asset ne doit contenir de token, certificat ou donnée utilisateur.

## 11. Flux fonctionnels

### Authentification et onboarding

```text
login/register
    → src/features/auth/auth-service.ts
    → src/lib/supabase.ts
    → Supabase Auth
    → app/(auth)/auth/callback.tsx pour les confirmations deep link
    → src/providers/auth-provider.tsx
    → app/index.tsx
    → app/(app)/_layout.tsx
    → src/features/profile/use-onboarding-status.ts
```

Le guard protégé décide ensuite :

```text
session absente
    → /(auth)/login

session valide + user_consents vide ou obsolète
    → app/(app)/consent.tsx
    → src/features/profile/mutations.ts
    → user_consents

consentements valides + profil absent ou incomplet
    → app/(app)/complete-profile.tsx
    → src/features/profile/schemas.ts
    → src/features/profile/mutations.ts
    → profiles

profil complet
    → app/(app)/(tabs)/
```

L’absence d’une ligne dans `profiles` ou d’une ligne de consentement valide est un état d’onboarding, pas une erreur réseau. Une erreur Supabase, RLS, configuration ou réseau passe par l’état d’erreur et l’action `Réessayer`.

### Consentement et profil

```text
consent.tsx
    → legal-versions.ts
    → consentSchema
    → useAcceptConsentMutation
    → user_consents
    → invalidation de consentQueryKey(userId)

complete-profile.tsx
    → ProfileForm.tsx
    → profileSchema + useProfileQuery(userId) + useUpsertProfileMutation(userId)
    → profiles.id = auth.users.id
    → invalidation de profileQueryKey(userId)
    → tabs

profile.tsx → profile-edit.tsx
    → ProfileForm.tsx
    → profil prérempli et sauvegarde propriétaire
    → onglet profile
```

### Profil et déconnexion

```text
profile.tsx
    → useProfileQuery(userId)
    → AuthProvider
    → Supabase signOut
    → purge du QueryClient
    → routes publiques

suppression confirmée du compte
    → AuthProvider.deleteAccount
    → supabase.functions/delete-account
    → Supabase Auth Admin côté serveur
    → purge de la session locale
    → routes publiques
```

### Récupération du mot de passe

```text
forgot-password.tsx
    → auth-service.ts
    → Supabase resetPasswordForEmail
    → deep link drepa://reset-password
    → reset-password.tsx
    → Supabase updateUser
```

Le callback de confirmation e-mail est implémenté dans `app/(auth)/auth/callback.tsx`. Il doit rester autorisé côté Supabase avec `drepa://auth/callback`.

### Communauté et modération humaine

```text
onglet community
    → useCommunityPostsQuery(userId, filtre)
    → community_posts_feed sans UUID de membre + soutien propre dans community_post_reactions
    → PostCard avec compteurs réels

publication
    → app/(app)/community/new.tsx
    → postSchema + acceptation de la charte
    → useCreatePostMutation
    → community_posts
    → trigger Supabase : auth.uid(), community_alias stable et limite anti-spam
    → app/(app)/community/[id].tsx

commentaire
    → app/(app)/community/[id].tsx
    → commentSchema
    → useCreateCommentMutation
    → community_comments
    → trigger Supabase : identité, alias stable, limite anti-spam et comments_count

soutien
    → SupportButton avec verrou contre le double appui
    → useToggleSupportMutation
    → ajout ou retrait dans community_post_reactions
    → contrainte unique + trigger support_count

signalement d’une publication ou d’un commentaire
    → app/(app)/community/report.tsx
    → reportSchema
    → useReportMutation
    → community_reports au statut pending
    → insertion relisant seulement l’identifiant créé

accès depuis profile.tsx
    → useCurrentUserRoleQuery avec revérification régulière
    → entrée Administration seulement pour le rôle admin
    → app/(app)/admin/_layout.tsx
    → refus UI et purge des caches de modération si le rôle n’est pas admin

examen humain
    → app/(app)/admin/moderation.tsx
    → get_community_moderation_queue par statut et curseur stable
    → app/(app)/admin/report/[id].tsx
    → get_community_moderation_report + get_community_moderation_history
    → choix explicite masquer, rejeter ou restaurer avec note facultative
    → moderate_community_report sous contrôle is_admin()
    → verrou du signalement, changement de visibilité et audit de la décision
    → invalidation des caches de modération et des vues Communauté
```

Les publications et commentaires restent textuels et communautaires. Les lectures passent par des vues sans UUID de membre et les réactions propres restent privées. Le retrait d’un contenu est un soft delete qui ne réinitialise pas l’anti-spam. Ce premier lot ne contient aucun SOS, aucune image, aucun chat privé, aucun conseil médical et aucune donnée médicale privée. Les témoignages ne remplacent jamais l’avis d’un professionnel de santé. L’interface administrateur est présente, mais les autorisations, verrous et écritures privilégiées restent exclusivement contrôlés par les RPC Supabase.

### Sécurité de la modération

- Un compte normal est refusé par le guard de l’interface et par chaque RPC administrateur.
- Aucun UUID n’est affiché à l’administrateur : les identifiants de signalement et de cible restent internes à la navigation. Les RPC ne renvoient aucun `user_id`, UUID de membre, e-mail, identité de modérateur ou donnée médicale.
- Chaque masquage, rejet ou restauration est une décision humaine explicite et enregistrée dans `community_moderation_actions` avec sa date et sa note éventuelle.
- Le mobile ne met jamais directement à jour `community_reports` et ne peut pas écrire dans le journal d’audit.
- Le rôle est revérifié régulièrement ; sa perte purge les caches `moderation-queue`, `moderation-report` et `moderation-history` sans supprimer les caches publics Communauté.
- Aucune décision de modération, aucun déploiement et aucune mise en Production ne sont automatiques.

## 12. Matrice des dépendances

| Fichier | Dépend de | Utilisé par |
|---|---|---|
| `app/_layout.tsx` | `expo-router`, `src/providers/app-provider.tsx`, `medications/notifications.ts` | Toutes les routes `app/` et la présentation des notifications au premier plan. |
| `app/index.tsx` | `expo-router`, `useAuth`, `ScreenPlaceholder` | Expo Router comme route d’entrée. |
| `app/(auth)/login.tsx` | `auth-service` via `AuthProvider`, `auth/schemas.ts`, React Hook Form, Zod | Utilisateur non connecté. |
| `app/(auth)/register.tsx` | `auth-service` via `AuthProvider`, `auth/schemas.ts`, React Hook Form, Zod | Utilisateur non connecté. |
| `app/(auth)/forgot-password.tsx` | `auth-service` via `AuthProvider`, `auth/schemas.ts`, Expo Linking indirectement | Utilisateur demandant une récupération. |
| `app/(auth)/reset-password.tsx` | `AuthProvider`, `auth/schemas.ts` | Session de récupération de mot de passe. |
| `app/(auth)/auth/callback.tsx` | `supabase.ts`, Expo Linking, `AuthProvider` | Confirmation e-mail Android et redirection vers l’onboarding. |
| `app/(auth)/_layout.tsx` | `AuthProvider`, `ScreenPlaceholder`, Expo Router | Toutes les routes `(auth)`. |
| `app/(app)/_layout.tsx` | `AuthProvider`, `use-onboarding-status`, `ScreenPlaceholder`, Expo Router | Toutes les routes protégées `(app)`. |
| `app/(app)/consent.tsx` | `legal-versions`, `profile/schemas`, `profile/mutations`, `AuthProvider` | Utilisateur authentifié sans consentements courants. |
| `app/(app)/complete-profile.tsx` | `ProfileForm`, Expo Router | Utilisateur authentifié avec consentements valides mais profil incomplet. |
| `app/(app)/profile-edit.tsx` | `ProfileForm`, Expo Router | Utilisateur authentifié avec onboarding complet depuis l’onglet Profil. |
| `app/(app)/(tabs)/profile.tsx` | `profile/queries`, `moderation/queries`, composants Profil, `AuthProvider`, Expo Router | Utilisateur consultant son profil, route `/profile-edit` et entrée Administration si le rôle courant est `admin`. |
| `app/(app)/(tabs)/community.tsx` | `community/queries`, `community/mutations`, composants Communauté, `AuthProvider`, Expo Router | Fil authentifié, filtres, pagination, soutien, publication, détail et signalement. |
| `app/(app)/community/new.tsx` | `community/categories`, `community/schemas`, `community/mutations`, React Hook Form, Zod, `AuthProvider` | Création textuelle d’une publication puis route `/community/:id`. |
| `app/(app)/community/[id].tsx` | `community/queries`, `community/mutations`, `community/schemas`, composants Communauté, React Hook Form, Zod | Détail, commentaires, soutien, suppression propriétaire et signalement. |
| `app/(app)/community/report.tsx` | `community/categories`, `community/schemas`, `community/mutations`, React Hook Form, Zod, paramètres Expo Router | Signalement d’une publication ou d’un commentaire vers la modération humaine. |
| `app/(app)/admin/_layout.tsx` | `moderation/queries`, `AuthProvider`, TanStack Query, Expo Router | Toutes les routes administrateur ; bloque le rendu avant contrôle du rôle et purge les caches de modération après refus. |
| `app/(app)/admin/moderation.tsx` | `moderation/queries`, composants Modération, `AuthProvider`, Expo Router | Administrateur consultant les files `pending`, `reviewed` et `dismissed`. |
| `app/(app)/admin/report/[id].tsx` | `moderation/queries`, `moderation/mutations`, `moderation/schemas`, composants Modération | Administrateur consultant un signalement, son historique et enregistrant une décision humaine. |
| `src/features/profile/components/ProfileForm.tsx` | `profile/schemas`, `profile/queries`, `profile/mutations`, `AuthProvider`, React Hook Form, Zod, composants UI | `complete-profile.tsx`, `profile-edit.tsx`. |
| `src/features/auth/auth-service.ts` | `src/lib/supabase.ts`, Expo Linking | `AuthProvider`, routes Auth et suppression de compte. |
| `src/providers/auth-provider.tsx` | `supabase.ts`, `auth-service.ts`, `query-client.ts`, AppState | `app/_layout.tsx`, layouts Auth/App et profil. |
| `src/features/profile/queries.ts` | Supabase, `database.types.ts`, TanStack Query | `use-onboarding-status`, `ProfileForm`, onglet profil. |
| `src/features/profile/mutations.ts` | Supabase, `database.types.ts`, `legal-versions`, query keys | `consent.tsx`, `ProfileForm`. |
| `src/features/profile/completion.ts` | `legal-versions`, types consentement | `use-onboarding-status` et tests du flux. |
| `src/features/profile/use-onboarding-status.ts` | `AuthProvider`, queries profil/consentements, `completion.ts` | `app/(app)/_layout.tsx`. |
| `src/features/community/categories.ts` | Contrats TypeScript locaux | Schémas, filtres, formulaires, formatage et tests Communauté. |
| `src/features/community/schemas.ts` | Zod, `categories.ts` | Routes de publication, commentaire, signalement et tests. |
| `src/features/community/payload.ts` | `database.types.ts`, valeurs validées des schémas | Mutations de création et tests des champs client autorisés. |
| `src/features/community/queries.ts` | Supabase, `database.types.ts`, TanStack Query, `AuthProvider`, `errors.ts` | Onglet Communauté et détail d’une publication. |
| `src/features/community/mutations.ts` | Supabase, `database.types.ts`, TanStack Query, `AuthProvider`, queries, schémas et erreurs | Routes Communauté pour publication, commentaire, soutien, suppression et signalement. |
| `src/features/community/components/*.tsx` | Composants UI, thème, catégories, format et types de queries | Onglet Communauté, création et détail ; uniquement du texte, des compteurs et des actions autorisées. |
| `src/features/moderation/types.ts` | `database.types.ts` et contrats RPC sûrs | Schémas, queries, mutations, composants et tests de modération. |
| `src/features/moderation/schemas.ts` | Zod et types de modération | Formulaire de décision, règle de restauration et tests purs. |
| `src/features/moderation/errors.ts` | Contrats d’erreurs Supabase | Queries, mutation et tests de classification. |
| `src/features/moderation/queries.ts` | Supabase, `database.types.ts`, TanStack Query, `AuthProvider`, erreurs | Profil, guard admin, file, détail et historique. |
| `src/features/moderation/mutations.ts` | RPC Supabase, TanStack Query, `AuthProvider`, query keys et schémas | Route de détail administrateur ; décision et invalidation des caches. |
| `src/features/moderation/components/*.tsx` | Composants UI, thème, catégories/format Communauté, schémas et types Modération | Routes de file et de détail ; aucune autorisation n’est décidée dans les composants. |
| `src/lib/supabase.ts` | `env.ts`, SecureStore, `database.types.ts`, Supabase JS | Services Auth, queries et mutations. |
| `src/lib/env.ts` | Zod et variables `EXPO_PUBLIC_*` | `src/lib/supabase.ts`. |
| `src/lib/query-client.ts` | TanStack Query | `QueryProvider`, `AuthProvider`, mutations. |
| `src/providers/app-provider.tsx` | `QueryProvider`, `AuthProvider` | `app/_layout.tsx`. |
| `src/providers/query-provider.tsx` | TanStack Query, `query-client.ts` | `AppProvider`. |
| `src/services/secure-storage.ts` | Expo SecureStore | `src/lib/supabase.ts`. |
| `supabase/functions/delete-account/index.ts` | Supabase Auth Admin, secrets Edge Function | `auth-service.ts` via `functions.invoke`; ne jamais déployer la clé serveur au mobile. |
| `src/types/database.types.ts` | Schéma des migrations existantes, dont tables Communauté, audit de modération et RPC administrateur | Client Supabase, code profil, journal, médicaments, Communauté et Modération. |
| `supabase/migrations/20260811181000_create_user_roles.sql` | PostgreSQL, `auth.users`, `set_updated_at()` | Policies RLS Communauté et contrôle administratif côté Supabase. |
| `supabase/migrations/20260811181100_create_community_posts.sql` | `auth.users`, `profiles`, `user_roles`, PostgreSQL/RLS | Fil, détail et mutations des publications ; parent des commentaires, réactions et signalements. |
| `supabase/migrations/20260811181200_create_community_comments.sql` | `community_posts`, `auth.users`, `profiles`, `user_roles`, PostgreSQL/RLS | Détail, commentaires, compteur de commentaires visibles et signalements. |
| `supabase/migrations/20260811181300_create_community_post_reactions.sql` | `community_posts`, `auth.users`, `user_roles`, PostgreSQL/RLS | Soutien unique et compteur de soutiens. |
| `supabase/migrations/20260811181400_create_community_reports.sql` | `community_posts`, `community_comments`, `auth.users`, `user_roles`, PostgreSQL/RLS | Signalement mobile et examen humain côté Supabase. |
| `supabase/migrations/20260811213000_harden_community_feed_views.sql` | `community_posts`, `community_comments`, `auth.uid()`, PostgreSQL | Fonctions wrapper de lecture confidentielle et vues `security_invoker` répondant aux alertes Security Advisor, sans UUID de membre exposé. |
| `supabase/migrations/20260813203000_add_community_moderation_audit.sql` | `community_reports`, contenus Communauté, `user_roles`, `auth.users`, triggers et RPC | File, détail, historique, décision humaine, audit de visibilité et révocation des mises à jour directes mobiles. |
| `supabase/migrations/*.sql` | PostgreSQL et `auth.users` | Projet Supabase distant/local ; consommées par le client via RLS. |
| `app.config.js` | Expo, DateTimePicker, Notifications et assets principaux | Expo CLI et EAS Build ; un nouveau build natif Android est requis après cette configuration. |
| `eas.json` | EAS CLI | Profiles development, preview et production Android. |
| `.github/workflows/quality.yml` | GitHub Actions, Node.js 22, npm, Expo CLI, Expo Doctor, Git et scripts de `package.json` | Push sur `main`, pull requests vers `main` et exécutions manuelles de la CI. |
| `.github/workflows/eas-preview.yml` | GitHub Actions, Node.js 22, npm, EAS CLI, `eas.json`, environnement `preview` et secret `EXPO_TOKEN` | Builds Android Preview déclenchés et validés manuellement. |
| `.github/dependabot.yml` | Dependabot, `package.json`, `package-lock.json` et workflows GitHub Actions | Pull requests hebdomadaires de mise à jour, sans automerge. |

Les dépendances externes importantes sont centralisées dans `package.json` : Expo/React Native, Expo Router, React Native Community DateTimePicker, AsyncStorage, modules SecureStore/Notifications/Location/Linking, Supabase JS, TanStack Query, React Hook Form, Zod, ESLint, TypeScript et les outils de tests. Les fichiers de `node_modules/` ne sont pas documentés individuellement. La CI bloque les vulnérabilités critiques des dépendances de production ; les avis moins sévères, dont l'advisory `high` Metro/`image-size` sans correctif compatible Expo SDK 57, restent soumis à une revue humaine. Aucun correctif `--force` ne doit être utilisé s'il modifie la version majeure d'Expo.

## 13. Règles de modification

- Les secrets ne doivent jamais être commités.
- Les données médicales ne doivent pas être loguées.
- Les migrations déjà appliquées ne doivent pas être modifiées.
- Toute modification du schéma doit passer par une nouvelle migration versionnée.
- Toute nouvelle route doit être ajoutée à la documentation.
- Tout nouveau fichier doit être ajouté à cette référence.
- Toute fonctionnalité médicale doit respecter le cahier des charges et les limites du MVP.
- Aucune IA prédictive, aucun diagnostic et aucune prescription ne doivent être ajoutés.
- Les clés publiques Supabase ne doivent jamais être confondues avec une clé `service_role`.
- Les accès aux données privées doivent rester protégés par RLS et `auth.uid()`.
- Les données de session doivent rester dans SecureStore ; les données métier doivent rester dans Supabase.
- Les absences normales de ligne, comme un profil non encore créé, ne doivent pas être transformées en erreur technique.
- Toute modification de navigation doit préserver les guards de session, consentement et complétude du profil.
- Toute modification d’`app.config.js` doit préserver l’identité DRÉPA, le schéma `drepa`, Android et les plugins Expo requis.
- Les fichiers générés, temporaires et secrets locaux restent exclus de cette référence.
