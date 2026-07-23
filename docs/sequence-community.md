# Séquences de la communauté

La communauté du MVP est limitée aux publications, commentaires, réactions `support`, signalements et suppression de son propre contenu. Les données médicales privées ne sont jamais jointes aux contenus communautaires.

## Consultation des publications

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as PostgreSQL

    U->>A: Ouvrir la communauté
    A->>Q: Charger les publications visibles
    Q->>RLS: Lire community_posts avec la session
    RLS->>RLS: Vérifier le membre authentifié
    RLS->>DB: Sélectionner les contenus non masqués
    DB-->>RLS: Publications autorisées
    RLS-->>Q: Résultats paginés
    Q-->>A: Publications
    alt Aucune publication
        A-->>U: Afficher l'état vide
    else Publications disponibles
        A-->>U: Afficher le fil et l'avertissement communautaire
    end
```

Les témoignages ne remplacent pas l'avis d'un professionnel de santé.

## Création d'une publication

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant F as React Hook Form
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as community_posts

    U->>A: Choisir Publier
    A-->>U: Afficher la charte et les limites médicales
    U->>F: Choisir une catégorie et rédiger le contenu
    U->>F: Confirmer le respect de la charte
    F->>Z: Valider catégorie, contenu, longueur et confirmation
    alt Formulaire invalide
        Z-->>F: Erreurs de validation
        F-->>U: Afficher les corrections
    else Formulaire valide
        Z-->>A: Publication validée
        A->>Q: Créer la publication
        Q->>RLS: Insérer avec user_id de la session
        RLS->>RLS: Imposer user_id = auth.uid()
        alt Accès refusé
            RLS-->>Q: Erreur d'autorisation
            Q-->>A: Échec
            A-->>U: Ne pas annoncer la publication
        else Accès autorisé
            RLS->>DB: Insérer avec is_hidden = false
            DB-->>RLS: Publication créée
            RLS-->>Q: Résultat
            Q->>Q: Invalider le fil communautaire
            Q-->>A: Succès
            A-->>U: Afficher la publication
        end
    end
```

L'application ne transforme pas une publication en conseil médical et n'en valide pas automatiquement le contenu médical.

## Ajout d'un commentaire

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as PostgreSQL

    U->>A: Rédiger un commentaire
    A->>Z: Valider contenu et longueur
    alt Commentaire invalide
        Z-->>A: Erreur
        A-->>U: Corriger le commentaire
    else Commentaire valide
        A->>Q: Créer le commentaire
        Q->>RLS: Insérer post_id, user_id et contenu
        RLS->>RLS: Vérifier user_id et visibilité de la publication
        alt Publication absente, masquée ou accès refusé
            RLS-->>Q: Refus
            Q-->>A: Échec
            A-->>U: Indiquer que le commentaire ne peut pas être publié
        else Accès autorisé
            RLS->>DB: Insérer community_comments
            DB-->>RLS: Commentaire créé
            RLS-->>Q: Confirmation
            Q->>Q: Invalider le détail de la publication
            Q-->>A: Succès
            A-->>U: Afficher le commentaire
        end
    end
```

## Ajout et retrait d'une réaction `support`

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as community_post_reactions

    U->>A: Appuyer sur Soutien
    A->>Q: Lire l'état de sa réaction
    Q->>RLS: Rechercher par post_id et auth.uid()
    RLS->>DB: Lire la réaction du propriétaire
    DB-->>RLS: Réaction présente ou absente
    RLS-->>Q: État autorisé
    Q-->>A: État de la réaction courante
    alt Aucune réaction existante
        A->>Q: Ajouter reaction_type = support
        Q->>RLS: Insérer la réaction
        RLS->>RLS: Imposer user_id = auth.uid()
        RLS->>DB: Insérer avec unicité post_id et user_id
        alt Contrainte d'unicité ou type invalide
            DB-->>RLS: Insertion refusée
            RLS-->>Q: Erreur
            Q-->>A: Échec
            A-->>U: Restaurer l'état précédent
        else Réaction créée
            DB-->>RLS: Succès
            RLS-->>Q: Confirmation
            Q->>Q: Invalider le compteur et la réaction courante
            Q-->>A: Succès
            A-->>U: Afficher Soutien actif
        end
    else Réaction support existante
        A->>Q: Retirer sa réaction
        Q->>RLS: Supprimer par post_id et auth.uid()
        RLS->>RLS: Vérifier le propriétaire
        RLS->>DB: Supprimer la réaction
        DB-->>RLS: Suppression confirmée
        RLS-->>Q: Succès
        Q->>Q: Invalider le compteur et la réaction courante
        Q-->>A: Succès
        A-->>U: Afficher Soutien inactif
    end
```

Une seule réaction est autorisée par utilisateur et publication, et son type est toujours `support`.

## Suppression de son contenu

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as PostgreSQL

    U->>A: Demander la suppression d'une publication ou d'un commentaire
    A-->>U: Demander confirmation
    U->>A: Confirmer
    A->>Q: Déclencher la suppression
    Q->>RLS: Supprimer le contenu ciblé
    RLS->>RLS: Vérifier user_id = auth.uid()
    alt Contenu d'un autre utilisateur
        RLS-->>Q: Accès refusé
        Q-->>A: Échec
        A-->>U: Ne pas modifier le fil
    else Propriétaire vérifié
        RLS->>DB: Appliquer la suppression et les relations prévues
        DB-->>RLS: Suppression confirmée
        RLS-->>Q: Succès
        Q->>Q: Invalider fil, détail et compteurs
        Q-->>A: Succès
        A-->>U: Confirmer la suppression
    end
```

Les politiques de clés étrangères et de conservation des signalements sont définies par les migrations ; le client ne contourne pas ces règles.

## Signalement d'un contenu

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as community_reports

    U->>A: Choisir Signaler sur un post ou commentaire
    A-->>U: Afficher les motifs et rappeler l'usage du signalement
    U->>A: Choisir un motif et confirmer
    A->>Z: Valider le motif et une cible unique
    alt Motif absent ou cible ambiguë
        Z-->>A: Erreur de validation
        A-->>U: Corriger le signalement
    else Signalement valide
        A->>Q: Créer le signalement
        Q->>RLS: Insérer reporter_id et cible
        RLS->>RLS: Imposer reporter_id = auth.uid()
        alt Accès refusé ou cible invalide
            RLS-->>Q: Refus
            Q-->>A: Échec
            A-->>U: Indiquer que le signalement n'est pas enregistré
        else Accès autorisé
            RLS->>DB: Insérer avec status = pending
            DB-->>RLS: Signalement créé
            RLS-->>Q: Confirmation
            Q-->>A: Succès
            A-->>U: Confirmer la réception sans promettre un délai
        end
    end
```

Le déclarant ne peut pas modifier le statut du signalement. Son traitement appartient au parcours administrateur sécurisé.

## Erreurs réseau

- Une publication, un commentaire, une réaction, une suppression ou un signalement n'est annoncé comme réussi qu'après confirmation Supabase.
- Les retries sont limités afin d'éviter les créations multiples.
- Les contraintes d'unicité protègent la réaction `support` contre les doubles insertions.
- L'interface conserve un état explicite et permet une nouvelle tentative lorsque cela ne crée pas d'ambiguïté.
- Aucun contenu médical privé n'est ajouté aux journaux d'erreur.
