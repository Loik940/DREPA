# 🩸 DRÉPA

## Ma santé, ma force, ma communauté.

### Cahier des charges fonctionnel et technique

---

## Informations générales

| Élément | Description |
|---|---|
| Nom du projet | DRÉPA |
| Slogan | Ma santé, ma force, ma communauté. |
| Type de produit | Application mobile Android |
| Technologie mobile | React Native, Expo et TypeScript |
| Backend | Supabase |
| Public cible | Personnes vivant avec la drépanocytose en Afrique francophone |
| Porteur du projet | Oswald Loïk TCHEGNON |
| Pays de lancement | Bénin |
| Programme | Imọlẹ Build — 30 jours |
| Version du document | v1.1 |
| Date | Juillet 2026 |
| Première plateforme ciblée | Android |
| Extension prévue | iOS et autres pays d’Afrique francophone |

---

# 1. Présentation du projet

## 1.1 Le porteur du projet

Oswald Loïk TCHEGNON est étudiant en deuxième année d’Entrepreneuriat et Création d’Entreprise à l’IFRI-UAC au Bénin.

Il est également développeur full-stack JavaScript et possède une expérience avec React.js, Node.js, Supabase et les applications web.

Il a notamment développé VENDAI, une plateforme SaaS d’automatisation des ventes via WhatsApp destinée aux commerçants africains.

Oswald vit lui-même avec la drépanocytose depuis sa naissance. Le projet DRÉPA est donc né d’un besoin personnel et d’une volonté de construire un outil qu’il aurait aimé utiliser au quotidien.

## 1.2 Vision du projet

DRÉPA est une application mobile destinée à accompagner les personnes vivant avec la drépanocytose dans leur suivi quotidien.

L’application doit permettre de :

- mieux suivre les douleurs et les symptômes ;
- conserver un historique personnel ;
- organiser les traitements prescrits ;
- recevoir des rappels ;
- enregistrer des contacts d’urgence ;
- contacter rapidement ses proches en cas de besoin ;
- accéder à des informations fiables ;
- échanger avec une communauté de personnes concernées.

DRÉPA est un outil d’accompagnement. Elle ne remplace pas un médecin, un hôpital, un traitement ou un service d’urgence.

## 1.3 Positionnement

DRÉPA est une application mobile francophone pensée pour les réalités des personnes vivant avec la drépanocytose en Afrique.

Elle prend en compte :

- l’utilisation majoritaire de téléphones Android ;
- la diversité des appareils disponibles ;
- les connexions internet parfois instables ;
- le coût des données mobiles ;
- le besoin d’une interface simple et rapide ;
- l’importance des proches dans la gestion des situations difficiles ;
- l’accès limité à des spécialistes dans certaines régions ;
- le besoin d’informations accessibles en français.

DRÉPA ne se présente pas comme la première solution existante dans le domaine. Elle se positionne comme une solution complémentaire, adaptée au contexte africain francophone et construite à partir de l’expérience d’un patient développeur.

---

# 2. Contexte et problème identifié

## 2.1 La drépanocytose

La drépanocytose est une maladie génétique chronique qui peut provoquer notamment :

- des épisodes douloureux ;
- une fatigue importante ;
- une anémie ;
- des infections ;
- des complications nécessitant parfois une prise en charge médicale rapide.

Les personnes vivant avec cette maladie doivent généralement bénéficier d’un suivi médical régulier et respecter les traitements prescrits par leurs professionnels de santé.

L’Afrique subsaharienne concentre une part importante des personnes vivant avec la drépanocytose et des naissances d’enfants atteints de la maladie.

Les chiffres utilisés dans les communications de DRÉPA devront toujours être accompagnés d’une source vérifiable, par exemple :

- Organisation mondiale de la Santé ;
- ministère de la Santé ;
- centre hospitalier ;
- association reconnue ;
- publication scientifique.

Aucun chiffre non vérifié ne devra être présenté comme une donnée officielle.

## 2.2 Problèmes rencontrés

Les personnes vivant avec la drépanocytose peuvent rencontrer les difficultés suivantes :

- oubli des prises de médicaments ;
- difficulté à suivre l’évolution de leur douleur ;
- absence d’historique structuré à présenter au médecin ;
- difficulté à identifier certains facteurs déclenchants personnels ;
- isolement pendant les épisodes douloureux ;
- accès limité à des informations fiables en français ;
- difficulté à retrouver rapidement les proches à contacter ;
- manque d’outils numériques adaptés au contexte local ;
- difficulté à trouver des centres ou ressources spécialisés.

## 2.3 Besoin identifié

Il existe un besoin pour une application simple permettant de centraliser :

- un journal de santé personnel ;
- les traitements et rappels ;
- les contacts d’urgence ;
- des informations personnelles utiles ;
- des ressources éducatives ;
- une communauté d’échange et de soutien.

---

# 3. Objectifs du projet

## 3.1 Objectif général

Développer une application mobile Android permettant aux personnes vivant avec la drépanocytose de mieux suivre leur quotidien, d’organiser leurs traitements prescrits et de contacter rapidement leurs proches en cas de besoin.

## 3.2 Objectifs spécifiques

L’application devra permettre à l’utilisateur de :

1. créer un compte ;
2. gérer son profil ;
3. enregistrer son état de santé quotidien ;
4. consulter son historique ;
5. visualiser des statistiques simples ;
6. ajouter ses traitements prescrits ;
7. programmer des rappels ;
8. enregistrer des contacts d’urgence ;
9. déclencher une alerte SOS ;
10. accéder à des ressources fiables ;
11. publier dans une communauté ;
12. signaler un contenu problématique.

## 3.3 Objectif du MVP en 30 jours

Le MVP doit permettre à un utilisateur de réaliser le parcours suivant :

```text
Créer un compte
    ↓
Compléter son profil
    ↓
Ajouter un contact d’urgence
    ↓
Enregistrer son état de santé
    ↓
Ajouter un médicament et un rappel
    ↓
Consulter son historique
    ↓
Déclencher un SOS simple
    ↓
Consulter ou publier dans la communauté
```

---

# 4. Public cible

## 4.1 Utilisateurs principaux

