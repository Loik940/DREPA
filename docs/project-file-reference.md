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
- **Supabase PostgreSQL** stocke les profils, consentements et futures données métier.
- **Supabase Edge Functions** sont prévues pour les opérations serveur privilégiées, notamment la suppression de compte, mais aucun dossier `supabase/functions/` n’est actuellement présent.
- **Row Level Security (RLS)** limite les accès aux lignes appartenant à l’utilisateur authentifié et protège les opérations administratives côté Supabase.
- **TanStack Query** gère le cache et les requêtes de données serveur.
- **React Hook Form** gère les formulaires React Native.
- **Zod** valide les données d’authentification, de consentement et de profil.
- **Expo SecureStore** conserve localement la session Supabase ; il ne doit pas servir à stocker des données médicales.
- **Expo Notifications** est installé pour les notifications locales futures.
- **Expo Location** est installé pour les parcours futurs nécessitant une localisation avec consentement.
- **EAS Build** produit les development builds et APK Android.

## 4. Arborescence documentée

```text
DREPA/
├── .env.example
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
│   │   ├── forgot-password.tsx
│   │   ├── legal.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── reset-password.tsx
│   └── (app)/
│       ├── _layout.tsx
│       ├── complete-profile.tsx
│       ├── consent.tsx
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
│   ├── lib/
│   ├── providers/
│   ├── services/
│   ├── theme/
│   └── types/
└── supabase/
    ├── .gitignore
    ├── config.toml
    ├── migrations/
    └── seed.sql
```

`node_modules/`, `.expo/`, `.kilo/`, `.git/`, `supabase/.temp/`, `dist/`, `coverage/` et les fichiers secrets locaux ne font pas partie de cette arborescence documentée.

## 5. Fichiers racine

| Fichier | Rôle et contenu principal | Utilisé par | Données, précautions et risques |
|---|---|---|---|
| `README.md` | Présentation du produit, objectifs, fonctionnalités prévues, stack, état du projet et avertissement médical. | Développeurs, contributeurs et lecteurs du dépôt. | Ne pas y ajouter de clé, donnée patient ou promesse médicale non validée. Le texte décrit aussi des fonctionnalités futures qui ne sont pas toutes implémentées. |
| `DREPA-Cahier.md` | Cahier des charges fonctionnel et technique de référence : public cible, MVP, limites médicales, sécurité, navigation et exigences métier. | Documentation, décisions d’architecture et futures implémentations. | Document de référence à préserver. Toute évolution fonctionnelle doit rester compatible avec ce cahier ou être documentée avant mise en œuvre. |
| `package.json` | Manifeste Node : point d’entrée Expo Router, dépendances Expo/React Native/Supabase, AsyncStorage pour la préférence de bienvenue, scripts de développement, lint, tests, typecheck et builds EAS. | npm, Expo CLI, Jest, ESLint et EAS CLI. | Les versions Expo doivent rester alignées sur SDK 57. Les packages Expo doivent être installés avec `npx expo install`. L’override npm `uuid: 11.1.1` corrige la vulnérabilité transitive de `xcode` sans rétrograder Expo. |
| `package-lock.json` | Verrouille l’arbre exact des dépendances npm. | npm install et les environnements CI/build. | Ne pas modifier manuellement. Une modification de `package.json` doit être suivie d’une régénération contrôlée du lockfile. |
| `app.config.js` | Configuration Expo CommonJS : identité DRÉPA, plateforme Android, schéma de deep link, icône, Android, plugins, splash screen, expériences et identifiant EAS. | Expo CLI, EAS CLI et les builds Android. | Conserver `name: DREPA`, `slug: drepa`, `scheme: drepa`, `platforms: ['android']`, `bj.drepa.app`, les plugins et `extra.eas.projectId`. Ne jamais y placer de secret. |
| `eas.json` | Profils EAS `development`, `preview` et `production`, tous configurés pour Android. | EAS Build. | Le profil development utilise `expo-dev-client` et produit un APK interne. Aucun secret ou identifiant Supabase ne doit être ajouté ici. |
| `tsconfig.json` | Étend la configuration Expo, active le mode strict, les types Jest et les alias `@/*` vers `src/*` et `@/assets/*` vers `assets/*`. | TypeScript, Babel/Jest et l’éditeur. | Les alias doivent rester cohérents avec les imports. Ne pas désactiver `strict` pour masquer une erreur de contrat. |
| `eslint.config.js` | Configuration ESLint flat basée sur `eslint-config-expo`, avec exclusion de `dist`. | `npm run lint`. | Toute règle désactivée doit être justifiée. Les fichiers générés ne doivent pas être ajoutés au lint sans nécessité. |
| `expo-env.d.ts` | Référence automatique aux types Expo. | TypeScript et l’éditeur. | Fichier généré à ne pas éditer manuellement. Il est ignoré par Git selon `.gitignore`. |
| `.env.example` | Noms vides des variables publiques attendues : `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` et `EXPO_PUBLIC_APP_ENV`. | Configuration locale et documentation de l’environnement. | Ne contient aucune valeur réelle. Les fichiers `.env` et `.env.local` restent ignorés et ne doivent jamais être lus ou commités dans cette référence. |
| `.gitignore` | Exclut dépendances, builds, environnements locaux, secrets, certificats, logs, caches et fichiers Expo générés. | Git. | Toute nouvelle source de secret ou de fichier généré doit être ajoutée ici sans ignorer des fichiers source utiles. |

