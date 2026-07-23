# Décisions de conception du MVP

Ce document consigne les décisions qui complètent le cahier des charges de DRÉPA. Elles s'appliquent exclusivement au MVP Android.

## 1. Rôles utilisateur

Le rôle d'un compte est soit `user`, soit `admin`. Il est stocké dans une table Supabase `user_roles` séparée du profil médical.

Le rôle `user` est attribué automatiquement après l'inscription par un mécanisme contrôlé dans Supabase. Une promotion vers `admin` exige une opération serveur privilégiée. L'application mobile ne peut ni choisir, ni créer, ni modifier un rôle.

Les contrôles d'administration sont appliqués côté Supabase. Masquer un contenu ou traiter un signalement exige une autorisation vérifiée par la base ou une Edge Function sécurisée ; masquer un bouton dans l'interface ne constitue pas un contrôle d'accès.

## 2. Consentements versionnés

La table `user_consents` conserve pour chaque acceptation :

- l'utilisateur concerné ;
- la version des conditions générales d'utilisation ;
- la version de la politique de confidentialité ;
- la version de la charte communautaire ;
- la date d'acceptation ;
- la date de révocation éventuelle.

Les consentements sont historisés et ne sont pas remplacés silencieusement. Une acceptation est valide uniquement lorsqu'elle correspond aux versions obligatoires courantes et qu'elle n'est pas révoquée.

## 3. Complétude du profil

Un profil est minimalement complet uniquement si les trois conditions suivantes sont réunies :

- un prénom ou pseudonyme est renseigné ;
- le pays est renseigné ;
- les consentements obligatoires courants sont acceptés et non révoqués.

Les informations médicales facultatives ne bloquent pas l'accès au journal. Une révocation rend le profil incomplet et impose de repasser par le parcours de consentement avant d'accéder aux fonctions protégées concernées.

## 4. Journal de santé partiel

Une entrée du journal peut être partielle. Seul `recorded_at` est obligatoire.

La douleur, la localisation de la douleur, la fatigue, la température, l'hydratation, les symptômes, les facteurs possibles, la prise déclarée de médicaments et les notes sont facultatifs. Lorsqu'elles sont renseignées, les valeurs sont validées selon les contraintes du cahier des charges.

Les données déclarées restent descriptives. Elles ne produisent aucune interprétation médicale automatique.

## 5. Réactions communautaires

Le MVP autorise uniquement la réaction `support`. La table `community_post_reactions` contient `id`, `post_id`, `user_id`, `reaction_type` et `created_at`.

Une contrainte unique sur `(post_id, user_id)` garantit au maximum une réaction par utilisateur et par publication. `reaction_type` est contraint à `support`. Un utilisateur peut ajouter ou retirer sa propre réaction, sans modifier celles des autres membres.

## 6. Ressources éducatives

Les ressources sont conservées dans `educational_resources` avec leur titre, résumé, contenu, source, version ou date de mise à jour, état de publication et dates techniques.

Seuls les administrateurs peuvent créer, modifier, publier ou retirer une ressource. Les utilisateurs consultent uniquement les ressources publiées. Chaque ressource doit être sourcée, datée et accompagnée de la mention de prudence médicale prévue par le cahier des charges.

## 7. Suppression du compte

La suppression sécurisée du compte fait partie du MVP. Elle passe par une Supabase Edge Function authentifiée qui :

1. vérifie l'identité et la session de l'appelant ;
2. refuse la désignation arbitraire d'un autre utilisateur ;
3. exécute l'opération privilégiée côté serveur ;
4. s'appuie sur les suppressions en cascade et les règles de conservation validées ;
5. renvoie un résultat sans exposer de secret ni de donnée sensible.

Aucune clé privilégiée n'est intégrée à l'application mobile.

## 8. Plateforme du MVP

Android est l'unique plateforme développée, testée et livrée pendant le MVP. Les tests sur appareil Android réel, le development build Expo et la génération d'un APK avec EAS Build font partie du parcours de livraison.

iOS et le web ne font pas partie du développement, des tests ni des livrables du MVP.

## 9. Limites médicales

Le MVP est un outil de suivi personnel, d'organisation, d'information et de mise en relation avec les proches. Il ne comprend :

- aucune IA prédictive ;
- aucun diagnostic ;
- aucune prescription ou recommandation de dosage ;
- aucune prédiction de crise ;
- aucune modification automatique d'un traitement ;
- aucune garantie de prise en charge par le SOS.

Les traitements saisis sont uniquement ceux déclarés comme prescrits par un professionnel de santé.

## 10. Périmètre communautaire

La communauté du MVP est limitée aux publications, commentaires, réactions `support`, signalements et à la modération de base. Le chat privé et la modération automatisée n'en font pas partie.
