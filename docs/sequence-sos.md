# Séquences du SOS

Le SOS du MVP prépare des actions manuelles. Il ne constitue pas un service d'urgence et ne garantit ni l'enregistrement de l'événement, ni la transmission d'un message, ni l'intervention d'un tiers.

## Déclenchement principal

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant RLS as Supabase RLS
    participant DB as PostgreSQL
    participant L as Expo Location
    participant T as Téléphone

    U->>A: Appuyer sur SOS
    A-->>U: Afficher une confirmation et les limites
    alt Annulation
        U->>A: Annuler
        A-->>U: Revenir à l'écran précédent
    else Confirmation
        U->>A: Confirmer le SOS
        A->>RLS: Lire profil et contact principal
        RLS->>RLS: Vérifier auth.uid()
        RLS->>DB: Charger les données du propriétaire
        DB-->>RLS: Profil et contact autorisés
        RLS-->>A: Informations d'urgence
        A-->>U: Expliquer la demande de localisation
        U->>A: Accepter ou refuser la demande
        alt Localisation autorisée et disponible
            A->>L: Demander une position ponctuelle
            L-->>A: Latitude et longitude
            A->>A: Préparer location_shared = true
        else Permission refusée ou position indisponible
            L-->>A: Aucune position exploitable
            A->>A: Continuer avec location_shared = false
        end
        A->>RLS: Insérer sos_events avec l'utilisateur courant
        RLS->>RLS: Vérifier user_id = auth.uid()
        alt Réseau et autorisation disponibles
            RLS->>DB: Enregistrer l'événement
            DB-->>RLS: Événement créé
            RLS-->>A: Confirmation
            A-->>U: Indiquer que l'événement est enregistré
        else Échec réseau ou autorisation
            RLS-->>A: Échec d'enregistrement
            A-->>U: Indiquer clairement que l'événement distant n'est pas enregistré
        end
        A-->>U: Afficher fiche d'urgence et actions manuelles
        U->>A: Choisir Appeler ou Préparer un SMS
        A->>T: Ouvrir l'application système choisie
        T-->>U: Demander la confirmation finale du téléphone
    end
```

Les actions d'appel et de SMS restent disponibles même si la localisation ou l'enregistrement Supabase échoue.

## Localisation consentie

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant L as Expo Location

    A-->>U: Expliquer l'usage ponctuel de la position
    A->>L: Lire l'état de la permission
    alt Permission déjà accordée
        L-->>A: Autorisée
        A->>L: Demander la position courante
    else Permission non déterminée
        L-->>A: Demande nécessaire
        A->>L: Demander la permission système
        L-->>U: Afficher la boîte de dialogue Android
        U-->>L: Accepter ou refuser
        L-->>A: Retourner le résultat de permission
        opt Permission accordée
            A->>L: Demander la position courante
        end
    else Permission déjà refusée
        L-->>A: Refusée
        A-->>U: Expliquer le fonctionnement sans position
    end
    alt Position obtenue dans le délai prévu
        L-->>A: Coordonnées
        A->>A: Ajouter un lien de position au message
    else Position absente, refusée ou expirée
        L-->>A: Indisponibilité
        A->>A: Préparer le message sans position
        A-->>U: Indiquer que la localisation est indisponible
    end
```

Aucune permission de localisation en arrière-plan n'est demandée. Aucune collecte permanente n'est effectuée.

## Appel manuel

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant P as Application Téléphone

    A-->>U: Afficher le contact principal et son numéro
    U->>A: Choisir Appeler
    A->>A: Vérifier qu'un numéro utilisable est présent
    alt Numéro absent ou invalide
        A-->>U: Indiquer qu'aucun appel ne peut être préparé
    else Numéro disponible
        A->>P: Ouvrir le composeur avec le numéro
        P-->>U: Afficher l'appel à confirmer
        U->>P: Lancer ou annuler l'appel
    end
```

L'ouverture du composeur ne prouve pas que l'appel a été lancé, reçu ou traité.

## SMS prérempli

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant A as Application Android
    participant S as Application SMS

    U->>A: Choisir Préparer un SMS
    A->>A: Construire le message d'alerte
    Note over A: Pseudonyme, date et position seulement si disponible
    A->>A: Ajouter les limites et l'orientation vers les urgences locales
    alt Aucun numéro disponible
        A-->>U: Demander de choisir ou saisir un destinataire dans l'application SMS
        A->>S: Ouvrir le message sans destinataire imposé
    else Contact principal disponible
        A->>S: Ouvrir le message avec destinataire et texte préremplis
    end
    S-->>U: Afficher le brouillon
    U->>S: Vérifier puis envoyer ou annuler
```

L'application n'envoie jamais automatiquement le SMS et ne peut pas garantir sa livraison.

## Fonctionnement dégradé

```mermaid
flowchart TD
    START["SOS confirmé"]
    CONTACT{"Contact disponible ?"}
    LOCATION{"Position disponible ?"}
    NETWORK{"Supabase joignable ?"}
    ACTIONS["Afficher les actions manuelles"]
    RECORD["Enregistrer sos_events"]
    WARN_CONTACT["Indiquer l'absence de contact configuré"]
    NO_LOCATION["Préparer le message sans position"]
    WARN_NETWORK["Indiquer que l'événement n'est pas enregistré"]
    PHONE["Ouvrir appel ou SMS selon les données disponibles"]

    START --> CONTACT
    CONTACT -->|"Oui"| LOCATION
    CONTACT -->|"Non"| WARN_CONTACT
    WARN_CONTACT --> LOCATION
    LOCATION -->|"Oui"| NETWORK
    LOCATION -->|"Non"| NO_LOCATION
    NO_LOCATION --> NETWORK
    NETWORK -->|"Oui"| RECORD
    NETWORK -->|"Non"| WARN_NETWORK
    RECORD --> ACTIONS
    WARN_NETWORK --> ACTIONS
    ACTIONS --> PHONE
```

## Limites obligatoires à afficher

- Le SOS dépend du téléphone, du réseau, des permissions et de la disponibilité des contacts.
- Une position peut être imprécise ou indisponible.
- Un événement non enregistré dans Supabase ne doit jamais être présenté comme sauvegardé.
- L'appel et le SMS nécessitent une action finale de l'utilisateur.
- En cas de danger immédiat, l'utilisateur doit contacter les services d'urgence locaux ou se rendre dans un centre de santé.
- Aucune information affichée ne constitue un diagnostic, une prescription ou une prédiction de crise.
