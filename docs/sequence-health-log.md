# Séquences du journal de santé

Une entrée peut être partielle. Seul `recorded_at` est obligatoire ; toutes les mesures et observations sont facultatives.

## Création d'une entrée partielle

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant F as React Hook Form
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as health_logs

    U->>A: Ouvrir Nouvelle entrée
    A->>F: Initialiser recorded_at
    A-->>U: Afficher les champs facultatifs
    U->>F: Renseigner zéro, un ou plusieurs champs
    U->>A: Enregistrer
    F->>Z: Valider l'entrée
    alt recorded_at absent ou futur
        Z-->>F: Erreur de date
        F-->>U: Corriger la date obligatoire
    else Douleur ou fatigue hors de 0 à 10
        Z-->>F: Erreur de plage
        F-->>U: Corriger la valeur concernée
    else Entrée valide, même sans mesure
        Z-->>A: Données validées
        A->>Q: Déclencher la mutation
        Q->>RLS: Insérer avec user_id de la session
        RLS->>RLS: Vérifier user_id = auth.uid()
        alt Accès refusé
            RLS-->>Q: Erreur d'autorisation
            Q-->>A: Échec
            A-->>U: Afficher une erreur neutre
        else Accès autorisé
            RLS->>DB: Insérer l'entrée
            DB-->>RLS: Entrée créée
            RLS-->>Q: Résultat
            Q->>Q: Invalider historique et statistiques
            Q-->>A: Succès
            A-->>U: Confirmer l'enregistrement
        end
    end
```

Champs facultatifs : douleur, localisation, fatigue, température, hydratation, symptômes, facteurs possibles, prise déclarée de médicaments et notes.

## Erreur réseau pendant la sauvegarde

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant F as Formulaire
    participant Q as TanStack Query
    participant S as Supabase

    U->>A: Enregistrer une entrée valide
    A->>Q: Envoyer la mutation
    Q-xS: Réseau indisponible ou interrompu
    Q-->>A: Erreur réseau après retries limités
    A->>F: Conserver les valeurs saisies en mémoire
    A-->>U: Signaler que l'entrée n'est pas enregistrée
    A-->>U: Proposer une nouvelle tentative explicite
    U->>A: Réessayer
    A->>Q: Relancer la mutation
    alt Réseau rétabli
        Q->>S: Insérer l'entrée
        S-->>Q: Confirmation
        Q-->>A: Succès
        A-->>U: Confirmer l'enregistrement
    else Réseau toujours indisponible
        Q-->>A: Nouvel échec
        A-->>U: Maintenir l'état d'erreur sans faux succès
    end
```

Le MVP ne prétend pas fournir une synchronisation hors ligne complète. Une erreur ne doit jamais être présentée comme une sauvegarde réussie.

## Consultation de l'historique

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as health_logs

    U->>A: Ouvrir l'historique
    A->>Q: Demander les entrées triées par recorded_at
    Q->>RLS: Lire les lignes avec la session
    RLS->>RLS: Appliquer user_id = auth.uid()
    alt Accès autorisé
        RLS->>DB: Sélectionner les entrées du propriétaire
        DB-->>RLS: Résultats paginés
        RLS-->>Q: Entrées autorisées
        Q-->>A: Données
        alt Aucune entrée
            A-->>U: Afficher l'état vide
        else Entrées disponibles
            A-->>U: Afficher l'historique
        end
    else Accès refusé ou session expirée
        RLS-->>Q: Erreur d'autorisation
        Q-->>A: Échec
        A-->>U: Revenir vers l'authentification
    end
```

Les statistiques calculées à partir de cet historique sont uniquement descriptives et ne constituent aucune interprétation médicale.

## Modification d'une entrée

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as health_logs

    U->>A: Modifier une entrée existante
    A->>Z: Valider les nouvelles valeurs
    alt Validation refusée
        Z-->>A: Erreurs de date, plage ou longueur
        A-->>U: Afficher les corrections
    else Validation réussie
        A->>Q: Envoyer la mutation
        Q->>RLS: Mettre à jour l'entrée
        RLS->>RLS: Vérifier ancien et nouveau user_id
        alt Entrée d'un autre utilisateur
            RLS-->>Q: Accès refusé
            Q-->>A: Échec
            A-->>U: Afficher une erreur neutre
        else Propriétaire vérifié
            RLS->>DB: Enregistrer les modifications
            DB-->>RLS: Entrée mise à jour
            RLS-->>Q: Confirmation
            Q->>Q: Invalider détail, historique et statistiques
            Q-->>A: Succès
            A-->>U: Confirmer la modification
        end
    end
```

## Suppression d'une entrée

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as health_logs

    U->>A: Demander la suppression
    A-->>U: Demander confirmation
    U->>A: Confirmer
    A->>Q: Déclencher la suppression
    Q->>RLS: Supprimer par identifiant
    RLS->>RLS: Vérifier user_id = auth.uid()
    alt Propriétaire vérifié
        RLS->>DB: Supprimer l'entrée
        DB-->>RLS: Suppression confirmée
        RLS-->>Q: Succès
        Q->>Q: Invalider historique et statistiques
        Q-->>A: Succès
        A-->>U: Revenir à l'historique
    else Accès refusé
        RLS-->>Q: Erreur
        Q-->>A: Échec
        A-->>U: Ne pas modifier les données affichées
    end
```

Le journal enregistre des informations déclarées par l'utilisateur. Il ne fournit aucun diagnostic, aucune prescription et aucune prédiction de crise.