Le public principal est constitué de personnes vivant avec la drépanocytose et utilisant un téléphone Android.

Pour le MVP, la cible prioritaire sera :

- les adultes ;
- les jeunes adultes ;
- les étudiants ;
- les personnes suivies dans un centre de santé ;
- les personnes capables de gérer elles-mêmes leur compte.

## 4.2 Utilisateurs mineurs

La prise en charge des mineurs nécessitera :

- un cadre parental ou légal ;
- une politique de consentement adaptée ;
- une réflexion spécifique sur la confidentialité ;
- une validation médicale et juridique.

La gestion complète des comptes mineurs est donc reportée à une version ultérieure.

## 4.3 Professionnels de santé

Les professionnels de santé ne constituent pas la cible principale du MVP.

Une version future pourra leur permettre, avec le consentement explicite de l’utilisateur :

- de consulter certaines données ;
- de recevoir un résumé ;
- de suivre l’évolution déclarée ;
- de communiquer avec le patient.

Cette fonctionnalité ne sera pas disponible dans le MVP.

---

# 5. Périmètre du projet

## 5.1 Fonctionnalités incluses dans le MVP

Le MVP comprendra :

- l’authentification ;
- le profil utilisateur ;
- les contacts d’urgence ;
- le journal de santé ;
- l’historique des entrées ;
- les statistiques simples ;
- la gestion des médicaments ;
- les rappels locaux ;
- le bouton SOS basique ;
- les ressources éducatives ;
- une communauté simple ;
- le signalement de contenus ;
- un APK Android de démonstration.

## 5.2 Fonctionnalités exclues du MVP

Les fonctionnalités suivantes sont reportées :

- prédiction médicale des crises ;
- diagnostic automatisé ;
- modification automatique des traitements ;
- téléconsultation ;
- paiement ;
- commande de médicaments ;
- intégration directe avec les hôpitaux ;
- compte professionnel de santé ;
- application iOS ;
- chat privé avancé ;
- modération entièrement automatisée ;
- dossier médical officiel ;
- synchronisation avec des objets connectés ;
- collecte permanente de la localisation ;
- analyse médicale validée par intelligence artificielle.

---

# 6. Fonctionnalités détaillées

## 6.1 Authentification

L’utilisateur doit pouvoir :

- créer un compte avec une adresse e-mail ;
- se connecter ;
- se déconnecter ;
- réinitialiser son mot de passe ;
- conserver sa session ;
- supprimer son compte.

### Données nécessaires

- adresse e-mail ;
- mot de passe ;
- identifiant utilisateur ;
- date de création du compte.

L’authentification sera gérée par Supabase Auth.

## 6.2 Conditions d’utilisation

Lors de la première utilisation, l’utilisateur devra pouvoir consulter et accepter :

- les conditions générales d’utilisation ;
- la politique de confidentialité ;
- la charte de communauté ;
- la mention de non-substitution à un professionnel de santé.

L’utilisateur devra pouvoir retirer son consentement et demander la suppression de son compte selon les modalités prévues par l’application.

---

## 6.3 Profil utilisateur

L’utilisateur pourra renseigner :

- prénom ou pseudonyme ;
- nom complet, facultatif ;
- date de naissance, facultative ;
- pays ;
- ville ;
- type de drépanocytose, facultatif ;
- groupe sanguin, facultatif ;
- allergies connues ;
- centre de suivi ;
- nom du médecin référent, facultatif ;
- numéro du médecin référent, facultatif.

### Remarques importantes

- Les informations médicales facultatives ne doivent pas être obligatoires pour utiliser le journal.
- Le groupe sanguin saisi par l’utilisateur ne doit pas être considéré comme une preuve médicale officielle.
- L’application ne doit pas déduire un traitement ou un protocole à partir du profil.
- L’utilisateur doit pouvoir modifier ou supprimer ses données.

---

## 6.4 Tableau de bord

L’écran d’accueil pourra afficher :

- le prénom ou pseudonyme de l’utilisateur ;
- la dernière entrée du journal ;
- le prochain rappel de médicament ;
- un accès rapide au journal ;
- un accès aux médicaments ;
- un accès aux contacts d’urgence ;
- le bouton SOS ;
- un accès aux ressources ;
- un résumé statistique simple.

Le tableau de bord ne devra pas afficher de diagnostic ou de niveau de danger médical automatique.

---

## 6.5 Journal de santé

L’utilisateur pourra créer une entrée de santé quotidienne.

### Données enregistrables

- niveau de douleur de 0 à 10 ;
- localisation de la douleur ;
- niveau de fatigue de 0 à 10 ;
- température corporelle, facultative ;
- niveau d’hydratation déclaré ;
- symptômes ;
- facteurs ou déclencheurs possibles ;
- prise déclarée des médicaments ;
- notes personnelles ;
- date et heure de l’entrée.

### Exemples de symptômes

- fatigue ;
- maux de tête ;
- douleurs osseuses ;
- essoufflement ;
- fièvre ;
- nausées ;
- douleurs abdominales ;
- vertiges ;
- autre symptôme.

### Exemples de facteurs possibles

- déshydratation ;
- froid ;
- stress ;
- effort physique ;
- manque de sommeil ;
- maladie ou infection récente ;
- voyage ;
- autre facteur.

L’application doit préciser que ces informations sont déclarées par l’utilisateur et ne constituent pas un diagnostic.

### Contraintes de validation

- le niveau de douleur doit être compris entre 0 et 10 ;
- le niveau de fatigue doit être compris entre 0 et 10 ;
- la température doit être facultative ;
- les champs texte doivent être limités en longueur ;
- l’utilisateur doit pouvoir modifier ou supprimer une entrée ;
- les dates futures ne doivent pas être acceptées pour une entrée passée.

---

## 6.6 Historique et statistiques

L’utilisateur pourra consulter :

- ses entrées précédentes ;
- l’évolution de son niveau de douleur ;
- son niveau de fatigue ;
- les symptômes les plus fréquents ;
- les facteurs déclarés ;
- le nombre de jours suivis ;
- le nombre de jours avec douleur ;
- la moyenne de douleur sur une période ;
- le nombre de rappels confirmés.