## 6. Dossier `app/`

Les groupes entre parenthèses d’Expo Router organisent les écrans sans apparaître dans l’URL publique. Le groupe `(auth)` est public sous condition de session ; le groupe `(app)` est protégé par session et onboarding.

| Fichier / route | URL ou groupe | Rôle | Accès, dépendances et états |
|---|---|---|---|
| `app/_layout.tsx` | Layout racine | Monte `AppProvider` puis le `Stack` Expo Router. | Point d’entrée de tous les écrans. Ne doit pas contenir une redirection concurrente avec les guards enfants. |
| `app/index.tsx` | `/` | Observe l’état Auth et redirige vers la connexion ou les onglets protégés. | Affiche chargement ou erreur de configuration avec `Réessayer`. La complétude du profil est ensuite décidée par `(app)/_layout.tsx`. |
| `app/+not-found.tsx` | Absent actuellement | Route de fallback prévue dans la documentation mais non créée dans le code actuel. | À créer avant d’exposer des routes supplémentaires ; toute page inconnue devrait proposer un retour sûr. |
| `app/(auth)/_layout.tsx` | Groupe public `(auth)` | Protège les écrans publics contre une session déjà authentifiée et autorise le mode récupération. | Utilise `useAuth`, `Redirect`, `Stack` et `ScreenPlaceholder`. États de session `loading`, `error`, `authenticated` et récupération de mot de passe. |
| `app/(auth)/welcome.tsx` | `/welcome` | Onboarding visuel local en trois étapes avant l’authentification. | Utilise AsyncStorage uniquement pour la préférence non sensible d’accueil déjà vu. Ne collecte aucune donnée médicale et ne crée aucune session. Le périmètre actif est en mode clair uniquement. |
| `app/(auth)/login.tsx` | `/login` | Formulaire de connexion par e-mail et mot de passe. | React Hook Form, Zod, `useAuth`, `signIn` et redirection vers `/`. Erreurs d’authentification affichées sans token ni détail sensible. |
| `app/(auth)/register.tsx` | `/register` | Formulaire d’inscription et confirmation du mot de passe. | React Hook Form, Zod, `useAuth.signUp`. Si Supabase exige une confirmation e-mail, l’écran affiche une instruction et n’ouvre pas les routes protégées sans session. |
| `app/(auth)/forgot-password.tsx` | `/forgot-password` | Demande de récupération par e-mail. | Utilise `requestPasswordReset`, `expo-linking` via le service Auth et une réponse neutre pour ne pas révéler l’existence d’un compte. |
| `app/(auth)/reset-password.tsx` | `/reset-password` | Formulaire de nouveau mot de passe dans le contexte `PASSWORD_RECOVERY`. | Utilise le schéma Zod, `updatePassword`, SecureStore via Supabase Auth et retour à la connexion après succès. |
| `app/(auth)/legal.tsx` | `/legal` | Placeholder pour les documents légaux et les consentements versionnés. | Ne doit pas enregistrer un consentement avant identification. Les versions effectives sont centralisées dans `src/constants/legal-versions.ts`. |
| `app/(auth)/auth/callback.tsx` | Absent actuellement | Callback de confirmation e-mail prévu mais non présent dans l’arborescence réelle. | Le flux de confirmation devra être complété avec une route et une URL de deep link autorisée côté Supabase avant une validation Android complète. |
| `app/(app)/_layout.tsx` | Groupe protégé `(app)` | Vérifie la session puis le statut d’onboarding. | Utilise `useAuth`, `useOnboardingStatus`, `useSegments` et `ScreenPlaceholder`. Priorité : consentements, profil, onglets. Les erreurs de données proposent `Réessayer`. |
| `app/(app)/consent.tsx` | `/consent` | Enregistre l’acceptation des versions courantes des CGU, de la politique de confidentialité et de la charte communautaire. | Protégé par session. Utilise React Hook Form, Zod, `legalVersions` et `useAcceptConsentMutation`. Après succès, la requête est invalidée et l’utilisateur va vers `complete-profile`. |
| `app/(app)/complete-profile.tsx` | `/complete-profile` | Crée ou met à jour le profil minimal et lit une ligne existante. | Protégé par session. Utilise `useProfileQuery`, `useUpsertProfileMutation`, `profileSchema` et `auth.users.id`. `null` signifie profil absent normal ; une vraie erreur affiche `Réessayer`. |
| `app/(app)/(tabs)/_layout.tsx` | Groupe protégé `(app)/(tabs)` | Déclare les onglets principaux. | Accessible après session, consentements et profil complet. |
| `app/(app)/(tabs)/index.tsx` | Onglet accueil | Écran placeholder du socle Android. | Aucun flux médical implémenté. |
| `app/(app)/(tabs)/journal.tsx` | Onglet journal | Placeholder de la fonctionnalité journal. | Ne pas ajouter de données médicales ou de logique de journal dans cette étape. |
| `app/(app)/(tabs)/medications.tsx` | Onglet médicaments | Placeholder des médicaments et rappels. | Ne pas ajouter de prescription, d’ordonnance ou de traitement automatique. |
| `app/(app)/(tabs)/community.tsx` | Onglet communauté | Placeholder de la communauté. | Ne pas ajouter de publications, commentaires ou modération dans le socle actuel. |
| `app/(app)/(tabs)/profile.tsx` | Onglet profil | Lit le profil courant et propose la déconnexion. | Utilise `useProfileQuery`, `useAuth` et purge le cache via le provider lors de la déconnexion. |

