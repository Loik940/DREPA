# Préparation Android App Links

Ce guide prépare le remplacement de `drepa://auth/callback` par un lien HTTPS vérifié. Aucun domaine fictif ne doit être ajouté au code applicatif.

## Valeurs déjà connues

- package Android : `bj.drepa.app` ;
- gestion des certificats : EAS Credentials ;
- protocole Auth : PKCE ;
- callback actuel : `drepa://auth/callback`.

## Valeurs encore obligatoires

- domaine final appartenant réellement au projet ;
- empreinte SHA-256 du certificat EAS utilisé pour signer l’APK ;
- hébergement HTTPS de `/.well-known/assetlinks.json` avec le type `application/json` et sans redirection.

L’empreinte doit être copiée depuis EAS Credentials ou extraite d’un APK complet avec Android `apksigner`. L’empreinte du fingerprint EAS Build n’est pas l’empreinte du certificat et ne doit pas être utilisée dans `assetlinks.json`.

## Modèle `assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "bj.drepa.app",
      "sha256_cert_fingerprints": [
        "REMPLACER_PAR_EMPREINTE_SHA256_EAS"
      ]
    }
  }
]
```

Le fichier doit répondre à `https://REMPLACER_PAR_DOMAINE/.well-known/assetlinks.json`.

## Configuration Expo cible

Une fois le domaine confirmé, ajouter à `android` dans `app.config.js` :

```js
intentFilters: [
  {
    action: 'VIEW',
    autoVerify: true,
    category: ['BROWSABLE', 'DEFAULT'],
    data: [
      {
        scheme: 'https',
        host: 'REMPLACER_PAR_DOMAINE',
        pathPrefix: '/auth/callback',
      },
    ],
  },
],
```

Puis remplacer le callback dans `src/features/auth/auth-service.ts` :

```ts
export const authCallbackUrl = 'https://REMPLACER_PAR_DOMAINE/auth/callback';
```

La même URL exacte doit être ajoutée aux URLs de redirection Supabase Auth. PKCE reste obligatoire.

## Vérification avant nouveau build

1. ouvrir l’URL `assetlinks.json` sans authentification ;
2. vérifier le code HTTP 200, l’absence de redirection et le JSON exact ;
3. vérifier que l’empreinte correspond au certificat de l’APK EAS distribué ;
4. générer un nouvel APK après modification native ;
5. installer l’APK sur un téléphone Android ;
6. vérifier l’association :

```powershell
adb shell pm get-app-links bj.drepa.app
```

7. ouvrir le callback :

```powershell
adb shell am start -a android.intent.action.VIEW -d "https://REMPLACER_PAR_DOMAINE/auth/callback"
```

Le résultat attendu est l’ouverture directe de DRÉPA sans sélecteur d’application. Tester ensuite confirmation e-mail, récupération, code expiré, session absente et retour en arrière.