### Limites

Les statistiques ont uniquement une fonction de suivi personnel.

Elles ne doivent pas être présentées comme :

- une interprétation médicale ;
- un diagnostic ;
- une prédiction ;
- une preuve de l’efficacité d’un traitement.

Exemple de message acceptable :

> Vous avez enregistré davantage de douleurs cette semaine que la semaine précédente. Vous pouvez en parler à votre professionnel de santé.

Exemple de message à éviter :

> Une crise va commencer demain.

---

## 6.7 Gestion des médicaments

L’utilisateur pourra enregistrer les traitements qui lui ont été prescrits.

### Informations enregistrables

- nom du médicament ;
- dosage prescrit ;
- fréquence ;
- heure ou heures de prise ;
- date de début ;
- date de fin, facultative ;
- statut actif ou arrêté ;
- note personnelle.

### Règles importantes

L’application :

- ne prescrit aucun médicament ;
- ne conseille pas de dosage ;
- ne modifie pas un traitement ;
- ne recommande pas l’arrêt d’un traitement ;
- ne remplace pas l’ordonnance ;
- ne valide pas une automédication.

L’utilisateur devra être informé qu’il doit suivre les instructions de son professionnel de santé.

---

## 6.8 Rappels de médicaments

L’utilisateur pourra :

- créer un rappel ;
- choisir une heure ;
- définir plusieurs horaires ;
- activer ou désactiver un rappel ;
- confirmer une prise ;
- reporter un rappel ;
- consulter l’historique des confirmations ;
- supprimer un rappel.

Les rappels seront principalement des notifications locales programmées sur le téléphone.

### Limites

Les notifications peuvent ne pas apparaître si :

- le téléphone est éteint ;
- les notifications sont bloquées ;
- le mode économie d’énergie empêche l’exécution ;
- l’application est désinstallée ;
- le système limite les tâches en arrière-plan.

L’application doit indiquer que les rappels sont une aide à l’organisation et non une garantie de prise du traitement.

---

## 6.9 Contacts d’urgence

L’utilisateur pourra enregistrer plusieurs contacts d’urgence.

### Informations

- nom ;
- relation avec l’utilisateur ;
- numéro de téléphone ;
- numéro WhatsApp, facultatif ;
- contact principal ou secondaire ;
- consentement confirmé.

L’utilisateur devra confirmer qu’il a informé les personnes enregistrées de leur rôle.

L’application ne doit pas ajouter automatiquement un contact sans son accord.

---

## 6.10 Bouton SOS

Le bouton SOS doit être facilement accessible depuis les principales pages de l’application.

### Fonctionnement prévu dans le MVP

Lorsque l’utilisateur appuie sur le bouton SOS :

1. l’application affiche une confirmation ;
2. l’utilisateur confirme l’alerte ;
3. l’application demande la localisation si elle n’est pas déjà autorisée ;
4. l’application récupère la position si elle est disponible ;
5. l’application affiche les informations d’urgence personnelles ;
6. l’application propose d’appeler le contact principal ;
7. l’application prépare un message d’alerte ;
8. l’utilisateur peut ouvrir son application SMS ;
9. l’événement SOS est enregistré dans Supabase ;
10. l’application affiche les limites du service.

### Message d’urgence indicatif

```text
ALERTE SOS DRÉPA

[Prénom ou pseudonyme] a déclenché une alerte.

Date et heure : [date et heure]
Position : [lien de localisation si disponible]

Veuillez contacter rapidement cette personne.

En cas de danger immédiat, contactez les services d’urgence locaux
ou rendez-vous dans le centre de santé le plus proche.
```

### Protocole personnel

Une fiche d’informations personnelles pourra être affichée à l’écran, par exemple :

- allergies déclarées ;
- groupe sanguin déclaré ;
- centre de suivi ;
- personne à contacter ;
- informations importantes saisies par l’utilisateur.

Un protocole de traitement ou une dose ne devra jamais être généré automatiquement par l’application ou par l’intelligence artificielle.

Si un protocole est ajouté dans une version future, il devra être fourni ou validé par un professionnel de santé.

### Limites du SOS

Le SOS dépend :

- du réseau mobile ;
- de la connexion internet ;
- de l’autorisation de localisation ;
- de la disponibilité du GPS ;
- de la configuration du téléphone ;
- de la disponibilité des contacts ;
- des services externes utilisés.

L’application ne doit pas promettre qu’un message sera toujours livré.

### SMS

Dans le MVP, l’application pourra ouvrir l’application SMS du téléphone avec un message prérempli.

L’envoi automatique de SMS nécessitera :

- un fournisseur compatible avec le Bénin ;
- une fonction serveur sécurisée ;
- une gestion des coûts ;
- le respect des règles applicables ;
- des tests réels de livraison.

### WhatsApp

L’envoi automatique via WhatsApp ne sera possible que si une solution officiellement compatible est utilisée.

L’utilisation d’un lien WhatsApp pour ouvrir une conversation est différente de l’envoi automatique via une API.

L’intégration WhatsApp Business sera étudiée après le MVP, sous réserve :

- de la disponibilité du service ;
- des règles de WhatsApp ;
- du consentement des contacts ;
- de la gestion des modèles de messages ;
- du coût des envois.

### Médecin référent

Une alerte automatique à un médecin ne sera pas activée par défaut.

Elle nécessitera :

- l’accord explicite du médecin ;
- le consentement de l’utilisateur ;
- une procédure claire ;
- une vérification de la disponibilité du service ;
- une gestion de la responsabilité et des délais de réponse.

---

## 6.11 Ressources éducatives

L’application pourra proposer des contenus sur :

- la compréhension de la drépanocytose ;
- le suivi médical ;
- l’hydratation ;
- l’organisation des consultations ;
- les traitements ;
- les facteurs déclenchants ;
- la vie quotidienne ;
- l’activité physique ;
- les signes nécessitant une prise en charge rapide ;
- les associations et ressources disponibles.

Chaque contenu devra comporter :

- un titre ;
- une description ;
- une source ;
- une date de publication ;
- une date de mise à jour ;
- une mention de prudence médicale.

