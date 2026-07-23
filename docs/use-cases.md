# Cas d'utilisation du MVP

## Acteurs

| Acteur | Responsabilité |
|---|---|
| Utilisateur | Gère son compte, ses données privées et ses interactions communautaires. |
| Administrateur | Traite les signalements, masque les contenus et gère les ressources éducatives. |
| Application mobile | Présente les parcours Android et orchestre les services autorisés. |
| Supabase | Authentifie, conserve les données, applique la RLS et exécute les opérations privilégiées. |
| Notifications locales | Programme et affiche les rappels de médicaments sur le téléphone. |
| Localisation | Fournit ponctuellement une position après consentement. |
| Téléphone | Ouvre l'appel ou l'application SMS à la demande de l'utilisateur. |

## Diagramme

```mermaid
flowchart LR
    USER["Utilisateur"]:::actor
    ADMIN["Administrateur"]:::actor
    APP["Application mobile Android"]:::system
    SUPABASE["Supabase"]:::external
    NOTIFICATIONS["Notifications locales"]:::external
    LOCATION["Localisation"]:::external
    PHONE["Téléphone / SMS"]:::external

    subgraph MVP["DRÉPA - périmètre du MVP"]
        UC_AUTH(["Créer un compte, se connecter et récupérer son accès"])
        UC_CONSENT(["Accepter ou révoquer les consentements versionnés"])
        UC_PROFILE(["Créer ou modifier son profil"])
        UC_DELETE(["Supprimer son compte"])
        UC_CONTACTS(["Gérer ses contacts d'urgence"])
        UC_LOG(["Créer une entrée de santé partielle"])
        UC_HISTORY(["Consulter historique et statistiques descriptives"])
        UC_MEDICATION(["Gérer traitements prescrits et rappels"])
        UC_INTAKE(["Confirmer, reporter ou ignorer une prise"])
        UC_SOS(["Déclencher un SOS simple"])
        UC_RESOURCES(["Consulter les ressources publiées"])
        UC_POST(["Publier et supprimer son contenu"])
        UC_COMMENT(["Commenter une publication"])
        UC_SUPPORT(["Ajouter ou retirer une réaction support"])
        UC_REPORT(["Signaler un contenu"])
        UC_MODERATE(["Traiter un signalement et masquer un contenu"])
        UC_RESOURCE_ADMIN(["Créer et publier une ressource éducative"])
    end

    USER --> UC_AUTH
    USER --> UC_CONSENT
    USER --> UC_PROFILE
    USER --> UC_DELETE
    USER --> UC_CONTACTS
    USER --> UC_LOG
    USER --> UC_HISTORY
    USER --> UC_MEDICATION
    USER --> UC_INTAKE
    USER --> UC_SOS
    USER --> UC_RESOURCES
    USER --> UC_POST
    USER --> UC_COMMENT
    USER --> UC_SUPPORT
    USER --> UC_REPORT

    ADMIN --> UC_MODERATE
    ADMIN --> UC_RESOURCE_ADMIN

    APP --> UC_AUTH
    APP --> UC_PROFILE
    APP --> UC_LOG
    APP --> UC_MEDICATION
    APP --> UC_SOS
    APP --> UC_POST

    UC_AUTH --> SUPABASE
    UC_CONSENT --> SUPABASE
    UC_PROFILE --> SUPABASE
    UC_DELETE -->|"Edge Function authentifiée"| SUPABASE
    UC_CONTACTS --> SUPABASE
    UC_LOG --> SUPABASE
    UC_HISTORY --> SUPABASE
    UC_MEDICATION --> SUPABASE
    UC_INTAKE --> SUPABASE
    UC_POST --> SUPABASE
    UC_COMMENT --> SUPABASE
    UC_SUPPORT --> SUPABASE
    UC_REPORT --> SUPABASE
    UC_MODERATE -->|"Rôle admin vérifié côté serveur"| SUPABASE
    UC_RESOURCE_ADMIN -->|"Rôle admin vérifié côté serveur"| SUPABASE

    UC_MEDICATION --> NOTIFICATIONS
    NOTIFICATIONS --> UC_INTAKE
    UC_SOS -->|"Permission ponctuelle"| LOCATION
    UC_SOS -->|"Action manuelle"| PHONE
    UC_SOS --> SUPABASE

    classDef actor fill:#ffffff,stroke:#7a1730,stroke-width:2px,color:#222222
    classDef system fill:#f4e8ed,stroke:#7a1730,stroke-width:2px,color:#222222
    classDef external fill:#eef2ff,stroke:#4b5794,stroke-width:1px,color:#222222
```

## Règles transversales

- Toutes les données privées sont protégées par RLS et limitées à leur propriétaire.
- Le rôle `user` est attribué automatiquement après l'inscription.
- Le rôle `admin` est accordé uniquement par une opération privilégiée côté Supabase.
- Une réaction communautaire est limitée au type `support`, une fois par utilisateur et publication.
- Une entrée de santé peut être partielle ; seul `recorded_at` est obligatoire.
- Le SOS demande une confirmation et reste utilisable sans localisation.
- L'appel et le SMS restent des actions manuelles de l'utilisateur.
- L'application ne fournit aucun diagnostic, aucune prescription et aucune prédiction de crise.
