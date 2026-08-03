---
name: drepa-design
description: Direction visuelle et accessibilité du design system mobile DRÉPA.
---

# DRÉPA Design

## Direction

- Identité « Terre et Sang » : chaleureuse, humaine, africaine et rassurante.
- Mode clair uniquement dans le périmètre actif du MVP.
- Inter pour le corps, les formulaires et les composants UI.
- Bricolage Grotesque uniquement pour les grands titres validés.
- Aucun style clinique froid ou motif culturel caricatural.

## Tokens

Communes : `brand #7B1E1E`, `sos #C0392B`, `success #2D6A4F`, `warning #D4860A`.

Mode clair : `backgroundPrimary #FFF8F1`, `backgroundSurface #FFFFFF`, `textPrimary #2B1B17`, `textSecondary #5C4A3D`, `actionBg #C87835`, `actionText #2B1B17`, `border #E8D5C4`.

## Accessibilité

- Corps : 15 à 16 px ; labels : 13 px minimum ; aucun texte sous 12 px.
- Zones tactiles générales : 44 minimum ; boutons : 52 minimum ; SOS : 56 minimum.
- Ne jamais transmettre une information uniquement par la couleur.
- Vérifier le contraste du mode clair, les tailles Android augmentées, le clavier et les petits écrans.
- Aucun bouton SOS avec pulsation permanente.
- Les composants utilisent les tokens, jamais des hexadécimaux répétés.

Les écrans Journal, Médicaments, SOS et Communauté peuvent être conçus progressivement, mais leur fonctionnalité ne doit pas être simulée dans une étape purement visuelle.