### Mention obligatoire

> Ces informations sont générales et ne remplacent pas l’avis d’un professionnel de santé. En cas de symptôme important, inhabituel ou inquiétant, contactez rapidement un professionnel ou un service d’urgence.

Les contenus médicaux devront être relus ou validés par une personne compétente avant publication publique.

---

## 6.12 Communauté

La communauté permettra aux utilisateurs d’échanger leurs expériences et de se soutenir.

### Fonctionnalités du MVP

- consulter les publications ;
- créer une publication ;
- choisir une catégorie ;
- commenter ;
- réagir à une publication ;
- signaler un contenu ;
- utiliser un pseudonyme ;
- filtrer par pays ou catégorie ;
- supprimer sa propre publication.

### Catégories possibles

- témoignage ;
- question ;
- motivation ;
- vie quotidienne ;
- expérience personnelle ;
- activité physique ;
- alimentation ;
- ressources ;
- autre.

### Règles de communauté

Les utilisateurs ne doivent pas :

- donner une prescription personnalisée ;
- recommander un dosage ;
- recommander l’arrêt d’un traitement ;
- publier de fausses informations médicales ;
- harceler un autre membre ;
- publier les données personnelles d’un tiers ;
- faire la promotion de produits dangereux ;
- publier de contenu discriminatoire ;
- publier de contenu violent ou illégal.

### Message d’avertissement

> Les témoignages et conseils partagés par les membres ne remplacent pas l’avis d’un professionnel de santé.

### Modération du MVP

Le MVP devra comporter :

- un bouton de signalement ;
- une table des signalements ;
- un statut de traitement ;
- un rôle administrateur ;
- la possibilité de masquer un contenu ;
- une charte de communauté.

Le chat privé entre membres est reporté à une version ultérieure afin de limiter les risques de modération et de confidentialité.

---

## 6.13 Intelligence artificielle

L’intelligence artificielle ne sera pas utilisée pour diagnostiquer ou prédire avec certitude les crises dans le MVP.

### Fonctionnalités IA possibles après le MVP

Une fonctionnalité expérimentale pourra aider à :

- expliquer des notions générales ;
- reformuler une information ;
- orienter vers une ressource ;
- aider l’utilisateur à préparer une consultation ;
- résumer ses propres données, avec son consentement ;
- identifier des tendances descriptives.

### Fonctionnalités interdites

L’IA ne devra pas :

- établir un diagnostic ;
- annoncer qu’une crise va survenir ;
- confirmer une urgence ;
- modifier un traitement ;
- recommander une dose ;
- remplacer un médecin ;
- demander à l’utilisateur de retarder des soins ;
- générer un protocole médical personnalisé non validé.

### Exemple de réponse acceptable

> Vos symptômes récents semblent différents de vos habitudes déclarées. Notez leur évolution et contactez votre centre de suivi si la situation persiste ou s’aggrave.

### Exemple de réponse interdite

> Vous aurez une crise demain.

### Source IA

Le modèle exact utilisé dépendra des modèles disponibles dans l’API Imọlẹ Build.

Aucune référence à un modèle précis ne devra être incluse dans la documentation tant que sa disponibilité n’a pas été confirmée.

---

## 6.14 Annuaire médical

L’annuaire médical est prévu après le MVP ou sous une forme très limitée.

Il pourra contenir :

- centres de santé ;
- hôpitaux ;
- associations ;
- services spécialisés ;
- pays ;
- villes ;
- numéros officiels ;
- adresses ;
- horaires vérifiés ;
- coordonnées géographiques.

Les informations devront préciser :

- leur source ;
- leur date de vérification ;
- leur date de dernière mise à jour.

L’application ne garantit pas :

- la disponibilité d’un médecin ;
- la disponibilité d’un médicament ;
- l’ouverture d’un centre ;
- la qualité d’un établissement ;
- le délai de prise en charge.

### Cartographie

La carte des centres proches n’est pas une priorité du MVP.

Une version future pourra utiliser :

- React Native Maps ;
- MapLibre ;
- une autre solution mobile compatible ;
- des données vérifiées provenant de sources fiables.

Leaflet, principalement utilisé dans les applications web, ne sera pas utilisé directement dans l’application mobile native du MVP.

---

# 7. Parcours utilisateurs

## 7.1 Première utilisation

1. L’utilisateur ouvre l’application.
2. Il consulte la présentation de DRÉPA.
3. Il accepte les conditions d’utilisation.
4. Il crée un compte ou se connecte.
5. Il renseigne les informations minimales.
6. Il peut ajouter un contact d’urgence.
7. Il arrive sur le tableau de bord.

## 7.2 Enregistrement d’une entrée de santé

1. L’utilisateur ouvre le journal.
2. Il indique son niveau de douleur.
3. Il sélectionne ses symptômes.
4. Il renseigne les autres informations disponibles.
5. Il ajoute une note si nécessaire.
6. Il valide.
7. L’application confirme l’enregistrement.
8. L’entrée apparaît dans l’historique.

## 7.3 Création d’un rappel

1. L’utilisateur ouvre la section Médicaments.
2. Il ajoute un traitement prescrit.
3. Il renseigne les horaires.
4. Il active le rappel.
5. L’application demande l’autorisation de notification.
6. Le rappel est programmé localement.

## 7.4 Déclenchement d’un SOS

1. L’utilisateur appuie sur le bouton SOS.
2. Une confirmation est affichée.
3. L’utilisateur confirme.
4. La localisation est demandée si nécessaire.
5. L’événement est enregistré.
6. Les actions disponibles s’affichent.
7. L’utilisateur peut appeler un proche.
8. L’utilisateur peut ouvrir son application SMS.
9. La fiche d’informations personnelles s’affiche.

## 7.5 Publication communautaire

1. L’utilisateur ouvre la communauté.
2. Il appuie sur « Publier ».
3. Il choisit une catégorie.
4. Il rédige son message.
5. Il accepte les règles de communauté.
6. Il publie.
7. Le contenu peut être signalé ou modéré.

---

# 8. Architecture technique

## 8.1 Technologies principales