Les routes documentées mais absentes actuellement incluent les écrans métier détaillés du journal, des médicaments, du SOS, des ressources, de la communauté et de la modération. Leur absence est volontaire tant que le périmètre correspondant n’est pas implémenté.

## 7. Dossier `src/`

### `src/components/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/components/screen-placeholder.tsx` | Composant d’état neutre pour les écrans de chargement, erreur ou fonctionnalité différée. Il accepte une action optionnelle comme `Réessayer`. | React Native uniquement. Conserver l’absence de données métier et ne pas y afficher de secret ou de diagnostic médical. |

### `src/components/ui/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/components/ui/AppText.tsx` | Texte typé avec variantes de typographie et couleur du thème actif. | `useAppTheme`, tokens typography. Ne pas utiliser de taille ou couleur locale sans justification. |
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
| `src/features/auth/schemas.test.ts` | Tests unitaires des e-mails, mots de passe et confirmations. | Jest/Babel ; utilise uniquement des valeurs de test non réelles. |

### `src/features/profile/`

| Fichier | Rôle | Dépendances, données et risques |
|---|---|---|
| `src/features/profile/queries.ts` | Requêtes TanStack Query pour `profiles` et `user_consents`. `profiles` utilise `maybeSingle()` afin que l’absence de ligne retourne `null`. Les erreurs sont classées en configuration, réseau, RLS, Supabase ou inconnues. | Dépend de Supabase et `database.types.ts`. Les identifiants viennent de `auth.users.id`; aucune requête ne doit utiliser un identifiant fourni par l’utilisateur. |
| `src/features/profile/mutations.ts` | `upsert` du profil et insertion des consentements versionnés. Invalide les clés TanStack Query correspondantes après succès. | Dépend de Supabase, `legal-versions`, `queries` et des schémas. La RLS reste l’autorité d’accès. |
| `src/features/profile/completion.ts` | Calcule `needs-consent`, `needs-profile`, `complete` et `error`. Une liste vide de consentements ou un profil `null` sont des états d’onboarding normaux. | Dépend des versions légales et des types de consentement. Ne doit pas effectuer de requête réseau. |
| `src/features/profile/use-onboarding-status.ts` | Combine l’utilisateur Auth, les requêtes profil/consentements, l’état de chargement, l’erreur structurée et le `refetch`. | Utilisé par `app/(app)/_layout.tsx`. La priorité est toujours `needs-consent → needs-profile → complete`. |
| `src/features/profile/schemas.ts` | Valide les champs de profil et les trois consentements obligatoires. | React Hook Form et Zod. Les champs facultatifs restent bornés avant envoi à PostgreSQL. |
| `src/features/profile/profile-flow.test.ts` | Vérifie les consentements courants, les consentements révoqués et les transitions d’onboarding. | Jest/Babel ; ne se connecte pas à Supabase. |

