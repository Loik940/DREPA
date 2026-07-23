# Périmètre du MVP DRÉPA

## Objectif

Livrer en 30 jours une application Android démontrable permettant à un adulte vivant avec la drépanocytose de suivre son état déclaré, organiser ses traitements prescrits, contacter un proche et participer à une communauté modérée.

DRÉPA est un outil d'accompagnement. Le MVP ne remplace pas un médecin, un traitement, un hôpital ou un service d'urgence.

## Plateforme et stack

- Android uniquement ;
- React Native, Expo et TypeScript ;
- Expo Router ;
- Supabase Auth, PostgreSQL, Row Level Security et Edge Functions ;
- TanStack Query ;
- React Hook Form et Zod ;
- Expo SecureStore ;
- Expo Notifications pour les rappels locaux ;
- Expo Location avec consentement ;
- EAS Build pour le development build et l'APK.

## Parcours principal

1. Consulter et accepter les documents obligatoires dans leurs versions courantes.
2. Créer un compte ou se connecter.
3. Compléter le profil avec un prénom ou pseudonyme et un pays.
4. Ajouter un contact d'urgence.
5. Enregistrer une entrée de santé, éventuellement partielle.
6. Ajouter un traitement prescrit et programmer un rappel local.
7. Consulter l'historique et des statistiques descriptives simples.
8. Déclencher un SOS simple et choisir une action manuelle.
9. Consulter une ressource éducative publiée.
10. Consulter ou publier du contenu dans la communauté.

## Fonctionnalités incluses

### Compte et consentements

- inscription par e-mail et mot de passe ;
- connexion, déconnexion et restauration de session ;
- récupération du mot de passe ;
- acceptation versionnée des CGU, de la politique de confidentialité et de la charte communautaire ;
- révocation des consentements ;
- suppression sécurisée du compte par une Edge Function authentifiée ;
- attribution automatique du rôle `user` après inscription.

### Profil

- création, consultation et modification du profil ;
- prénom ou pseudonyme et pays obligatoires pour compléter le profil ;
- informations personnelles et médicales facultatives prévues par le cahier des charges ;
- accès limité au propriétaire par RLS.

### Contacts et SOS

- gestion de plusieurs contacts d'urgence ;
- désignation d'un contact principal ;
- confirmation avant déclenchement du SOS ;
- demande contextuelle de localisation ;
- fonctionnement dégradé sans localisation ;
- enregistrement de l'événement SOS ;
- proposition d'appel manuel ;
- ouverture de l'application SMS avec un message prérempli ;
- affichage des limites du service.

### Journal et historique

- création, modification et suppression d'une entrée ;
- `recorded_at` obligatoire et autres données facultatives ;
- douleur et fatigue validées entre 0 et 10 lorsqu'elles sont présentes ;
- refus des dates futures pour une entrée passée ;
- historique personnel ;
- statistiques descriptives simples ;
- états vide, chargement, erreur et absence de réseau.

### Médicaments et rappels

- enregistrement d'un traitement déclaré comme prescrit ;
- gestion de plusieurs horaires ;
- notifications locales ;
- activation, désactivation et suppression d'un rappel ;
- confirmation, report ou absence de prise ;
- historique des confirmations.

### Ressources éducatives

- consultation des ressources publiées ;
- présence d'une source, d'une version ou date de mise à jour et d'une mention de prudence ;
- création, modification et publication réservées aux administrateurs.

### Communauté et modération

- consultation et création de publications ;
- commentaires ;
- une réaction `support` au maximum par utilisateur et publication ;
- retrait de sa propre réaction ;
- suppression de son propre contenu ;
- signalement d'une publication ou d'un commentaire ;
- consultation et traitement des signalements par un administrateur ;
- masquage de base des contenus par un administrateur ;
- contrôle du rôle administrateur côté Supabase.

## Fonctionnalités exclues

