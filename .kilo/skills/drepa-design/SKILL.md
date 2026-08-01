---
name: drepa-design
description: Direction visuelle et accessibilité du design system mobile DRÉPA.
---

# DRÉPA Design

## Direction

- Identité « Terre et Sang » : chaleureuse, humaine, africaine et rassurante.
- Mode clair par défaut, mode sombre complet et mode système.
- Inter pour le corps, les formulaires et les composants UI.
- Bricolage Grotesque uniquement pour les grands titres validés.
- Aucun style clinique froid ou motif culturel caricatural.

## Tokens

Communes : `brand #7B1E1E`, `sos #C0392B`, `success #2D6A4F`, `warning #D4860A`.

Clair : `backgroundPrimary #FFF8F1`, `backgroundSurface #FFFFFF`, `textPrimary #2B1B17`, `textSecondary #5C4A3D`, `actionBg #C87835`, `actionText #2B1B17`, `border #E8D5C4`.

Sombre : `backgroundPrimary #1C1410`, `backgroundSurface #2A1F1A`, `textPrimary #F5F0E8`, `textSecondary #C1AEA0`, `actionBg #E8A87C`, `actionText #1C1410`, `border #3D2E26`.

## Accessibilité

- Corps : 15 à 16 px ; labels : 13 px minimum ; aucun texte sous 12 px.
- Zones tactiles générales : 44 minimum ; boutons : 52 minimum ; SOS : 56 minimum.
- Ne jamais transmettre une information uniquement par la couleur.
- Vérifier contrastes clair/sombre, tailles Android augmentées, clavier et petits écrans.
- Aucun bouton SOS avec pulsation permanente.
- Les composants utilisent les tokens, jamais des hexadécimaux répétés.

Les écrans Journal, Médicaments, SOS et Communauté peuvent être conçus progressivement, mais leur fonctionnalité ne doit pas être simulée dans une étape purement visuelle.
