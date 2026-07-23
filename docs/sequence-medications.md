# Séquences des médicaments et rappels

Le module aide l'utilisateur à organiser un traitement qu'il déclare comme prescrit. Il ne recommande aucun médicament, aucun dosage et aucune modification de traitement.

## Ajout d'un traitement déclaré

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant F as React Hook Form
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as medications

    U->>A: Ouvrir Ajouter un médicament
    A-->>U: Afficher la mention de traitement prescrit
    U->>F: Saisir nom, dosage prescrit et fréquence
    U->>F: Saisir dates et note éventuelle
    F->>Z: Valider le formulaire
    alt Champs requis absents ou dates incohérentes
        Z-->>F: Erreurs de validation
        F-->>U: Afficher les corrections
    else Formulaire valide
        Z-->>A: Valeurs déclarées
        A->>Q: Créer le médicament
        Q->>RLS: Insérer avec user_id de la session
        RLS->>RLS: Vérifier user_id = auth.uid()
        alt Accès refusé
            RLS-->>Q: Erreur d'autorisation
            Q-->>A: Échec
            A-->>U: Afficher une erreur neutre
        else Accès autorisé
            RLS->>DB: Enregistrer le traitement déclaré
            DB-->>RLS: Médicament créé
            RLS-->>Q: Résultat
            Q->>Q: Invalider la liste des médicaments
            Q-->>A: Succès
            A-->>U: Proposer d'ajouter un rappel
        end
    end
```

L'application conserve le texte saisi par l'utilisateur sans valider médicalement le médicament ou son dosage.

## Programmation d'un rappel local

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Z as Zod
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as medication_reminders
    participant N as Expo Notifications

    U->>A: Choisir un médicament et une heure
    A->>Z: Valider l'heure et le médicament
    alt Données invalides
        Z-->>A: Erreur
        A-->>U: Corriger le rappel
    else Données valides
        A->>RLS: Vérifier l'accès au médicament
        RLS-->>A: Médicament appartenant à l'utilisateur
        A->>N: Vérifier la permission de notification
        alt Permission non déterminée
            N-->>A: Demande nécessaire
            A-->>U: Expliquer l'utilité et les limites
            U->>N: Accepter ou refuser
        end
        alt Permission refusée
            N-->>A: Notifications interdites
            A-->>U: Indiquer que le rappel ne peut pas être activé
        else Permission accordée
            A->>N: Programmer la notification locale
            alt Programmation locale échouée
                N-->>A: Erreur de programmation
                A-->>U: Ne pas annoncer un rappel actif
            else Notification programmée
                N-->>A: Identifiant local
                A->>Q: Enregistrer le rappel actif
                Q->>RLS: Insérer medication_reminders
                RLS->>RLS: Vérifier utilisateur et médicament
                RLS->>DB: Enregistrer heure et is_enabled
                DB-->>RLS: Rappel créé
                RLS-->>Q: Confirmation
                Q-->>A: Succès
                A-->>U: Confirmer le rappel et afficher ses limites
            end
        end
    end
```

Si l'enregistrement distant échoue après la programmation locale, l'application annule la notification nouvellement créée ou indique explicitement l'état à corriger afin d'éviter un rappel fantôme.

## Déclenchement et confirmation d'une prise

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant N as Notification locale
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as medication_intakes

    N-->>U: Afficher le rappel programmé
    U->>A: Ouvrir le rappel
    A-->>U: Proposer Pris, Reporter ou Non pris
    alt Pris
        U->>A: Confirmer la prise
        A->>Q: Créer une prise status = taken
        Q->>RLS: Insérer l'événement
        RLS->>RLS: Vérifier user_id et medication_id
        RLS->>DB: Enregistrer scheduled_at et taken_at
        DB-->>RLS: Prise enregistrée
        RLS-->>Q: Confirmation
        Q-->>A: Succès
        A-->>U: Confirmer l'enregistrement déclaré
    else Reporter
        U->>A: Choisir une nouvelle heure
        A->>N: Programmer une notification locale de report
        N-->>A: Résultat de programmation
        A->>Q: Créer une prise status = postponed
        Q->>RLS: Insérer l'événement de report
        RLS->>DB: Enregistrer le report
        DB-->>RLS: Report enregistré
        RLS-->>Q: Confirmation
        Q-->>A: Succès
        A-->>U: Afficher la nouvelle heure
    else Non pris
        U->>A: Déclarer la prise non effectuée
        A->>Q: Créer une prise status = skipped
        Q->>RLS: Insérer l'événement
        RLS->>DB: Enregistrer le statut
        DB-->>RLS: Statut enregistré
        RLS-->>Q: Confirmation
        Q-->>A: Succès
        A-->>U: Confirmer l'enregistrement
    end
    A->>Q: Invalider historique des prises et résumé
```

L'absence d'interaction avec une notification n'est pas automatiquement interprétée comme une prise manquée. Le statut `skipped` résulte d'une déclaration explicite de l'utilisateur.

## Erreur réseau lors d'une confirmation

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant S as Supabase

    U->>A: Déclarer Pris, Reporter ou Non pris
    A->>Q: Enregistrer la déclaration
    Q-xS: Réseau indisponible
    Q-->>A: Échec après retries limités
    A-->>U: Indiquer que la déclaration n'est pas synchronisée
    A-->>U: Proposer une nouvelle tentative
    alt Nouvelle tentative réussie
        A->>Q: Relancer l'enregistrement
        Q->>S: Envoyer la déclaration
        S-->>Q: Confirmation
        Q-->>A: Succès
        A-->>U: Confirmer la synchronisation
    else Échec persistant
        A-->>U: Conserver un état d'erreur explicite
    end
```

Un affichage local ne doit jamais faire croire qu'une confirmation a été sauvegardée dans Supabase lorsqu'elle ne l'a pas été.

## Désactivation ou suppression d'un rappel

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant N as Expo Notifications
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as medication_reminders

    U->>A: Désactiver ou supprimer un rappel
    A->>RLS: Vérifier la propriété du rappel
    alt Rappel d'un autre utilisateur
        RLS-->>A: Accès refusé
        A-->>U: Ne rien modifier
    else Propriétaire vérifié
        RLS-->>A: Accès autorisé
        A->>N: Annuler la notification locale
        N-->>A: Annulation traitée
        A->>Q: Mettre à jour ou supprimer le rappel
        Q->>RLS: Mutation avec la session
        RLS->>DB: Appliquer la mutation autorisée
        DB-->>RLS: Confirmation
        RLS-->>Q: Succès
        Q->>Q: Invalider les rappels
        Q-->>A: Succès
        A-->>U: Confirmer la modification
    end
```

## Limites

- Les notifications peuvent être empêchées par les permissions, l'arrêt du téléphone, l'économie d'énergie ou la désinstallation.
- Un rappel est une aide d'organisation et ne garantit pas la prise.
- Les prises enregistrées sont des déclarations de l'utilisateur.
- L'application ne prescrit pas, ne recommande pas de dosage, ne modifie pas un traitement et ne conseille jamais son arrêt.
