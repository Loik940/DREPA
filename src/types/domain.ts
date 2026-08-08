// Types métier légers utilisés pour représenter l’état de complétude d’un profil.
// Ce type structurant regroupe les trois conditions utilisées pour décider si le profil est complet.
export type ProfileCompletion = {
  hasDisplayName: boolean;
  hasCountry: boolean;
  hasRequiredConsents: boolean;
};
