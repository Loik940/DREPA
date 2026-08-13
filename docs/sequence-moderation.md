# Séquences de modération

La modération du MVP traite les signalements avec les statuts `pending`, `reviewed` et `dismissed`. Elle permet de masquer ou restaurer une publication ou un commentaire, ou de rejeter un signalement. Chaque autorisation administrative est vérifiée côté Supabase ; l'interface mobile ne peut pas accorder le rôle `admin`.

## Accès à l'espace de modération

```mermaid
sequenceDiagram
    actor M as Membre
    participant A as Application Android
    participant Auth as Supabase Auth
    participant RLS as Supabase RLS
    participant Roles as user_roles
    participant Router as Expo Router

    M->>A: Ouvrir /(app)/admin/moderation ou /admin/report/[id]
    A->>Auth: Vérifier la session
    alt Session absente ou expirée
        Auth-->>A: Non authentifié
        A->>Router: Remplacer par /(auth)/login
    else Session valide
        Auth-->>A: Identité authentifiée
        A->>RLS: Vérifier le guard administrateur
        RLS->>Roles: Rechercher par user_id = auth.uid()
        Roles-->>RLS: user ou admin
        RLS-->>A: Rôle autorisé en lecture
        alt Rôle différent de admin
            A-->>M: Afficher Accès non autorisé
            A->>Router: Revenir aux onglets
        else Rôle admin
            A-->>M: Afficher la file ou le détail demandé
        end
    end
```

Le layout `admin` utilise le rôle propre au compte dans `user_roles` comme guard. Cette redirection améliore l'expérience, mais chaque RPC vérifie aussi `is_admin()` côté Supabase.

## Consultation des signalements

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant Q as TanStack Query
    participant Router as Expo Router
    participant Queue as get_community_moderation_queue
    participant Detail as get_community_moderation_report
    participant History as get_community_moderation_history
    participant Roles as user_roles

    Admin->>A: Ouvrir /(app)/admin/moderation
    A->>Q: Charger les signalements pending
    Q->>Queue: Appeler la RPC paginée
    Queue->>Roles: Vérifier is_admin() pour auth.uid()
    alt Rôle absent ou non admin
        Roles-->>Queue: Autorisation refusée
        Queue-->>Q: Erreur 42501
        Q-->>A: Erreur d'autorisation
        A-->>Admin: Fermer l'espace de modération
    else Administrateur confirmé
        Roles-->>Queue: Autorisation accordée
        Queue-->>Q: File sûre sans donnée privée de membre
        Q-->>A: Résultats paginés
        alt Aucun signalement
            A-->>Admin: Afficher l'état vide
        else Signalements disponibles
            A-->>Admin: Afficher motif, cible et statut
            Admin->>A: Ouvrir un signalement
            A->>Router: Aller vers /admin/report/[id]
            par Charger le détail
                A->>Q: Demander le signalement
                Q->>Detail: Appeler la RPC de détail
                Detail->>Roles: Vérifier is_admin()
                Detail-->>Q: Même contrat sûr que la file
            and Charger l'historique
                A->>Q: Demander les actions
                Q->>History: Appeler la RPC d'historique
                History->>Roles: Vérifier is_admin()
                History-->>Q: Actions, notes et dates
            end
        end
    end
```

Les lectures passent uniquement par `get_community_moderation_queue`, `get_community_moderation_report` et `get_community_moderation_history`. Elles ne donnent aucun accès global au journal de santé, aux contacts, aux médicaments ou aux événements SOS.

## Masquage d'un contenu signalé

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RPC as moderate_community_report
    participant Roles as user_roles
    participant Content as Post ou commentaire
    participant Reports as community_reports
    participant Audit as community_moderation_actions

    Admin->>A: Choisir Masquer le contenu
    A-->>Admin: Demander confirmation
    Admin->>A: Confirmer avec la décision
    A->>Q: Envoyer la décision hide
    Q->>RPC: moderate_community_report(report_id, hide, note)
    RPC->>Roles: Vérifier is_admin()
    alt Rôle non admin
        Roles-->>RPC: Refus
        RPC-->>Q: Erreur 42501
        Q-->>A: Échec
        A-->>Admin: Ne pas modifier l'affichage comme si l'action avait réussi
    else Administrateur confirmé
        Roles-->>RPC: Autorisation
        RPC->>Reports: Verrouiller le signalement pending
        RPC->>Content: Vérifier et verrouiller la cible
        alt Cible absente ou déjà supprimée
            Content-->>RPC: Cible indisponible
            RPC-->>Q: Erreur 55000
            Q-->>A: Échec
            A-->>Admin: Afficher que la cible n'existe plus
        else Cible déjà masquée
            RPC->>Audit: Ajouter une seule action hide liée au signalement
            RPC->>Reports: Définir status = reviewed et reviewed_at
            RPC-->>Q: Succès
            Q->>Q: Invalider signalements, fil et contenu
            Q-->>A: Succès
            A-->>Admin: Confirmer le traitement
        else Cible visible
            RPC->>Content: Définir is_hidden = true
            Content->>Audit: Journaliser automatiquement le masquage
            RPC->>Reports: Définir status = reviewed et reviewed_at
            RPC-->>Q: Succès
            Q->>Q: Invalider signalements, fil et contenu
            Q-->>A: Succès
            A-->>Admin: Confirmer le masquage
        end
    end
```

