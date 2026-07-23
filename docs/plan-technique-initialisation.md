# Plan technique d’initialisation de DRÉPA

## Objectif, livrables et contraintes

**Objectif :** transformer le dépôt presque vide — qui contient actuellement `DREPA-Cahier.md` — en socle Expo/React Native TypeScript opérationnel pour la semaine 1.

**Livrables prévus :**

- application Expo Android ;
- navigation Expo Router ;
- authentification Supabase ;
- profil utilisateur ;
- providers TanStack Query et session ;
- formulaires React Hook Form + Zod ;
- migrations SQL versionnées ;
- premières politiques RLS ;
- configuration sans secret commité ;
- tests minimaux de l’authentification et de l’isolation des données.

**Contraintes respectées :** aucune utilisation de Kotlin, Flutter ou Android natif ; aucune IA ; aucune prédiction ou nouvelle fonction médicale ; aucune clé réelle écrite dans les fichiers du dépôt.

---

# 1. Commandes exactes pour créer le projet Expo

Les commandes ci-dessous sont **proposées uniquement** ; elles ne sont pas exécutées maintenant.

Depuis `S:\Build_with_afri\DREPA`, avec PowerShell :

```powershell
# Crée le projet directement dans le dépôt actuel.
# Le template default inclut TypeScript et Expo Router.
npx create-expo-app@latest . --template default

# Vérifie ensuite le projet sur Android via Expo Go.
npm run android
```

Comme `DREPA-Cahier.md` ne porte pas le nom d’un fichier généré par Expo, il devrait être conservé. Avant exécution réelle, il faudra néanmoins vérifier le résumé affiché par `create-expo-app` et interrompre l’opération s’il annonce un écrasement.

Si `create-expo-app` refuse le répertoire parce qu’il n’est pas vide, solution de repli sûre :

```powershell
npx create-expo-app@latest .drepa-bootstrap --template default
Get-ChildItem .drepa-bootstrap -Force | Move-Item -Destination .
Remove-Item .drepa-bootstrap -Force
```

Cette solution ne devra être utilisée qu’après vérification des conflits. Elle préserve `DREPA-Cahier.md` puisqu’aucun fichier généré ne porte ce nom.

## Initialisation Git

À exécuter après génération si le dépôt n’est toujours pas initialisé :

```powershell
git init
git add .
git commit -m "chore: initialize Expo TypeScript application"
```

---

# 2. Dépendances nécessaires

## Dépendances métier et infrastructure

```powershell
npm install @supabase/supabase-js @tanstack/react-query react-hook-form zod @hookform/resolvers react-native-url-polyfill
```

## Modules Expo

Il faut employer `npx expo install` afin d’installer les versions compatibles avec le SDK Expo généré :

```powershell
npx expo install expo-secure-store expo-notifications expo-location expo-linking expo-constants
```

Pour la semaine 1, `expo-secure-store`, `expo-linking` et `expo-constants` sont directement utiles. `expo-notifications` et `expo-location` peuvent être installés dès l’initialisation, mais ne seront exploités que pendant les semaines 2 et 3.

## Outils Supabase locaux

```powershell
npm install --save-dev supabase
npx supabase init
```

Commandes ultérieures, une fois le projet Supabase distant créé et son identifiant fourni hors du code :