### `src/lib/`

| Fichier | Rôle | Dépendances et précautions |
|---|---|---|
| `src/lib/env.ts` | Valide les variables publiques d’environnement et retourne `null` si la configuration est incomplète. | Zod et `process.env`. Ne jamais ajouter de valeur réelle ou de clé privilégiée dans le dépôt. |
| `src/lib/supabase.ts` | Crée le client Supabase typé avec l’URL publique, la clé anon publique et l’adaptateur SecureStore. | `@supabase/supabase-js`, polyfill URL, `secure-storage.ts`, `database.types.ts`. `service_role` est interdit dans l’application mobile. |
| `src/lib/query-client.ts` | Instance globale TanStack Query avec retry limité et durée de fraîcheur de 30 secondes. | Utilisée par `QueryProvider`, les mutations et `AuthProvider`. Le cache doit être purgé lors d’un changement de compte ou d’une déconnexion. |

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
| `src/types/database.types.ts` | Types TypeScript pour `profiles`, `emergency_contacts` et `user_consents`, ainsi que le type `Json`. | Client Supabase et mutations/requêtes. Toute migration de schéma doit entraîner une régénération ou une mise à jour vérifiée de ces types. |
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

Le schéma documentaire prévoit également `user_roles` entre `profiles` et `user_consents`, mais aucune migration `user_roles` n’est présente dans le dépôt actuel. Cette différence doit rester visible avant toute implémentation d’administration ou de ressources éducatives. Les migrations déjà appliquées ne doivent jamais être modifiées : toute évolution passe par une nouvelle migration versionnée.

Les Edge Functions Supabase prévues par la documentation, notamment pour la suppression de compte, ne sont pas présentes dans `supabase/` à ce jour.

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
| `assets/images/splash-icon.png` | Image du splash screen Expo. |

### Assets présents mais non référencés par les routes actuelles

- `assets/images/tabIcons/home.png`, `home@2x.png`, `home@3x.png` ;
- `assets/images/tabIcons/explore.png`, `explore@2x.png`, `explore@3x.png` ;
- `assets/images/tutorial-web.png` ;
- `assets/images/react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png` ;
- `assets/images/logo-glow.png` ;
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
    → profileSchema
    → useProfileQuery(userId)
    → useUpsertProfileMutation(userId)
    → profiles.id = auth.users.id
    → invalidation de profileQueryKey(userId)
    → tabs
```

### Profil et déconnexion

```text
profile.tsx
    → useProfileQuery(userId)
    → AuthProvider
    → Supabase signOut
    → purge du QueryClient
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

Le callback de confirmation e-mail dédié n’existe pas encore dans `app/`. Il devra être ajouté et documenté avant de considérer le parcours de confirmation Android comme complet.

## 12. Matrice des dépendances