| Technologie | Rôle |
|---|---|
| React Native | Développement de l’application mobile |
| Expo | Développement, permissions et outils mobiles |
| TypeScript | Typage et sécurité du code |
| Expo Router | Navigation basée sur les fichiers |
| Supabase Auth | Authentification |
| Supabase PostgreSQL | Base de données |
| Supabase Storage | Stockage éventuel de fichiers |
| Supabase Edge Functions | Logique serveur et intégrations |
| Row Level Security | Protection des données |
| TanStack Query | Gestion du cache et des données serveur |
| React Hook Form | Gestion des formulaires |
| Zod | Validation des formulaires |
| Expo Notifications | Notifications locales |
| Expo Location | Géolocalisation avec consentement |
| Expo SecureStore | Stockage local sécurisé |
| EAS Build | Génération de l’application Android |
| API IA Imọlẹ | Fonctionnalités IA expérimentales futures |

## 8.2 Services externes éventuels

Les services suivants pourront être étudiés après le MVP :

- fournisseur SMS compatible avec le Bénin ;
- WhatsApp Business Cloud API ou fournisseur officiellement compatible ;
- service cartographique mobile ;
- service météo ;
- service d’e-mail transactionnel ;
- API IA Imọlẹ.

Les clés secrètes des services externes ne doivent jamais être stockées dans l’application mobile.

## 8.3 Principes techniques

- développer d’abord pour Android ;
- privilégier une architecture simple ;
- séparer les écrans, les composants et les services ;
- protéger les variables sensibles ;
- utiliser des fonctions serveur pour les opérations sensibles ;
- limiter les requêtes réseau ;
- prévoir les états de chargement ;
- gérer les erreurs réseau ;
- prévoir une expérience correcte avec une connexion lente ;
- éviter la collecte inutile de données ;
- documenter les intégrations externes.

## 8.4 Architecture indicative

```text
Application React Native / Expo
        |
        |-- Supabase Auth
        |-- API Supabase
        |-- Notifications locales
        |-- Localisation avec permission
        |-- Interface communautaire
        |
Supabase
        |
        |-- PostgreSQL
        |-- Auth
        |-- Row Level Security
        |-- Edge Functions
        |-- Storage
        |
Services externes optionnels
        |
        |-- API IA Imọlẹ
        |-- Fournisseur SMS
        |-- WhatsApp Business API
        |-- Service cartographique
        |-- Service météo
```

---

# 9. Écrans de l’application

## 9.1 Écrans d’authentification

- Écran de bienvenue ;
- Connexion ;
- Inscription ;
- Mot de passe oublié ;
- Conditions d’utilisation ;
- Politique de confidentialité.

## 9.2 Écrans principaux

- Tableau de bord ;
- Journal de santé ;
- Nouvelle entrée ;
- Historique ;
- Statistiques ;
- Médicaments ;
- Ajouter un médicament ;
- Rappels ;
- Communauté ;
- Nouvelle publication ;
- Profil ;
- Contacts d’urgence ;
- SOS ;
- Ressources ;
- Paramètres.

## 9.3 Navigation

La navigation principale pourra contenir :

```text
Accueil
Journal
Médicaments
Communauté
Profil
```

Le bouton SOS devra être accessible depuis l’accueil et les principales pages sans gêner l’utilisation normale de l’application.

---

# 10. Modèle de données

## 10.1 Table `profiles`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant lié à `auth.users` |
| first_name | TEXT | Prénom ou nom d’affichage |
| full_name | TEXT | Nom complet, facultatif |
| date_of_birth | DATE | Date de naissance, facultative |
| drepanocytosis_type | TEXT | Type déclaré, facultatif |
| country | TEXT | Pays |
| city | TEXT | Ville |
| blood_group | TEXT | Groupe sanguin, facultatif |
| allergies | TEXT | Allergies déclarées |
| care_center | TEXT | Centre de suivi |
| doctor_name | TEXT | Médecin référent, facultatif |
| doctor_phone | TEXT | Numéro du médecin, facultatif |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de modification |

## 10.2 Table `emergency_contacts`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Propriétaire du contact |
| name | TEXT | Nom du contact |
| phone | TEXT | Numéro de téléphone |
| whatsapp_phone | TEXT | Numéro WhatsApp, facultatif |
| relationship | TEXT | Relation |
| is_primary | BOOLEAN | Contact principal |
| consent_confirmed | BOOLEAN | Accord confirmé |
| created_at | TIMESTAMPTZ | Date de création |

## 10.3 Table `health_logs`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Propriétaire de l’entrée |
| pain_level | INTEGER | Niveau de douleur de 0 à 10 |
| pain_location | TEXT | Localisation de la douleur |
| temperature | NUMERIC | Température facultative |
| hydration_level | TEXT | Niveau déclaré |
| fatigue_level | INTEGER | Niveau de fatigue de 0 à 10 |
| symptoms | TEXT[] | Symptômes |
| possible_triggers | TEXT[] | Facteurs déclarés |
| medication_taken | BOOLEAN | Prise déclarée |
| notes | TEXT | Notes personnelles |
| recorded_at | TIMESTAMPTZ | Date de l’entrée |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de modification |

## 10.4 Table `medications`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Propriétaire |
| name | TEXT | Nom du médicament |
| dosage | TEXT | Dosage prescrit |
| frequency | TEXT | Fréquence |
| start_date | DATE | Date de début |
| end_date | DATE | Date de fin, facultative |
| is_active | BOOLEAN | Traitement actif |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de modification |

## 10.5 Table `medication_reminders`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Propriétaire |
| medication_id | UUID | Médicament lié |
| reminder_time | TIME | Heure du rappel |
| is_enabled | BOOLEAN | Rappel actif |
| created_at | TIMESTAMPTZ | Date de création |

## 10.6 Table `medication_intakes`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Propriétaire |
| medication_id | UUID | Médicament lié |
| scheduled_at | TIMESTAMPTZ | Heure prévue |
| taken_at | TIMESTAMPTZ | Heure de confirmation |
| status | TEXT | Pris, ignoré ou reporté |

