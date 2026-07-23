# Séquences du profil et des consentements

Un profil est complet uniquement lorsque le prénom ou pseudonyme, le pays et les consentements obligatoires courants non révoqués sont présents. Les autres informations restent facultatives.

## Chargement et décision de complétude

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Q as TanStack Query
    participant RLS as Supabase RLS
    participant DB as PostgreSQL
    participant Router as Expo Router

    U->>A: Ouvrir l'espace protégé
    A->>Q: Charger profil et consentements
    Q->>RLS: Requêtes avec la session active
    RLS->>RLS: Vérifier auth.uid()
    alt Identité non autorisée
        RLS-->>Q: Accès refusé
        Q-->>A: Erreur d'autorisation
        A->>Router: Revenir à la connexion
    else Identité autorisée
        RLS->>DB: Lire profiles et user_consents
        DB-->>RLS: Données du propriétaire
        RLS-->>Q: Résultat
        Q-->>A: Profil et historique des consentements
        A->>A: Chercher une acceptation courante non révoquée
        alt Consentements absents ou révoqués
            A->>Router: Ouvrir /(app)/consent
        else Consentements valides mais profil minimal incomplet
            A->>Router: Ouvrir /(app)/complete-profile
        else Profil minimal complet
            A->>Router: Ouvrir /(app)/(tabs)
        end
    end
```

Le contrôle d'interface n'accorde aucun accès : chaque lecture reste protégée par la RLS.

## Acceptation des consentements

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant V as React Hook Form + Zod
    participant RLS as Supabase RLS
    participant DB as user_consents
    participant Q as TanStack Query

    A-->>U: Afficher les CGU, la confidentialité et la charte courantes
    U->>A: Confirmer les trois documents
    A->>V: Valider les confirmations et versions
    alt Une confirmation manque
        V-->>A: Consentement incomplet
        A-->>U: Demander une décision explicite
    else Acceptation complète
        V-->>A: Versions validées
        A->>RLS: Insérer l'acceptation avec la session
        RLS->>RLS: Imposer user_id = auth.uid()
        alt Vérification refusée
            RLS-->>A: Accès refusé
            A-->>U: Afficher une erreur sans détail sensible
        else Vérification réussie
            RLS->>DB: Insérer versions et accepted_at
            DB-->>RLS: Consentement enregistré
            RLS-->>A: Confirmation
            A->>Q: Invalider les consentements courants
            A-->>U: Continuer vers le profil
        end
    end
```

Une nouvelle version produit une nouvelle acceptation. L'historique précédent n'est pas réécrit.

## Création du profil minimal

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant F as React Hook Form
    participant Z as Zod
    participant RLS as Supabase RLS
    participant DB as profiles
    participant Q as TanStack Query
    participant Router as Expo Router

    A-->>U: Afficher le formulaire de profil
    U->>F: Saisir prénom ou pseudonyme et pays
    U->>F: Ajouter éventuellement d'autres informations
    F->>Z: Valider les champs
    alt Identité minimale absente
        Z-->>F: Erreurs sur prénom ou pays
        F-->>U: Afficher les corrections attendues
    else Formulaire valide
        Z-->>A: Données normalisées
        A->>RLS: Upsert du profil avec id de session
        RLS->>RLS: Vérifier id = auth.uid()
        alt Accès refusé
            RLS-->>A: Erreur d'autorisation
            A-->>U: Ne pas enregistrer
        else Accès autorisé
            RLS->>DB: Créer ou mettre à jour le profil
            DB-->>RLS: Profil enregistré
            RLS-->>A: Confirmation
            A->>Q: Invalider la requête du profil
            A->>A: Vérifier aussi les consentements courants
            alt Profil désormais complet
                A->>Router: Remplacer par /(app)/(tabs)
            else Consentements non valides
                A->>Router: Remplacer par /(app)/consent
            end
        end
    end
```

Les informations médicales facultatives ne sont jamais utilisées pour produire un diagnostic ou recommander un traitement.

## Modification du profil

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Z as Zod
    participant RLS as Supabase RLS
    participant DB as profiles
    participant Q as TanStack Query

    U->>A: Modifier son profil
    A->>Z: Valider valeurs et longueurs
    alt Données invalides
        Z-->>A: Erreurs de champs
        A-->>U: Conserver le formulaire et afficher les erreurs
    else Données valides
        A->>RLS: Mettre à jour sa ligne
        RLS->>RLS: Vérifier ancien et nouveau propriétaire
        alt Tentative sur un autre profil
            RLS-->>A: Accès refusé
            A-->>U: Afficher une erreur neutre
        else Propriétaire vérifié
            RLS->>DB: Enregistrer les modifications
            DB-->>RLS: Profil mis à jour
            RLS-->>A: Confirmation
            A->>Q: Invalider profil et résumé d'accueil
            A-->>U: Confirmer la sauvegarde
        end
    end
```

## Révocation d'un consentement

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant RLS as Supabase RLS
    participant DB as user_consents
    participant Q as TanStack Query
    participant Router as Expo Router

    U->>A: Demander la révocation
    A-->>U: Expliquer les conséquences et demander confirmation
    U->>A: Confirmer
    A->>RLS: Définir revoked_at sur sa propre acceptation
    RLS->>RLS: Vérifier auth.uid() et empêcher le changement de propriétaire
    RLS->>DB: Enregistrer revoked_at
    DB-->>RLS: Révocation enregistrée
    RLS-->>A: Confirmation
    A->>Q: Invalider profil et consentements
    A->>Router: Remplacer par /(app)/consent
```

Après révocation, le profil est considéré incomplet tant qu'une acceptation valide des versions courantes n'est pas enregistrée.
