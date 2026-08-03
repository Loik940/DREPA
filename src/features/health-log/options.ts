export const symptomChoices = [
  { label: 'Fatigue', value: 'fatigue' },
  { label: 'Maux de tête', value: 'headache' },
  { label: 'Essoufflement', value: 'shortness_of_breath' },
  { label: 'Fièvre', value: 'fever' },
  { label: 'Nausées', value: 'nausea' },
  { label: 'Douleurs osseuses', value: 'bone_pain' },
  { label: 'Douleurs abdominales', value: 'abdominal_pain' },
  { label: 'Vertiges', value: 'dizziness' },
] as const;

export const triggerChoices = [
  { label: 'Froid', value: 'cold' },
  { label: 'Stress', value: 'stress' },
  { label: 'Déshydratation', value: 'dehydration' },
  { label: 'Effort physique', value: 'physical_effort' },
  { label: 'Manque de sommeil', value: 'lack_of_sleep' },
  { label: 'Maladie récente', value: 'recent_illness' },
] as const;

export const hydrationChoices = [
  { label: 'Peu', value: 'low' },
  { label: 'Moyen', value: 'medium' },
  { label: 'Bien', value: 'good' },
] as const;

export const medicationChoices = [
  { label: 'Non renseigné', value: 'unset' },
  { label: 'Oui', value: 'yes' },
  { label: 'Non', value: 'no' },
] as const;

export function getChoiceLabel(choices: readonly { label: string; value: string }[], value: string) {
  return choices.find((choice) => choice.value === value)?.label ?? value;
}
