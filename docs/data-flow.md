# Flux de données du MVP

## Principes

- L'application Android collecte uniquement les données nécessaires au parcours demandé.
- Supabase Auth établit l'identité ; PostgreSQL et la RLS contrôlent l'accès aux données.
- Les Edge Functions sont réservées aux opérations serveur privilégiées, notamment la suppression du compte.
- Les données médicales déclarées, les contacts et la localisation ne sont jamais exposés à la communauté.
- Les notifications de médicaments sont programmées localement sur le téléphone.

## Vue générale

```mermaid
flowchart LR
    USER["Utilisateur"]

    subgraph DEVICE["Appareil Android"]
        UI["Application React Native / Expo"]
        VALIDATION["React Hook Form + Zod"]
        QUERY["TanStack Query"]
        STORE["Expo SecureStore\nSession uniquement"]
        NOTIFICATIONS["Notifications locales"]
        LOCATION["Localisation ponctuelle"]
        PHONE["Appel et SMS manuels"]
    end

    subgraph SUPABASE["Supabase"]
        AUTH["Supabase Auth"]
        RLS["Row Level Security"]
        PRIVATE[("Données privées et sensibles")]
        COMMUNITY[("Données communautaires")]
        RESOURCES[("Ressources publiées")]
        EDGE["Edge Function\nSuppression du compte"]
    end

    USER -->|"Saisie et actions explicites"| UI
    UI --> VALIDATION
    VALIDATION --> QUERY
    QUERY <--> AUTH
    UI <--> STORE
    QUERY --> RLS
    RLS <--> PRIVATE
    RLS <--> COMMUNITY
    RLS --> RESOURCES
    QUERY -->|"Jeton de session"| EDGE
    EDGE --> AUTH
    EDGE --> PRIVATE
    UI <--> NOTIFICATIONS
    UI -->|"Permission au moment du SOS"| LOCATION
    LOCATION -->|"Position ou indisponibilité"| UI
    UI -->|"Action volontaire"| PHONE
```

## Classification des données

| Classe | Exemples | Accès attendu |
|---|---|---|
| Privées | profil, consentements, contacts, médicaments, rappels | Propriétaire uniquement, selon la RLS. |
| Sensibles | journal de santé, prises, événements SOS, coordonnées de localisation | Propriétaire uniquement ; aucun accès administrateur global implicite. |
| Communautaires | publications, commentaires, réactions `support` | Membres authentifiés selon les politiques de visibilité. |
| De modération | signalements, statut de traitement, masquage | Auteur pour la création ; administrateur vérifié pour le traitement. |
| Publiées | ressources éducatives marquées `is_published` | Lecture par les utilisateurs ; écriture réservée aux administrateurs. |
| Locales | session, identifiants de notifications programmées | Conservées sur l'appareil avec le mécanisme adapté. |

## Flux d'authentification et de profil

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Auth as Supabase Auth
    participant DB as PostgreSQL + RLS
    participant S as SecureStore

    U->>A: Inscription ou connexion
    A->>Auth: Identifiants validés
    Auth-->>A: Session authentifiée
    A->>S: Persister la session
    A->>DB: Lire profil, rôle et consentements
    DB-->>A: Lignes autorisées par RLS
    A->>A: Vérifier la complétude
    alt Profil et consentements courants
        A-->>U: Ouvrir l'espace protégé
    else Profil incomplet ou consentement absent
        A-->>U: Ouvrir le parcours de complétion
    end
```

Le rôle `user` est créé automatiquement côté Supabase après l'inscription. Le mobile ne transmet jamais un rôle à attribuer.

## Flux des données privées

1. L'utilisateur saisit une donnée dans l'application.
2. Zod valide le format et les contraintes d'interface.
3. TanStack Query transmet la requête avec la session active.
4. Supabase Auth identifie l'utilisateur.
5. La RLS vérifie que `auth.uid()` correspond au propriétaire.
6. PostgreSQL applique ses contraintes et enregistre la ligne.
7. Le cache concerné est invalidé puis actualisé.
8. Une erreur réseau conserve un état explicite sans afficher de donnée sensible dans les journaux.

La validation mobile améliore l'expérience, mais seules les contraintes PostgreSQL et la RLS font autorité.

## Flux communautaire

- Les publications et commentaires visibles sont séparés des tables médicales.
- Une réaction est limitée à `support` et au couple unique `(post_id, user_id)`.
- Un membre peut modifier ou supprimer uniquement son propre contenu selon les règles du MVP.
- Un signalement est transmis à `community_reports` sans rendre publiques les données du déclarant.
- Le masquage et le traitement d'un signalement exigent un rôle `admin` vérifié côté Supabase.

## Flux SOS

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant L as Expo Location
    participant DB as Supabase + RLS
    participant T as Téléphone

    U->>A: Appuyer sur SOS
    A-->>U: Demander confirmation
    U->>A: Confirmer
    A-->>U: Expliquer la demande de localisation
    U->>A: Accepter ou refuser
    alt Permission accordée et position disponible
        A->>L: Demander la position ponctuelle
        L-->>A: Coordonnées
    else Permission refusée ou position indisponible
        A->>A: Continuer sans coordonnées
    end
    A->>DB: Enregistrer l'événement SOS autorisé par RLS
    alt Enregistrement réussi
        DB-->>A: Confirmation
    else Réseau indisponible
        DB-->>A: Erreur explicite
        A-->>U: Indiquer que l'événement distant n'est pas garanti
    end
    A-->>U: Afficher les actions disponibles
    U->>A: Choisir appel ou SMS prérempli
    A->>T: Ouvrir l'application système
    T-->>U: Laisser l'utilisateur confirmer l'action
```

Le SOS ne collecte pas la position en continu, n'envoie pas automatiquement de message et ne garantit pas l'intervention d'un tiers.

## Suppression du compte

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant E as Edge Function authentifiée
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    U->>A: Confirmer la suppression
    A->>E: Requête avec jeton de session
    E->>Auth: Vérifier l'identité de l'appelant
    Auth-->>E: Identité validée
    E->>DB: Appliquer les règles de suppression
    E->>Auth: Supprimer le compte appelant
    E-->>A: Résultat sans donnée sensible
    A->>A: Purger session et cache privés
    A-->>U: Revenir au parcours public
```

Aucune clé privilégiée ne transite par l'application mobile.