## 10.7 Table `sos_events`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Propriétaire |
| latitude | NUMERIC | Latitude facultative |
| longitude | NUMERIC | Longitude facultative |
| location_shared | BOOLEAN | Position partagée ou non |
| pain_level | INTEGER | Douleur déclarée, facultative |
| contacts_called | TEXT[] | Contacts appelés |
| message_prepared | BOOLEAN | Message préparé |
| sms_sent | BOOLEAN | SMS envoyé si service activé |
| whatsapp_sent | BOOLEAN | WhatsApp envoyé si service activé |
| created_at | TIMESTAMPTZ | Date du SOS |
| resolved_at | TIMESTAMPTZ | Fin déclarée de l’événement |

## 10.8 Table `community_posts`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| user_id | UUID | Auteur |
| content | TEXT | Contenu |
| category | TEXT | Catégorie |
| country | TEXT | Pays affiché |
| is_hidden | BOOLEAN | Publication masquée |
| created_at | TIMESTAMPTZ | Date de publication |
| updated_at | TIMESTAMPTZ | Date de modification |

## 10.9 Table `community_comments`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| post_id | UUID | Publication concernée |
| user_id | UUID | Auteur |
| content | TEXT | Commentaire |
| is_hidden | BOOLEAN | Commentaire masqué |
| created_at | TIMESTAMPTZ | Date de publication |

## 10.10 Table `community_reports`

| Champ | Type | Description |
|---|---|---|
| id | UUID | Identifiant |
| reporter_id | UUID | Auteur du signalement |
| post_id | UUID | Publication signalée |
| comment_id | UUID | Commentaire signalé, facultatif |
| reason | TEXT | Motif du signalement |
| status | TEXT | En attente, traité ou rejeté |
| created_at | TIMESTAMPTZ | Date du signalement |

---

# 11. Sécurité et confidentialité

Les données de santé sont sensibles. La sécurité doit être intégrée dès la conception.

## 11.1 Mesures minimales

L’application devra :

- utiliser HTTPS ;
- utiliser Supabase Auth ;
- ne jamais stocker directement les mots de passe ;
- activer Row Level Security ;
- limiter l’accès aux données à leur propriétaire ;
- protéger les fonctions serveur ;
- ne jamais exposer les clés secrètes dans l’application ;
- utiliser des variables d’environnement ;
- utiliser `expo-secure-store` pour les données sensibles locales ;
- collecter uniquement les données nécessaires ;
- permettre la modification des données ;
- permettre la suppression du compte ;
- documenter la politique de confidentialité ;
- demander le consentement de l’utilisateur ;
- limiter la conservation des données ;
- gérer les erreurs sans afficher de données sensibles.

## 11.2 Règle d’accès principale

Un utilisateur ne doit pouvoir consulter, modifier ou supprimer que ses propres données médicales.

Exemple de politique Supabase indicative :

```sql
create policy "Users can view their own health logs"
on public.health_logs
for select
to authenticated
using (auth.uid() = user_id);
```

Les politiques doivent également être définies pour :

- `insert` ;
- `update` ;
- `delete`.

## 11.3 Données communautaires

Les publications peuvent être visibles par les autres membres selon les règles de la communauté.

Toutefois :

- les données du journal ne doivent jamais être publiques ;
- le profil médical ne doit jamais être exposé automatiquement ;
- la localisation ne doit jamais être publiée sans action explicite ;
- les contacts d’urgence ne doivent jamais être visibles par la communauté.

## 11.4 Localisation

La localisation doit être :

- demandée uniquement lorsqu’elle est utile ;
- expliquée à l’utilisateur ;
- utilisée uniquement avec son consentement ;
- non collectée en permanence dans le MVP ;
- non partagée automatiquement sans action claire ;
- supprimable selon la politique de conservation.

## 11.5 Protection des mineurs

La version destinée aux mineurs nécessitera un cadre spécifique.

Dans le MVP, l’application sera prioritairement conçue pour des utilisateurs majeurs. Toute extension aux mineurs devra intégrer :

- le consentement parental ou légal ;
- une politique adaptée ;
- une réflexion sur la visibilité des publications ;
- des mesures supplémentaires de protection.

---

# 12. Responsabilité médicale

DRÉPA ne devra jamais se présenter comme :

- un dispositif de diagnostic ;
- un dispositif de prédiction certaine des crises ;
- un outil de prescription ;
- un remplacement du médecin ;
- un service d’urgence officiel ;
- une garantie de prise en charge.

## Mention générale à afficher

> DRÉPA est un outil d’accompagnement et de suivi personnel. Les informations fournies ne remplacent pas l’avis d’un professionnel de santé. En cas de douleur intense, de difficulté à respirer, de fièvre, de douleur thoracique, de malaise ou de symptôme inhabituel, contactez rapidement un professionnel de santé ou rendez-vous dans un service d’urgence.

Les contenus médicaux et les éventuelles fonctionnalités avancées devront être validés par des professionnels compétents avant leur diffusion publique.

---

# 13. Design et expérience utilisateur

## 13.1 Principes

L’application doit être :

- simple ;
- rapide ;
- lisible ;
- accessible ;
- adaptée aux petits écrans ;
- utilisable avec une connexion lente ;
- compréhensible par des utilisateurs non techniques ;
- disponible en français ;
- adaptée à un usage en situation de fatigue ou de douleur.

## 13.2 Saisie rapide

L’enregistrement d’une entrée de santé doit idéalement prendre moins d’une minute.

Pour cela :

- utiliser des boutons de sélection ;
- limiter la saisie obligatoire ;
- proposer des symptômes prédéfinis ;
- proposer des valeurs par défaut raisonnables ;
- éviter les formulaires trop longs ;
- permettre l’enregistrement partiel.

## 13.3 Identité visuelle

### Couleurs indicatives

- rouge profond pour l’identité et le bouton SOS ;
- blanc pour la lisibilité ;
- bleu ou violet pour les éléments secondaires ;
- vert pour les confirmations générales ;
- orange pour les avertissements d’interface.

Les couleurs ne doivent pas être utilisées pour établir un diagnostic ou une gravité médicale automatique.

## 13.4 États à prévoir

Chaque écran doit prévoir :

