# Schéma de base de données du MVP

Supabase PostgreSQL est la source de vérité des données synchronisées. Toutes les tables exposées au client mobile activent Row Level Security avant leur utilisation.

## Relations

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        text email
        timestamptz created_at
    }

    PROFILES {
        uuid id PK, FK
        text first_name
        text full_name
        date date_of_birth
        text drepanocytosis_type
        text country
        text city
        text blood_group
        text allergies
        text care_center
        text doctor_name
        text doctor_phone
        timestamptz created_at
        timestamptz updated_at
    }

    USER_ROLES {
        uuid user_id PK, FK
        text role
        timestamptz created_at
        timestamptz updated_at
    }

    USER_CONSENTS {
        uuid id PK
        uuid user_id FK
        text terms_version
        text privacy_version
        text community_guidelines_version
        timestamptz accepted_at
        timestamptz revoked_at
    }

    EMERGENCY_CONTACTS {
        uuid id PK
        uuid user_id FK
        text name
        text phone
        text whatsapp_phone
        text relationship
        boolean is_primary
        boolean consent_confirmed
        timestamptz created_at
    }

    HEALTH_LOGS {
        uuid id PK
        uuid user_id FK
        integer pain_level
        text pain_location
        numeric temperature
        text hydration_level
        integer fatigue_level
        text_array symptoms
        text_array possible_triggers
        boolean medication_taken
        text notes
        timestamptz recorded_at
        timestamptz created_at
        timestamptz updated_at
    }

    MEDICATIONS {
        uuid id PK
        uuid user_id FK
        text name
        text dosage
        text frequency
        date start_date
        date end_date
        boolean is_active
        text note
        timestamptz created_at
        timestamptz updated_at
    }

    MEDICATION_REMINDERS {
        uuid id PK
        uuid user_id FK
        uuid medication_id FK
        time reminder_time
        boolean is_enabled
        timestamptz created_at
    }

    MEDICATION_INTAKES {
        uuid id PK
        uuid user_id FK
        uuid medication_id FK
        timestamptz scheduled_at
        timestamptz taken_at
        text status
    }

    SOS_EVENTS {
        uuid id PK
        uuid user_id FK
        numeric latitude
        numeric longitude
        boolean location_shared
        integer pain_level
        text_array contacts_called
        boolean message_prepared
        timestamptz created_at
        timestamptz resolved_at
    }

    EDUCATIONAL_RESOURCES {
        uuid id PK
        text title
        text summary
        text content
        text source
        text content_version
        boolean is_published
        uuid created_by FK
        uuid updated_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    COMMUNITY_POSTS {
        uuid id PK
        uuid user_id FK
        text content
        text category
        text country
        boolean is_hidden
        timestamptz created_at
        timestamptz updated_at
    }

    COMMUNITY_COMMENTS {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        text content
        boolean is_hidden
        timestamptz created_at
    }

    COMMUNITY_POST_REACTIONS {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        text reaction_type
        timestamptz created_at
    }

    COMMUNITY_REPORTS {
        uuid id PK
        uuid reporter_id FK
        uuid post_id FK
        uuid comment_id FK
        text reason
        text status
        timestamptz created_at
        timestamptz reviewed_at
    }

    AUTH_USERS ||--o| PROFILES : owns
    AUTH_USERS ||--|| USER_ROLES : receives
    AUTH_USERS ||--o{ USER_CONSENTS : accepts
    AUTH_USERS ||--o{ EMERGENCY_CONTACTS : configures
    AUTH_USERS ||--o{ HEALTH_LOGS : records
    AUTH_USERS ||--o{ MEDICATIONS : declares
    AUTH_USERS ||--o{ MEDICATION_REMINDERS : owns
    AUTH_USERS ||--o{ MEDICATION_INTAKES : owns
    AUTH_USERS ||--o{ SOS_EVENTS : triggers
    AUTH_USERS ||--o{ COMMUNITY_POSTS : writes
    AUTH_USERS ||--o{ COMMUNITY_COMMENTS : writes
    AUTH_USERS ||--o{ COMMUNITY_POST_REACTIONS : creates
    AUTH_USERS ||--o{ COMMUNITY_REPORTS : submits
    MEDICATIONS ||--o{ MEDICATION_REMINDERS : schedules
    MEDICATIONS ||--o{ MEDICATION_INTAKES : tracks
    COMMUNITY_POSTS ||--o{ COMMUNITY_COMMENTS : contains
    COMMUNITY_POSTS ||--o{ COMMUNITY_POST_REACTIONS : receives
    COMMUNITY_POSTS o|--o{ COMMUNITY_REPORTS : concerns
    COMMUNITY_COMMENTS o|--o{ COMMUNITY_REPORTS : concerns
```

Dans le diagramme, `AUTH_USERS` représente `auth.users`. Les autres noms correspondent aux tables du schéma `public` en minuscules.

## Ordre des migrations

Chaque étape est une migration distincte et versionnée :

1. `profiles`
2. `user_roles`
3. `user_consents`
4. `emergency_contacts`
5. `health_logs`
6. `medications`
7. `medication_reminders`
8. `medication_intakes`
9. `sos_events`
10. `educational_resources`
11. `community_posts`
12. `community_comments`
13. `community_post_reactions`
14. `community_reports`

Chaque migration ajoute ses contraintes, index, activation RLS et politiques associées. Une évolution ultérieure du schéma passe par une nouvelle migration, jamais par la modification d'une migration déjà appliquée.

## Contraintes essentielles

| Table | Contraintes |
|---|---|
| `profiles` | `id` référence `auth.users(id)` avec suppression en cascade ; longueurs de texte limitées. |
| `user_roles` | `user_id` unique ; `role IN ('user', 'admin')` ; rôle initial `user` créé automatiquement. |
| `user_consents` | versions et `accepted_at` obligatoires ; `revoked_at` facultatif ; historique conservé. |
| `emergency_contacts` | nom et téléphone obligatoires ; consentement confirmé ; un seul contact principal par utilisateur. |
| `health_logs` | `recorded_at` obligatoire ; douleur et fatigue facultatives mais limitées de 0 à 10 ; date future refusée pour une entrée passée. |
| `medications` | nom, dosage déclaré, fréquence et date de début obligatoires ; date de fin postérieure ou égale au début. |
| `medication_reminders` | médicament et heure obligatoires ; plusieurs lignes permettent plusieurs horaires. |
| `medication_intakes` | statut limité à `taken`, `skipped` ou `postponed`. |
| `sos_events` | coordonnées facultatives ; `location_shared` indique explicitement leur partage. |
| `educational_resources` | titre, contenu, source et version obligatoires ; publication réservée aux administrateurs ; `created_by` et `updated_by` référencent `auth.users(id)` et doivent correspondre à un administrateur dans `user_roles`. |
| `community_posts` | contenu et catégorie obligatoires ; auteur immuable. |
| `community_comments` | publication, auteur et contenu obligatoires. |
| `community_post_reactions` | `reaction_type = 'support'` ; unicité de `(post_id, user_id)`. |
| `community_reports` | une publication ou un commentaire doit être ciblé, mais pas les deux ; statut limité à `pending`, `resolved` ou `rejected`. |

Toutes les clés étrangères liées à un utilisateur utilisent `ON DELETE CASCADE`, sous réserve des règles de conservation validées. Les relations vers une publication ou un commentaire supprimé doivent conserver une stratégie cohérente avec la traçabilité de modération.

## Matrice RLS

| Domaine | Utilisateur | Administrateur |
|---|---|---|
| Profil, consentements, contacts, journal, médicaments, prises et SOS | CRUD sur ses propres lignes selon les règles métier. | Aucun accès global implicite aux données médicales privées. |
| `user_roles` | Lecture de son rôle seulement ; aucune écriture depuis le mobile. | Promotion uniquement par opération Supabase privilégiée. |
| Ressources éducatives | Lecture des ressources publiées. | Création, modification, publication et retrait. |
| Publications et commentaires | Lecture des contenus visibles ; création et gestion de son propre contenu. | Masquage pour modération. |
| Réactions | Lecture, ajout et retrait de sa propre réaction `support`. | Aucun privilège supplémentaire nécessaire. |
| Signalements | Création et lecture limitée selon la politique retenue. | Consultation et traitement après vérification du rôle côté Supabase. |

La clé publique du client ne remplace jamais la RLS. Aucune opération administrative ne dépend d'une valeur de rôle fournie par l'application mobile.

## Suppression du compte

Une Edge Function authentifiée vérifie l'identité de l'appelant puis supprime son compte avec les privilèges serveur nécessaires. Les clés privilégiées restent côté serveur. Les suppressions en cascade retirent les données personnelles conformément aux règles de conservation du MVP.