- iOS et web ;
- diagnostic médical ;
- prescription ou recommandation de dosage ;
- prédiction de crise ;
- modification automatique d'un traitement ;
- téléconsultation ;
- dossier médical officiel ;
- paiement ou commande de médicaments ;
- intégration directe avec les hôpitaux ;
- compte professionnel de santé ;
- chat privé ;
- modération entièrement automatisée ;
- envoi automatique de SMS ou de messages WhatsApp ;
- collecte permanente de la localisation ;
- annuaire médical et cartographie avancée ;
- synchronisation avec des objets connectés.

## Critères d'acceptation

Le MVP est accepté si :

- un utilisateur peut s'inscrire, se connecter, restaurer sa session, se déconnecter et récupérer son mot de passe ;
- le rôle `user` est créé automatiquement et ne peut pas être modifié depuis le mobile ;
- les consentements courants peuvent être acceptés, vérifiés et révoqués ;
- le profil n'est complet qu'avec un prénom ou pseudonyme, un pays et les consentements courants ;
- un utilisateur peut modifier son profil et supprimer son compte de manière sécurisée ;
- les données privées d'un utilisateur sont inaccessibles à un autre utilisateur ;
- un contact d'urgence peut être créé et désigné comme principal ;
- une entrée contenant uniquement `recorded_at` peut être enregistrée ;
- les entrées peuvent être consultées, modifiées et supprimées par leur propriétaire ;
- un médicament et plusieurs rappels locaux peuvent être configurés ;
- une prise peut être confirmée, reportée ou marquée comme non prise ;
- le SOS fonctionne avec ou sans localisation disponible et prépare un appel ou un SMS manuel ;
- les ressources publiées sont consultables et leur administration est protégée ;
- publications, commentaires, réactions et signalements fonctionnent selon les règles RLS ;
- un administrateur vérifié côté Supabase peut traiter un signalement et masquer un contenu ;
- les erreurs réseau et refus de permissions sont gérés sans exposer de données sensibles ;
- un APK Android installable est produit et testé sur un appareil réel ;
- les mentions de prudence médicale et les limites du SOS sont visibles.

## Sécurité minimale

- RLS activée avant l'accès mobile à chaque table ;
- politiques testées avec deux utilisateurs distincts et un administrateur ;
- session stockée avec Expo SecureStore ;
- aucune clé privilégiée dans le client mobile ;
- opérations administratives contrôlées par Supabase ;
- suppression de compte exécutée par une Edge Function authentifiée ;
- localisation demandée seulement au moment utile et jamais collectée en permanence ;
- purge du cache privé lors de la déconnexion ;
- absence de jetons et de données médicales dans les journaux techniques.

## Planning sur 30 jours

### Semaine 1 : socle et compte

- initialiser Expo, TypeScript et Expo Router ;
- configurer Supabase, SecureStore et TanStack Query ;
- créer les migrations des profils, rôles et consentements ;
- mettre en place RLS ;
- réaliser l'authentification, le profil et la suppression de compte ;
- tester sur Android.

### Semaine 2 : journal et traitements

- créer le journal partiel, l'historique et les statistiques simples ;
- ajouter les médicaments et rappels locaux ;
- gérer les confirmations de prise ;
- tester les validations et les erreurs réseau.

### Semaine 3 : urgence et ressources

- ajouter les contacts d'urgence ;
- réaliser le parcours SOS avec localisation facultative ;
- préparer l'appel et le SMS manuels ;
- publier les premières ressources éducatives validées ;
- tester avec et sans réseau, GPS ou permission.

### Semaine 4 : communauté et livraison

- réaliser publications, commentaires, réactions et signalements ;
- ajouter la modération administrative de base ;
- vérifier les politiques RLS avec plusieurs rôles ;
- corriger les défauts et améliorer l'accessibilité ;
- produire et tester l'APK Android ;
- documenter les fonctionnalités livrées et les limites.

## Limites explicites

- les statistiques décrivent uniquement les données saisies par l'utilisateur ;
- les rappels ne garantissent pas la prise d'un traitement ;
- le SOS ne garantit ni la transmission d'un message ni l'intervention d'un tiers ;
- la localisation peut être refusée ou indisponible ;
- les témoignages communautaires ne constituent pas des conseils médicaux ;
- les informations éducatives générales ne remplacent pas l'avis d'un professionnel de santé.