- état de chargement ;
- état vide ;
- erreur réseau ;
- erreur de validation ;
- confirmation de succès ;
- absence de permission ;
- absence de données.

---

# 14. Plan de réalisation sur 30 jours

## Semaine 1 — Initialisation et authentification

### Tâches

- créer le projet Expo ;
- configurer TypeScript ;
- configurer Expo Router ;
- créer le dépôt Git ;
- configurer Supabase ;
- préparer les variables d’environnement ;
- créer l’écran d’accueil ;
- développer l’inscription ;
- développer la connexion ;
- développer la déconnexion ;
- créer le profil utilisateur ;
- créer les premières politiques RLS ;
- tester sur Android.

### Livrable

- application installable ;
- authentification fonctionnelle ;
- profil sauvegardé dans Supabase.

---

## Semaine 2 — Journal et médicaments

### Tâches

- créer le formulaire du journal ;
- enregistrer les entrées ;
- afficher l’historique ;
- ajouter des statistiques simples ;
- créer la gestion des médicaments ;
- créer les rappels locaux ;
- demander les permissions de notification ;
- gérer les erreurs de formulaire ;
- tester avec des données fictives.

### Livrable

- journal fonctionnel ;
- historique consultable ;
- médicaments enregistrables ;
- rappels locaux fonctionnels.

---

## Semaine 3 — SOS et ressources

### Tâches

- créer les contacts d’urgence ;
- développer le bouton SOS ;
- demander l’autorisation de localisation ;
- afficher la position disponible ;
- préparer un message d’urgence ;
- proposer l’appel au contact principal ;
- ouvrir l’application SMS avec un message prérempli ;
- enregistrer les événements SOS ;
- ajouter les premières ressources éducatives ;
- tester le scénario avec et sans connexion.

### Livrable

- SOS basique fonctionnel ;
- contacts d’urgence configurables ;
- ressources éducatives accessibles.

---

## Semaine 4 — Communauté et déploiement

### Tâches

- créer les publications ;
- créer les commentaires ;
- ajouter les catégories ;
- ajouter les signalements ;
- créer les règles de communauté ;
- ajouter la modération de base ;
- tester avec quelques utilisateurs ;
- corriger les erreurs ;
- améliorer l’interface ;
- vérifier les permissions ;
- générer un APK Android ;
- produire une vidéo de démonstration ;
- rédiger la documentation ;
- publier le bilan du projet.

### Livrable

- MVP Android démontrable ;
- vidéo de présentation ;
- documentation technique ;
- retours des premiers utilisateurs ;
- liste des fonctionnalités réalisées et reportées.

---

# 15. Critères d’acceptation du MVP

Le MVP sera considéré comme fonctionnel si :

- un utilisateur peut créer un compte ;
- un utilisateur peut se connecter ;
- un utilisateur peut se déconnecter ;
- un utilisateur peut réinitialiser son mot de passe ;
- un utilisateur peut modifier son profil ;
- un utilisateur peut ajouter un contact d’urgence ;
- un utilisateur peut enregistrer une entrée de santé ;
- un utilisateur peut modifier ou supprimer une entrée ;
- un utilisateur peut consulter son historique ;
- un utilisateur peut consulter des statistiques simples ;
- un utilisateur peut ajouter un médicament ;
- un utilisateur peut programmer un rappel ;
- une notification locale peut être affichée ;
- un utilisateur peut déclencher un SOS ;
- la localisation est demandée avec consentement ;
- un message SMS peut être préparé ;
- l’événement SOS est enregistré ;
- un utilisateur peut créer une publication ;
- un utilisateur peut commenter ;
- un utilisateur peut signaler un contenu ;
- les données privées sont protégées par RLS ;
- l’application peut être installée sur un appareil Android ;
- les mentions médicales sont visibles ;
- les erreurs réseau sont gérées proprement.

---

# 16. Tests prévus

## 16.1 Tests fonctionnels

- inscription ;
- connexion ;
- déconnexion ;
- mot de passe incorrect ;
- réinitialisation du mot de passe ;
- modification du profil ;
- ajout d’un contact ;
- création d’une entrée de santé ;
- modification d’une entrée ;
- suppression d’une entrée ;
- création d’un médicament ;
- programmation d’un rappel ;
- déclenchement d’une notification ;
- déclenchement d’un SOS ;
- ouverture de l’application SMS ;
- création d’une publication ;
- ajout d’un commentaire ;
- signalement d’un contenu.

## 16.2 Tests de sécurité

- accès aux données d’un autre utilisateur ;
- modification non autorisée ;
- suppression non autorisée ;
- accès direct à une table Supabase ;
- vérification des politiques RLS ;
- protection des clés API ;
- déconnexion ;
- suppression du compte ;
- permissions de localisation ;
- permissions de notification.

## 16.3 Tests réseau

- connexion lente ;
- absence de connexion ;
- interruption lors d’une sauvegarde ;
- reprise après reconnexion ;
- erreur Supabase ;
- erreur de service externe ;
- absence de GPS ;
- absence d’autorisation de localisation.

## 16.4 Tests utilisateurs

Les tests pourront être réalisés avec :

- des personnes vivant avec la drépanocytose ;
- des proches ;
- des étudiants ;
- des professionnels de santé volontaires ;
- des utilisateurs Android.

Les participants devront être informés que le MVP est expérimental et qu’il ne remplace pas un suivi médical.

---

# 17. Risques et mesures de réduction

| Risque | Mesure prévue |
|---|---|
| Données médicales exposées | RLS, contrôle d’accès, minimisation et protection des secrets |
| Conseil médical incorrect | Contenus validés et assistant limité |
| Fausse impression de prédiction | Ne pas promettre de prédire les crises |
| SOS non délivré | Afficher les limites et proposer l’appel manuel |
| Localisation indisponible | Prévoir un fonctionnement sans position |
| Coût des SMS | Commencer par un message préparé |
| API WhatsApp non conforme | Utiliser une solution officiellement compatible |
| Communauté mal modérée | Signalement, règles et modération humaine |
| Données insuffisantes pour l’IA | Commencer par des statistiques descriptives |
| Périmètre trop ambitieux | Prioriser les fonctions essentielles |
| Informations médicales obsolètes | Ajouter les sources et dates de mise à jour |
| Faible adoption | Tester rapidement avec des utilisateurs réels |
| Utilisation par des mineurs | Prévoir un cadre spécifique avant ouverture |
| Dépendance aux services externes | Prévoir un fonctionnement dégradé |
| Coût des notifications et API | Contrôler l’usage et surveiller les quotas |

