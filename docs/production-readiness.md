# État de préparation à la production

Ce document sépare les contrôles déjà exécutés des opérations qui exigent un projet staging, un domaine, une validation juridique ou un téléphone Android. Il ne remplace pas la recette humaine.

## État vérifié le 19 août 2026

### Application et livraison

- branche `main` synchronisée au moment du contrôle ;
- workflow GitHub « Qualité et sécurité » réussi ;
- TypeScript, ESLint, Jest, Expo Doctor et export Android réussis ;
- 86 tests réussis avec seuils de couverture actifs ;
- APK EAS Preview terminé pour `bj.drepa.app`, version `1.0.0 (1)` ;
- aucun téléphone Android détecté par ADB sur le poste de validation.

### Supabase

- un seul projet nommé `DREPA` est lié au dépôt ; aucun projet staging distinct n’existe dans l’organisation ;
- les seize migrations historiques sont présentes côté distant ;
- `20260815121000_anonymize_community_aliases.sql`, `20260815122000_harden_private_data_constraints.sql` et `20260819150000_harden_server_mutations.sql` sont en attente ;
- `npx supabase db push --dry-run` doit confirmer que seules ces trois migrations seraient appliquées ;
- la fonction distante `delete-account` est active en version 1 avec vérification JWT ;
- le durcissement local récent de cette fonction n’est pas encore déployé ;
- les sauvegardes physiques utilisent WAL-G, mais PITR n’est pas activé et la CLI ne retourne aucun point de restauration disponible ;
- le lint distant nécessite `SUPABASE_DB_PASSWORD` sur ce poste ; les migrations sont néanmoins appliquées et lintées dans la CI Supabase locale.

### Dépendances npm

Les quatorze alertes de production remontent toutes à la chaîne Expo/Metro/React Native et aux deux advisories transitifs suivants :

- `GHSA-w3rx-r6r6-pgpr` : boucle infinie du parseur ICNS de `image-size` ;
- `GHSA-5p2g-fcmc-qvqq` : boucles infinies JXL/HEIF de `image-size`.

`npm audit` propose Expo 53 ou React Native 0.72 comme « correctifs ». Ces versions sont des rétrogradations incompatibles avec Expo SDK 57 et ne doivent pas être appliquées avec `--force`. Le risque concerne le bundler de développement ; aucune image non fiable ne doit être introduite dans le pipeline Metro.

## Porte de validation Supabase staging

Les opérations suivantes sont interdites sur le projet lié tant qu’il n’est pas formellement identifié comme staging :

```powershell
npx supabase db push
npx supabase functions deploy delete-account
```

Après création d’un staging distinct :

1. configurer localement son accès sans copier le mot de passe dans Git ou dans la documentation ;
2. lier temporairement le dépôt au staging ;
3. créer ou vérifier une sauvegarde restaurable ;
4. exécuter `npx supabase db push --dry-run` ;
5. appliquer les migrations ;
6. vérifier que les anciens alias communautaires sont anonymisés ;
7. déployer `delete-account` ;
8. tester suppression, restauration Auth et RLS avec `user_a`, `user_b` et `admin_a` ;
9. relier ensuite le dépôt au projet initial sans lancer de push Production.

## Porte de validation Android App Links

Le callback actuel reste `drepa://auth/callback` avec PKCE. Le passage en App Links exige avant toute modification :

- un domaine HTTPS contrôlé ;
- l’empreinte SHA-256 du certificat Android EAS ;
- un fichier `assetlinks.json` accessible sans redirection ;
- l’URL HTTPS ajoutée à l’allowlist Supabase Auth.

Le guide détaillé est disponible dans [`android-app-links.md`](android-app-links.md).

## Porte de validation juridique

Avant diffusion publique, un juriste doit valider les textes sur : responsable du traitement, finalités, base légale, données de santé, transferts, conservation, droits, mineurs, communauté, modération et limites médicales. Toute nouvelle version validée doit être publiée puis reportée dans `src/constants/legal-versions.ts` afin d’exiger un nouveau consentement.

## Recette physique restant à exécuter

- installation de l’APK par-dessus la version précédente ;
- récupération du mot de passe par App Link ;
- notifications en arrière-plan, après redémarrage et après changement de fuseau ;
- refus puis réactivation des permissions ;
- suppression de compte avec mot de passe récent ;
- blocage des captures et de l’aperçu récent ;
- TalkBack, grandes polices et petits écrans ;
- isolation de deux comptes ;
- réseau lent, hors ligne et reprise après erreur.

## Décision de mise en production

La production n’est autorisée que lorsque les quatre portes suivantes sont signées : Supabase staging, App Links HTTPS, validation juridique et recette Android physique.