Le masquage ne supprime pas automatiquement le compte de l'auteur et ne constitue pas une décision médicale. Le journal d'audit est immuable depuis le mobile.

## Restauration d'un contenu

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant RPC as moderate_community_report
    participant Roles as user_roles
    participant Content as Post ou commentaire
    participant Audit as community_moderation_actions

    Admin->>A: Choisir Restaurer le contenu
    A->>RPC: moderate_community_report(report_id, restore, note)
    RPC->>Roles: Vérifier is_admin()
    alt Signalement non reviewed
        RPC-->>A: Erreur 55000
        A-->>Admin: Restauration refusée
    else Cible absente, supprimée ou déjà visible
        RPC-->>A: Erreur 55000
        A-->>Admin: Restauration impossible
    else Signalement reviewed et cible masquée
        RPC->>Content: Définir is_hidden = false
        Content->>Audit: Journaliser automatiquement la restauration
        RPC-->>A: Statut reviewed
        A-->>Admin: Confirmer la restauration
    end
```

Une restauration est réservée à un signalement déjà `reviewed`. Les signalements `pending` et `dismissed` sont refusés avant toute modification.

## Rejet d'un signalement

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RPC as moderate_community_report
    participant Roles as user_roles
    participant Reports as community_reports
    participant Audit as community_moderation_actions

    Admin->>A: Choisir Rejeter le signalement
    A-->>Admin: Demander confirmation
    Admin->>A: Confirmer
    A->>Q: Envoyer la décision dismiss
    Q->>RPC: moderate_community_report(report_id, dismiss, note)
    RPC->>Roles: Vérifier is_admin()
    alt Vérification refusée
        Roles-->>RPC: Non admin
        RPC-->>Q: Erreur 42501
        Q-->>A: Échec
        A-->>Admin: Conserver le statut précédent
    else Vérification réussie
        Roles-->>RPC: Admin confirmé
        RPC->>Reports: Définir status = dismissed et reviewed_at
        RPC->>Audit: Ajouter l'action dismiss_report
        RPC-->>Q: Confirmation
        Q->>Q: Invalider la liste des signalements
        Q-->>A: Succès
        A-->>Admin: Confirmer le traitement
    end
```

Un signalement `dismissed` ne modifie pas la visibilité du contenu. La décision passe toujours par `moderate_community_report`.

## Tentative administrative depuis un compte utilisateur

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant RPC as moderate_community_report
    participant Roles as user_roles
    participant DB as PostgreSQL

    U->>A: Appeler directement la RPC de décision
    A->>RPC: Envoyer la requête avec la session user
    RPC->>Roles: Vérifier le rôle réel dans Supabase
    Roles-->>RPC: role = user
    RPC-->>A: Accès refusé
    A-->>U: Afficher une erreur neutre
    Note over DB: Aucune modification n'est exécutée
```

Même un client modifié ou un appel direct à l'API reste soumis à cette vérification. Aucun `UPDATE` direct de `community_reports` ou du journal d'audit n'est accordé au mobile.

## Promotion vers administrateur

```mermaid
sequenceDiagram
    actor Operator as Opérateur Supabase autorisé
    participant Privileged as Opération privilégiée
    participant Roles as user_roles
    participant Mobile as Application mobile

    Operator->>Privileged: Demander une promotion contrôlée
    Privileged->>Privileged: Vérifier l'autorisation opérateur
    alt Autorisation valide
        Privileged->>Roles: Mettre role = admin
        Roles-->>Privileged: Promotion enregistrée
        Privileged-->>Operator: Confirmation
    else Autorisation invalide
        Privileged-->>Operator: Refus
    end
    Mobile-xRoles: Aucune écriture de rôle autorisée
```

L'application mobile peut adapter son interface après lecture du rôle, mais elle ne peut jamais promouvoir un compte.

## États et erreurs

- `pending` : signalement en attente de traitement.
- `reviewed` : signalement traité, notamment après un masquage confirmé ; une restauration conserve cet état.
- `dismissed` : signalement examiné puis rejeté sans modifier la visibilité.
- Les lectures administratives utilisent les RPC de file, détail et historique.
- Les décisions utilisent uniquement `moderate_community_report` ; aucune mise à jour directe n'est autorisée.
- Chaque masquage, restauration ou rejet ajoute une action au journal d'audit immuable.
- Une erreur réseau ne change pas localement le statut comme si la mutation avait réussi.
- Les mutations administratives invalident les caches du fil, du contenu et des signalements.
- Les erreurs ne révèlent ni jeton, ni donnée médicale privée, ni privilège serveur.
- La modération reste humaine et basique dans le MVP ; aucune modération automatisée n'est incluse.
