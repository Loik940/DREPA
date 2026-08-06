// Types métier légers utilisés pour représenter l’état de complétude d’un profil.
export type ProfileCompletion = {
  hasDisplayName: boolean;
  hasCountry: boolean;
  hasRequiredConsents: boolean;
};
