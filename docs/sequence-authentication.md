# Séquences d'authentification

Supabase Auth gère l'identité et les sessions. L'application Android ne crée ni ne modifie directement les rôles.

## Inscription et rôle initial

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant V as React Hook Form + Zod
    participant Auth as Supabase Auth
    participant DB as PostgreSQL
    participant T as Trigger de rôle
    participant S as SecureStore

    U->>A: Saisir e-mail et mot de passe
    A->>V: Valider le formulaire
    alt Formulaire invalide
        V-->>A: Erreurs de validation
        A-->>U: Afficher des messages compréhensibles
    else Formulaire valide
        V-->>A: Données validées
        A->>Auth: Demander l'inscription
        Auth->>DB: Créer auth.users
        DB->>T: Déclencher le traitement du nouveau compte
        T->>DB: Insérer user_roles avec role = user
        alt Confirmation e-mail requise
            Auth-->>A: Inscription créée, confirmation attendue
            A-->>U: Demander de confirmer l'adresse e-mail
        else Session immédiatement disponible
            Auth-->>A: Retourner la session
            A->>S: Stocker la session
            A-->>U: Ouvrir le parcours de consentement
        end
    end
```

Le trigger est contrôlé côté Supabase. Le client ne transmet aucune valeur de rôle. Une promotion vers `admin` exige une opération privilégiée distincte.

## Connexion

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant V as Zod
    participant Auth as Supabase Auth
    participant S as SecureStore
    participant DB as PostgreSQL + RLS

    U->>A: Saisir ses identifiants
    A->>V: Valider le format
    alt Format invalide
        V-->>A: Erreurs locales
        A-->>U: Corriger les champs
    else Format valide
        A->>Auth: Ouvrir une session
        alt Identifiants refusés
            Auth-->>A: Erreur d'authentification neutre
            A-->>U: Afficher l'échec sans détail sensible
        else Authentification réussie
            Auth-->>A: Session
            A->>S: Persister la session
            A->>DB: Lire profil, rôle et consentements
            DB-->>A: Données autorisées par RLS
            A-->>U: Rediriger selon la complétude
        end
    end
```

## Restauration de session

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant S as SecureStore
    participant Auth as Supabase Auth
    participant DB as PostgreSQL + RLS
    participant R as Expo Router

    U->>A: Ouvrir l'application
    A->>R: Afficher un chargement neutre
    A->>S: Lire la session persistée
    alt Aucune session
        S-->>A: Valeur absente
        A->>R: Remplacer par /(auth)/login
    else Session présente
        S-->>A: Session locale
        A->>Auth: Vérifier ou rafraîchir la session
        alt Session expirée et non renouvelable
            Auth-->>A: Session invalide
            A->>S: Supprimer la session
            A->>R: Remplacer par /(auth)/login
        else Session valide
            Auth-->>A: Session active
            A->>DB: Charger profil et consentements
            DB-->>A: Résultat protégé par RLS
            A->>R: Rediriger vers consentement, profil ou onglets
        end
    end
```

Une seule décision de navigation est prise après la fin de la restauration afin d'éviter les boucles de redirection.

## Déconnexion

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Auth as Supabase Auth
    participant S as SecureStore
    participant Q as TanStack Query
    participant R as Expo Router

    U->>A: Demander la déconnexion
    A->>Auth: Fermer la session
    Auth-->>A: Session invalidée
    A->>S: Supprimer la session locale
    A->>Q: Purger le cache privé
    A->>R: Remplacer la pile par /(auth)/login
    A-->>U: Afficher l'écran de connexion
```

Les jetons et données du cache ne sont jamais journalisés.

## Récupération du mot de passe

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant Auth as Supabase Auth
    participant Mail as Messagerie de l'utilisateur
    participant Link as Lien profond Android

    U->>A: Demander la récupération
    A->>Auth: Envoyer la demande pour l'e-mail saisi
    Auth-->>A: Réponse neutre
    A-->>U: Indiquer de consulter sa messagerie
    Auth->>Mail: Envoyer le lien de récupération
    U->>Mail: Ouvrir le message
    Mail->>Link: Ouvrir le lien DRÉPA
    Link->>A: Transmettre les paramètres de récupération
    A->>Auth: Vérifier le contexte de récupération
    alt Lien invalide ou expiré
        Auth-->>A: Refus
        A-->>U: Afficher un message neutre et proposer une nouvelle demande
    else Lien valide
        Auth-->>A: Autoriser le changement
        U->>A: Saisir un nouveau mot de passe
        A->>Auth: Mettre à jour le mot de passe
        Auth-->>A: Confirmation
        A-->>U: Confirmer puis ouvrir la connexion
    end
```

Le lien profond est validé dans un development build et dans l'APK Android.