| Fichier | Dépend de | Utilisé par |
|---|---|---|
| `app/_layout.tsx` | `expo-router`, `src/providers/app-provider.tsx` | Toutes les routes `app/`. |
| `app/index.tsx` | `expo-router`, `useAuth`, `ScreenPlaceholder` | Expo Router comme route d’entrée. |
| `app/(auth)/login.tsx` | `auth-service` via `AuthProvider`, `auth/schemas.ts`, React Hook Form, Zod | Utilisateur non connecté. |
| `app/(auth)/register.tsx` | `auth-service` via `AuthProvider`, `auth/schemas.ts`, React Hook Form, Zod | Utilisateur non connecté. |
| `app/(auth)/forgot-password.tsx` | `auth-service` via `AuthProvider`, `auth/schemas.ts`, Expo Linking indirectement | Utilisateur demandant une récupération. |
| `app/(auth)/reset-password.tsx` | `AuthProvider`, `auth/schemas.ts` | Session de récupération de mot de passe. |
| `app/(auth)/_layout.tsx` | `AuthProvider`, `ScreenPlaceholder`, Expo Router | Toutes les routes `(auth)`. |
| `app/(app)/_layout.tsx` | `AuthProvider`, `use-onboarding-status`, `ScreenPlaceholder`, Expo Router | Toutes les routes protégées `(app)`. |
| `app/(app)/consent.tsx` | `legal-versions`, `profile/schemas`, `profile/mutations`, `AuthProvider` | Utilisateur authentifié sans consentements courants. |
| `app/(app)/complete-profile.tsx` | `profile/schemas`, `profile/queries`, `profile/mutations`, `AuthProvider` | Utilisateur authentifié avec consentements valides mais profil incomplet. |
| `src/features/auth/auth-service.ts` | `src/lib/supabase.ts`, `expo-linking` | `AuthProvider` et routes Auth. |
| `src/providers/auth-provider.tsx` | `supabase.ts`, `auth-service.ts`, `query-client.ts`, AppState | `app/_layout.tsx`, layouts Auth/App et profil. |
| `src/features/profile/queries.ts` | Supabase, `database.types.ts`, TanStack Query | `use-onboarding-status`, `complete-profile`, onglet profil. |
| `src/features/profile/mutations.ts` | Supabase, `database.types.ts`, `legal-versions`, query keys | `consent.tsx`, `complete-profile.tsx`. |
| `src/features/profile/completion.ts` | `legal-versions`, types consentement | `use-onboarding-status` et tests du flux. |
| `src/features/profile/use-onboarding-status.ts` | `AuthProvider`, queries profil/consentements, `completion.ts` | `app/(app)/_layout.tsx`. |
| `src/lib/supabase.ts` | `env.ts`, SecureStore, `database.types.ts`, Supabase JS | Services Auth, queries et mutations. |
| `src/lib/env.ts` | Zod et variables `EXPO_PUBLIC_*` | `src/lib/supabase.ts`. |
| `src/lib/query-client.ts` | TanStack Query | `QueryProvider`, `AuthProvider`, mutations. |
| `src/providers/app-provider.tsx` | `QueryProvider`, `AuthProvider` | `app/_layout.tsx`. |
| `src/providers/query-provider.tsx` | TanStack Query, `query-client.ts` | `AppProvider`. |
| `src/services/secure-storage.ts` | Expo SecureStore | `src/lib/supabase.ts`. |
| `src/types/database.types.ts` | Schéma des migrations existantes | Client Supabase et code profil. |
| `supabase/migrations/*.sql` | PostgreSQL et `auth.users` | Projet Supabase distant/local ; consommées par le client via RLS. |
| `app.config.js` | Expo et assets principaux | Expo CLI et EAS Build. |
| `eas.json` | EAS CLI | Profiles development, preview et production Android. |

Les dépendances externes importantes sont centralisées dans `package.json` : Expo/React Native, Expo Router, AsyncStorage, modules SecureStore/Notifications/Location/Linking, Supabase JS, TanStack Query, React Hook Form, Zod, ESLint, TypeScript et les outils de tests. Les fichiers de `node_modules/` ne sont pas documentés individuellement. `npm audit` doit rester à zéro vulnérabilité ; aucun correctif `--force` ne doit être utilisé s’il modifie la version majeure d’Expo.

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