---

# 18. Modèle économique envisagé

## 18.1 Phase de lancement

Le MVP sera gratuit afin de :

- recueillir des retours ;
- tester l’utilité réelle ;
- améliorer l’expérience utilisateur ;
- attirer les premiers utilisateurs ;
- identifier les fonctionnalités prioritaires.

## 18.2 Évolution possible

Un modèle freemium pourra être étudié après validation du besoin.

| Offre | Prix | Fonctionnalités possibles |
|---|---:|---|
| Gratuite | 0 FCFA | Journal, rappels et SOS basique |
| Premium | À définir | Statistiques avancées et fonctions supplémentaires |
| Famille | À définir | Suivi de plusieurs profils avec consentement |

Les prix seront déterminés après les tests utilisateurs et l’évaluation des coûts techniques.

Les fonctionnalités essentielles de sécurité ne devront pas être rendues payantes sans étude d’impact.

---

# 19. Partenariats envisagés

Des partenariats pourront être recherchés avec :

- centres de santé ;
- hôpitaux universitaires ;
- associations de patients ;
- professionnels de santé ;
- organismes publics ;
- ONG ;
- établissements de formation ;
- opérateurs télécoms ;
- fournisseurs de SMS ;
- programmes de santé numérique.

Les partenaires médicaux pourront contribuer à :

- valider les contenus ;
- améliorer les informations d’urgence ;
- vérifier l’annuaire ;
- participer aux tests ;
- définir les limites de l’assistant ;
- améliorer la pertinence de l’application.

---

# 20. Évolutions futures

## Version 2

- mode hors ligne amélioré ;
- synchronisation différée ;
- application iOS ;
- annuaire vérifié ;
- export PDF du journal ;
- partage sécurisé avec un médecin ;
- espace familial ;
- statistiques avancées ;
- intégration officielle de services de messagerie ;
- carte des centres vérifiés ;
- contenus audio et vidéo.

## Version 3

- téléconsultation avec des professionnels partenaires ;
- intégration avec des centres de santé ;
- outils pour les parents ;
- traduction dans certaines langues locales ;
- recherche clinique encadrée ;
- fonctionnalités d’analyse validées médicalement ;
- accompagnement des patients mineurs dans un cadre sécurisé.

Toute fonctionnalité analysant des données de santé avec de l’intelligence artificielle devra faire l’objet d’une évaluation technique, médicale, éthique et réglementaire avant sa mise en production.

---

# 21. Livrables du programme Imọlẹ Build

À la fin des 30 jours, les livrables prévus sont :

- code source du projet ;
- dépôt Git ;
- application Android de démonstration ;
- base Supabase configurée ;
- politiques RLS configurées ;
- documentation d’installation ;
- documentation utilisateur ;
- captures d’écran ;
- vidéo de démonstration ;
- liste des fonctionnalités réalisées ;
- liste des fonctionnalités reportées ;
- rapport des difficultés rencontrées ;
- retours des premiers utilisateurs ;
- présentation de la suite du projet.

---

# 22. Conclusion

DRÉPA est une application mobile Android destinée à accompagner les personnes vivant avec la drépanocytose en Afrique francophone.

Le projet repose sur trois axes principaux :

1. mieux suivre sa santé au quotidien ;
2. faciliter le contact avec ses proches en cas de besoin ;
3. créer un espace d’information et de soutien communautaire.

La première version privilégiera :

- la simplicité ;
- la sécurité ;
- la confidentialité ;
- la rapidité ;
- l’utilité réelle ;
- l’adaptation au contexte local.

Les fonctionnalités avancées, notamment l’intelligence artificielle, la messagerie automatique, l’annuaire médical et les intégrations hospitalières, seront développées progressivement après validation du MVP.

DRÉPA ne promet pas de guérir, de diagnostiquer ou de prédire avec certitude les crises.

Elle propose un outil numérique de suivi personnel, d’organisation, d’information et d’orientation.

> **Ma santé, ma force, ma communauté.**

---

# Annexe A — Arborescence indicative du projet

```text
drepa/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── sos.tsx
│   ├── health-entry.tsx
│   ├── medication-form.tsx
│   ├── emergency-contacts.tsx
│   ├── resources.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── home.tsx
│       ├── journal.tsx
│       ├── medications.tsx
│       ├── community.tsx
│       └── profile.tsx
├── components/
├── hooks/
├── lib/
│   ├── supabase.ts
│   ├── notifications.ts
│   ├── location.ts
│   └── validation.ts
├── services/
├── types/
├── constants/
├── assets/
├── supabase/
│   ├── migrations/
│   └── functions/
├── .env.example
├── app.json
├── eas.json
├── package.json
└── README.md
```

---

# Annexe B — Variables d’environnement indicatives

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_ENV=development
```

Les clés secrètes de services externes ne doivent pas être placées dans l’application mobile.

Elles doivent être utilisées uniquement dans des fonctions serveur sécurisées.

---

# Annexe C — Mentions obligatoires dans l’application

## Mention générale

> DRÉPA est un outil d’accompagnement et de suivi personnel. Les informations fournies ne remplacent pas l’avis d’un professionnel de santé.

## Mention concernant la communauté

> Les publications et témoignages des membres ne constituent pas des prescriptions médicales et ne remplacent pas l’avis d’un professionnel de santé.

## Mention concernant le SOS

> Le bouton SOS dépend de la connexion, du réseau mobile, des permissions du téléphone et de la disponibilité des services externes. En cas de danger immédiat, contactez les services d’urgence locaux ou rendez-vous dans le centre de santé le plus proche.

## Mention concernant l’intelligence artificielle

> Les réponses générées par l’intelligence artificielle peuvent être incomplètes ou incorrectes. Elles ne constituent pas un diagnostic ni une prescription médicale.