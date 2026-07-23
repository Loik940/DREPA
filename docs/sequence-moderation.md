# Séquences de modération

La modération du MVP traite les signalements et permet de masquer une publication ou un commentaire. Chaque autorisation administrative est vérifiée côté Supabase ; l'interface mobile ne peut pas accorder le rôle `admin`.

## Accès à l'espace de modération

```mermaid
sequenceDiagram
    actor M as Membre
    participant A as Application Android
    participant Auth as Supabase Auth
    participant RLS as Supabase RLS
    participant Roles as user_roles
    participant Router as Expo Router

    M->>A: Ouvrir la route de modération
    A->>Auth: Vérifier la session
    alt Session absente ou expirée
        Auth-->>A: Non authentifié
        A->>Router: Remplacer par /(auth)/login
    else Session valide
        Auth-->>A: Identité authentifiée
        A->>RLS: Lire son rôle
        RLS->>Roles: Rechercher par user_id = auth.uid()
        Roles-->>RLS: user ou admin
        RLS-->>A: Rôle autorisé en lecture
        alt Rôle user
            A-->>M: Afficher Accès non autorisé
            A->>Router: Revenir aux onglets
        else Rôle admin
            A-->>M: Afficher l'espace de modération
        end
    end
```

Cette redirection améliore l'expérience, mais ne remplace jamais les politiques RLS appliquées à chaque requête administrative.

## Consultation des signalements

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant Roles as user_roles
    participant Reports as community_reports
    participant Content as community_posts et community_comments

    Admin->>A: Ouvrir les signalements en attente
    A->>Q: Charger status = pending
    Q->>RLS: Lire les signalements avec la session
    RLS->>Roles: Vérifier role = admin pour auth.uid()
    alt Rôle absent ou non admin
        Roles-->>RLS: Autorisation refusée
        RLS-->>Q: Accès refusé
        Q-->>A: Erreur d'autorisation
        A-->>Admin: Fermer l'espace de modération
    else Administrateur confirmé
        Roles-->>RLS: Autorisation accordée
        RLS->>Reports: Lire les signalements en attente
        Reports-->>RLS: Signalements autorisés
        RLS->>Content: Charger uniquement les contenus ciblés
        Content-->>RLS: Publications ou commentaires concernés
        RLS-->>Q: Dossiers de modération
        Q-->>A: Résultats paginés
        alt Aucun signalement
            A-->>Admin: Afficher l'état vide
        else Signalements disponibles
            A-->>Admin: Afficher motif, cible et statut
        end
    end
```

L'accès de modération aux contenus communautaires ne donne aucun accès global au journal de santé, aux contacts, aux médicaments ou aux événements SOS.

## Masquage d'un contenu signalé

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant Roles as user_roles
    participant Content as Post ou commentaire
    participant Reports as community_reports

    Admin->>A: Choisir Masquer le contenu
    A-->>Admin: Demander confirmation
    Admin->>A: Confirmer avec la décision
    A->>Q: Envoyer la mutation de modération
    Q->>RLS: Demander is_hidden = true
    RLS->>Roles: Vérifier role = admin côté Supabase
    alt Rôle non admin
        Roles-->>RLS: Refus
        RLS-->>Q: Mutation interdite
        Q-->>A: Échec
        A-->>Admin: Ne pas modifier l'affichage comme si l'action avait réussi
    else Administrateur confirmé
        Roles-->>RLS: Autorisation
        RLS->>Content: Masquer la cible
        alt Cible absente ou déjà supprimée
            Content-->>RLS: Cible indisponible
            RLS-->>Q: Résultat sans masquage
            Q-->>A: Demander une décision sur le signalement
            A-->>Admin: Afficher que la cible n'existe plus
        else Cible masquée
            Content-->>RLS: is_hidden = true
            RLS->>Reports: Définir status = resolved et reviewed_at
            Reports-->>RLS: Signalement traité
            RLS-->>Q: Succès
            Q->>Q: Invalider signalements, fil et contenu
            Q-->>A: Succès
            A-->>Admin: Confirmer le masquage
        end
    end
```

Le masquage ne supprime pas automatiquement le compte de l'auteur et ne constitue pas une décision médicale.

## Rejet d'un signalement

```mermaid
sequenceDiagram
    actor Admin as Administrateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant Roles as user_roles
    participant Reports as community_reports

    Admin->>A: Choisir Rejeter le signalement
    A-->>Admin: Demander confirmation
    Admin->>A: Confirmer
    A->>Q: Mettre à jour le signalement
    Q->>RLS: Demander status = rejected et reviewed_at
    RLS->>Roles: Vérifier role = admin
    alt Vérification refusée
        Roles-->>RLS: Non admin
        RLS-->>Q: Accès refusé
        Q-->>A: Échec
        A-->>Admin: Conserver le statut précédent
    else Vérification réussie
        Roles-->>RLS: Admin confirmé
        RLS->>Reports: Enregistrer la décision
        Reports-->>RLS: Signalement rejeté
        RLS-->>Q: Confirmation
        Q->>Q: Invalider la liste des signalements
        Q-->>A: Succès
        A-->>Admin: Confirmer le traitement
    end
```

Un signalement rejeté ne modifie pas la visibilité du contenu.

## Tentative administrative depuis un compte utilisateur

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant RLS as Supabase RLS
    participant Roles as user_roles
    participant DB as PostgreSQL

    U->>A: Appeler directement une mutation de masquage
    A->>RLS: Envoyer la requête avec la session user
    RLS->>Roles: Vérifier le rôle réel dans Supabase
    Roles-->>RLS: role = user
    RLS-->>A: Accès refusé
    A-->>U: Afficher une erreur neutre
    Note over DB: Aucune modification n'est exécutée
```

Même un client modifié ou un appel direct à l'API reste soumis à cette vérification.

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
- `resolved` : signalement traité, notamment après masquage confirmé.
- `rejected` : signalement examiné sans masquage.
- Une erreur réseau ne change pas localement le statut comme si la mutation avait réussi.
- Les mutations administratives invalident les caches du fil, du contenu et des signalements.
- Les erreurs ne révèlent ni jeton, ni donnée médicale privée, ni privilège serveur.
- La modération reste humaine et basique dans le MVP ; aucune modération automatisée n'est incluse.