```powershell
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

`<PROJECT_REF>` est une valeur opérateur, pas une valeur à commiter dans le code source. L’authentification CLI reste dans l’espace utilisateur de la machine.

## Dépendances déjà normalement incluses par le template

Le template Expo Router devrait déjà installer notamment :

- `expo` ;
- `react` ;
- `react-native` ;
- `expo-router` ;
- `react-native-safe-area-context` ;
- `react-native-screens` ;
- TypeScript et les types React.

Il faudra confirmer les versions générées avant tout ajout manuel et ne pas forcer de versions susceptibles d’être incompatibles avec le SDK Expo.

---

# 3. Arborescence initiale recommandée

```text
DREPA/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── +not-found.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── legal.tsx
│   └── (app)/
│       ├── _layout.tsx
│       ├── complete-profile.tsx
│       └── (tabs)/
│           ├── _layout.tsx
│           ├── index.tsx
│           ├── journal.tsx
│           ├── medications.tsx
│           ├── community.tsx
│           └── profile.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── feedback/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── schemas/
│   │   └── profile/
│   │       ├── api/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── schemas/
│   ├── lib/
│   │   ├── env.ts
│   │   ├── query-client.ts
│   │   └── supabase.ts
│   ├── providers/
│   │   ├── app-provider.tsx
│   │   ├── auth-provider.tsx
│   │   └── query-provider.tsx
│   ├── services/
│   │   └── secure-storage.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── types/
│   │   ├── database.types.ts
│   │   └── domain.ts
│   └── utils/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 202607220001_create_profiles.sql
│   │   └── 202607220002_create_emergency_contacts.sql
│   └── seed.sql
├── assets/
├── .env.example
├── .gitignore
├── app.config.ts
├── eas.json
├── eslint.config.js
├── expo-env.d.ts
├── package.json
├── tsconfig.json
├── DREPA-Cahier.md
└── README.md
```

Principes :

- `app/` contient uniquement les routes et leurs layouts ;
- `src/features/` contient la logique par domaine ;
- `src/lib/` contient les clients techniques partagés ;
- `src/providers/` assemble session et cache ;
- `supabase/migrations/` constitue la source de vérité du schéma distant ;
- aucune logique médicale n’est ajoutée pendant l’initialisation.

---

# 4. Fichiers de configuration à créer ou adapter

## `package.json`

- scripts `start`, `android`, `ios`, `web`, `lint` ;
- scripts Supabase facultatifs : `supabase:start`, `supabase:stop`, `supabase:reset`, `types:generate` ;
- conserver les versions choisies par Expo.

## `app.config.ts`

Remplacer ou compléter `app.json` par une configuration typée :

- nom `DRÉPA` ;
- slug `drepa` ;
- schéma de deep link `drepa` ;
- identifiant Android à décider avant build, par exemple `bj.drepa.app` ;
- plugin `expo-router` ;
- plugins `expo-secure-store`, puis `expo-notifications` et `expo-location` lorsque leur usage commence ;
- messages français expliquant les permissions ;
- aucune valeur secrète dans `extra`.

## `tsconfig.json`

- conserver la base Expo ;
- activer le mode strict ;
- définir l’alias `@/*` vers `src/*` ;
- inclure `expo-env.d.ts`.

## `.env.example`

Uniquement les noms, jamais les valeurs :

```dotenv
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_ENV=
```

La clé publique Supabase est conçue pour un client mobile et sa sécurité repose sur la RLS, mais elle ne sera ni renseignée ni commitée dans ce travail. Les valeurs réelles devront venir d’un environnement local ignoré ou des variables d’environnement EAS. **La clé `service_role` ne doit jamais atteindre l’application mobile, même dans un fichier local.**

## `.gitignore`

À vérifier ou compléter avec :

```gitignore
.env
.env.*
!.env.example
.expo/
dist/
coverage/
```

## `src/lib/env.ts`

- lire les variables Expo publiques ;
- valider leur présence avec Zod ;
- échouer explicitement en développement si elles manquent ;
- ne contenir aucune valeur par défaut réelle.

## `src/lib/supabase.ts`

- importer `react-native-url-polyfill/auto` en premier ;
- créer un singleton `SupabaseClient` ;
- activer persistance et rafraîchissement de session ;
- brancher un adaptateur de stockage sécurisé ;
- ne jamais employer `service_role`.

## `src/services/secure-storage.ts`

- adapter Expo SecureStore à l’interface attendue par Supabase Auth ;
- gérer prudemment la taille maximale des valeurs stockées ;
- supprimer les jetons à la déconnexion ;
- ne jamais journaliser les sessions ou jetons.

## `src/lib/query-client.ts`

Configurer TanStack Query avec :

- retries limités ;
- délai de fraîcheur raisonnable ;
- gestion cohérente des erreurs réseau ;
- invalidation ciblée après mutation ;
- purge des données privées du cache à la déconnexion.

## `eas.json`

Prévoir les profils :

- `development` pour un development build ;
- `preview` pour l’APK de démonstration ;
- `production` pour une future distribution.

## `supabase/config.toml`

Créé par `supabase init` ; conserver les ports et paramètres locaux sans identifiant ni secret distant.

---

# 5. Structure de navigation

## Layout racine — `app/_layout.tsx`

Il doit :

1. initialiser `AppProvider` ;
2. attendre la restauration de session ;
3. afficher un écran de chargement neutre ;
4. rendre la `Stack` racine ;
5. ne pas déclencher plusieurs redirections concurrentes.

## Route d’entrée — `app/index.tsx`

Décision de navigation :

```text
Pas de session → /(auth)/login
Session + profil incomplet → /(app)/complete-profile
Session + profil complet → /(app)/(tabs)
```

## Groupe public — `app/(auth)`

- connexion ;
- inscription ;
- mot de passe oublié ;
- mentions et consentement.

Son layout redirige un utilisateur déjà connecté vers l’espace protégé.

## Groupe protégé — `app/(app)`

Son layout refuse l’accès sans session et redirige vers la connexion.

## Onglets — `app/(app)/(tabs)`

Navigation conforme au cahier :

- Accueil ;
- Journal ;
- Médicaments ;
- Communauté ;
- Profil.

Pendant la semaine 1, seul Accueil et Profil doivent être pleinement fonctionnels. Les autres routes peuvent afficher un état « prévu dans une prochaine étape », sans simuler de fonctionnalité médicale.

Le SOS ne doit pas être ajouté à la semaine 1 ; sa route sera créée pendant la semaine 3 selon le protocole prévu.

---

# 6. Configuration Supabase

## Projet distant

1. Créer un projet Supabase dans la région disponible la plus adaptée aux utilisateurs du Bénin.
2. Activer l’authentification e-mail/mot de passe.
3. Configurer l’URL de redirection mobile pour le schéma `drepa://`.
4. Définir les URL de confirmation/récupération compatibles avec Expo et le futur build EAS.
5. Désactiver les fournisseurs d’authentification non utilisés.
6. Définir une politique de mot de passe raisonnable.
7. Préparer les modèles d’e-mails en français.
8. Ne jamais exposer la clé `service_role`.

## Client mobile

Le client doit utiliser exclusivement :

- l’URL publique Supabase ;
- la clé publique/anon ou publishable ;
- une session persistée de façon sécurisée ;
- la RLS comme barrière d’autorisation réelle.

Aucune opération administrative ne doit être faite depuis le mobile.

## Cycle des migrations

```powershell
# Créer une migration
npx supabase migration new create_profiles

# Appliquer localement après démarrage de Docker/Supabase local
npx supabase start
npx supabase db reset

# Lier puis pousser vers le projet distant
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push

# Générer les types TypeScript depuis le schéma lié
npx supabase gen types typescript --linked | Set-Content -Encoding utf8 src/types/database.types.ts
```

Le projet local Supabase exige Docker. Si Docker n’est pas disponible, les migrations pourront être vérifiées dans une branche de base distante dédiée, mais la préférence reste un environnement local reproductible.

---

# 7. Premières tables et migrations Supabase

## Migration 1 — `profiles`

À réaliser pendant la semaine 1 :

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  full_name text,
  date_of_birth date,
  drepanocytosis_type text,
  country text,
  city text,
  blood_group text,
  allergies text,
  care_center text,
  doctor_name text,
  doctor_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_first_name_length check (char_length(first_name) <= 80),
  constraint profiles_full_name_length check (char_length(full_name) <= 160)
);

alter table public.profiles enable row level security;
```

Recommandations :

- garder les informations médicales facultatives ;
- ne pas créer automatiquement un profil médical rempli depuis les métadonnées d’inscription ;
- créer la ligne de profil après authentification, via un `upsert` contrôlé ;
- ajouter un trigger générique pour `updated_at` dans la migration ;
- ne pas utiliser le groupe sanguin déclaré comme preuve médicale.

## Migration 2 — `emergency_contacts`

Le schéma peut être versionné tôt pour sécuriser le modèle, mais son interface sera développée en semaine 3 :

```sql
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  whatsapp_phone text,
  relationship text,
  is_primary boolean not null default false,
  consent_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint emergency_contacts_name_length
    check (char_length(name) between 1 and 120),
  constraint emergency_contacts_consent_required
    check (consent_confirmed = true)
);

create index emergency_contacts_user_id_idx
  on public.emergency_contacts(user_id);

create unique index one_primary_emergency_contact_per_user
  on public.emergency_contacts(user_id)
  where is_primary = true;

alter table public.emergency_contacts enable row level security;
```

## Migrations suivantes, sans les implémenter en semaine 1

Ordre recommandé :

1. `profiles` ;
2. `emergency_contacts` ;
3. `health_logs` ;
4. `medications` ;
5. `medication_reminders` ;
6. `medication_intakes` ;
7. `sos_events` ;
8. `community_posts` ;
9. `community_comments` ;
10. `community_reports`.

Chaque table doit être créée par migration, accompagnée de contraintes, index, RLS et politiques testables. Ne pas créer toutes les tables dans une migration monolithique.

---

# 8. Premières politiques RLS

## Politiques de `profiles`

```sql
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);
```

## Politiques de `emergency_contacts`

```sql
create policy "emergency_contacts_select_own"
on public.emergency_contacts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "emergency_contacts_insert_own"
on public.emergency_contacts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "emergency_contacts_update_own"
on public.emergency_contacts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "emergency_contacts_delete_own"
on public.emergency_contacts
for delete
to authenticated
using ((select auth.uid()) = user_id);
```

## Règles de validation

- aucun accès accordé au rôle `anon` pour ces deux tables ;
- aucun accès global au rôle `authenticated` sans filtre propriétaire ;
- tests obligatoires avec deux comptes distincts ;
- les opérations CRUD croisées doivent échouer ;
- la suppression d’un utilisateur doit supprimer ses lignes via `on delete cascade` ;
- la communauté aura des politiques différentes, mais aucune donnée médicale ne devra y être jointe ou exposée.

---

# 9. Étapes détaillées de la semaine 1

## Jour 1 — Socle Expo

- Créer le projet Expo TypeScript.
- Vérifier Android avec Expo Go.
- Initialiser Git.
- Nettoyer uniquement les écrans de démonstration du template.
- Définir les conventions de dossiers et imports.
- Vérifier `npm run lint` et TypeScript.

**Critère de sortie :** l’application démarre sur Android sans erreur.

## Jour 2 — Configuration applicative

- Configurer `app.config.ts`, le slug et le deep link.
- Créer le thème minimal et les composants de base.
- Installer les providers TanStack Query.
- Mettre en place les états chargement, erreur et vide.
- Préparer `.env.example` sans valeur.
- Valider l’environnement au démarrage.

**Critère de sortie :** providers et configuration chargés sans secret dans Git.

## Jour 3 — Supabase et base

- Créer le projet Supabase distant.
- Initialiser le dossier `supabase/`.
- Écrire la migration `profiles` et ses contraintes.
- Activer RLS et ajouter les quatre politiques CRUD.
- Générer les types TypeScript.
- Configurer le client Supabase mobile et SecureStore.

**Critère de sortie :** connexion Supabase typée et table `profiles` protégée.

## Jour 4 — Authentification

- Construire les schémas Zod inscription/connexion.
- Créer les formulaires avec React Hook Form.
- Implémenter inscription, connexion et déconnexion.
- Restaurer la session au démarrage.
- Gérer chargement, erreurs et confirmation e-mail.
- Empêcher la fuite des messages techniques ou jetons dans les logs.

**Critère de sortie :** parcours inscription/connexion/déconnexion fonctionnel.

## Jour 5 — Navigation protégée et récupération

- Créer `AuthProvider`.
- Séparer groupes public et protégé.
- Implémenter les redirections sans boucle.
- Ajouter « mot de passe oublié ».
- Configurer et tester le deep link de récupération.
- Purger le cache utilisateur lors de la déconnexion.

**Critère de sortie :** routes protégées inaccessibles sans session et récupération opérationnelle.

## Jour 6 — Profil et consentement

- Créer le schéma Zod du profil.
- Implémenter création, lecture et modification du profil.
- Rendre facultatives les données médicales prévues comme telles.
- Présenter CGU, confidentialité, charte et avertissement médical.
- Conserver uniquement les preuves de consentement nécessaires selon le modèle final validé.
- Ajouter la suppression de compte via une Edge Function protégée ou la reporter explicitement si le flux administratif n’est pas encore sécurisé.

**Critère de sortie :** profil sauvegardé et modifiable uniquement par son propriétaire.

## Jour 7 — Validation

- Tester avec au moins deux utilisateurs.
- Vérifier les politiques `select`, `insert`, `update`, `delete`.
- Tester réseau lent et absence de réseau.
- Tester session expirée et déconnexion.
- Tester les validations de formulaires.
- Vérifier qu’aucun secret ni donnée médicale n’apparaît dans les logs.
- Exécuter lint, contrôle TypeScript et build Android de développement.
- Documenter installation et décisions techniques.

**Livrable semaine 1 :** application Android installable, authentification complète, navigation protégée, profil Supabase et RLS vérifiée.

---

# 10. Risques techniques à surveiller

## Compatibilité Expo

- Installer les modules natifs avec `expo install`, pas avec des versions arbitraires.
- Ne pas modifier les dossiers Android natifs ; rester dans le workflow Expo.
- Vérifier les permissions sur un appareil Android réel, pas uniquement dans un émulateur.

## Expo Go contre development build

- Certaines intégrations peuvent se comporter différemment dans Expo Go.
- Prévoir tôt un development build EAS, notamment avant notifications et configuration native avancée.

## Sessions Supabase

- Risque de mauvaise restauration ou de double écoute des événements Auth.
- Risque de boucle de redirection entre les layouts.
- Les jetons ne doivent jamais être logués.
- Tester rafraîchissement, expiration, déconnexion et changement d’utilisateur.

## SecureStore

- La taille des valeurs stockées peut varier selon la plateforme.
- L’adaptateur doit gérer proprement erreurs, suppression et éventuel découpage des données.
- Ne pas considérer SecureStore comme une base de données médicale hors ligne.

## RLS

- Une clé publique Supabase sans RLS correcte expose les données.
- RLS doit être activée avant d’utiliser chaque table depuis le mobile.
- Tester les quatre opérations et les accès croisés, pas seulement `select`.
- Ne jamais contourner la RLS depuis le client avec une clé privilégiée.

## Schéma et types

- Éviter les divergences entre base distante, migrations et `database.types.ts`.
- Toute évolution doit passer par une nouvelle migration.
- Régénérer les types après chaque changement de schéma.

## Deep links d’authentification

- La confirmation e-mail et la récupération de mot de passe peuvent différer entre Expo Go et un build EAS.
- Tester le schéma `drepa://` sur un véritable APK avant de considérer le flux terminé.

## Variables et secrets

- `EXPO_PUBLIC_*` est intégré au bundle et n’est donc jamais secret.
- Aucune clé serveur, SMS, WhatsApp ou `service_role` ne doit utiliser ce préfixe.
- Les secrets futurs doivent rester dans Supabase Edge Functions ou dans le gestionnaire de secrets EAS/Supabase.

## Suppression de compte

- La suppression de `auth.users` nécessite une opération serveur privilégiée.
- Elle doit passer par une Edge Function authentifiée, avec contrôle de l’identité, et jamais exposer une clé administrateur au mobile.

## Périmètre

- Le cahier des charges est ambitieux pour 30 jours : protéger la semaine 1 contre l’ajout prématuré du journal, du SOS ou de la communauté.
- Ne pas introduire d’IA, de prédiction, de diagnostic, de prescription ou de score de danger.
- Les écrans non construits doivent rester de simples placeholders clairement identifiés.

## Réseau et contexte local

- Prévoir chargement, erreur, retry limité et fonctionnement dégradé.
- Réduire les requêtes et les contenus lourds.
- Ne pas prétendre à un mode hors ligne complet pendant la semaine 1 si la synchronisation n’est pas encore conçue.

---

## Ordre d’exécution recommandé après validation

1. Générer le projet Expo dans la racine en préservant `DREPA-Cahier.md`.
2. Installer les dépendances compatibles Expo.
3. Mettre en place l'arborescence, la configuration et les providers.
4. Initialiser Supabase et écrire la migration `profiles`.
5. Ajouter et tester la RLS avant toute interface de profil.
6. Implémenter authentification, navigation protégée et profil.
7. Tester avec deux utilisateurs et sur Android réel.
8. Documenter puis créer le checkpoint Git de la semaine 1.

Aucune commande n'a été exécutée et aucun fichier n'a été modifié pour préparer ce plan. Lorsque ce plan sera validé, vous pourrez me demander de passer à l'implémentation en me faisant **toggle to Act mode**.