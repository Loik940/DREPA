// Définit les catégories disponibles dans la communauté.
// Définit les filtres simples proposés dans le fil.
// Associe chaque valeur technique à un libellé français.
// Définit les motifs autorisés pour un signalement.
// Ces listes partagées évitent les valeurs dispersées dans l’application.
export type CommunityCategory = 'testimony' | 'question' | 'motivation' | 'daily_life' | 'resources';
export type CommunityFilter = 'all' | 'question' | 'testimony';
export type ReportReason =
  | 'dangerous_medical_advice'
  | 'harassment'
  | 'misleading_information'
  | 'scam_or_advertising'
  | 'personal_data'
  | 'other';

export const COMMUNITY_CATEGORY_VALUES = [
  'testimony',
  'question',
  'motivation',
  'daily_life',
  'resources',
] as const satisfies readonly CommunityCategory[];

export const COMMUNITY_FILTER_VALUES = ['all', 'question', 'testimony'] as const satisfies readonly CommunityFilter[];

export const REPORT_REASON_VALUES = [
  'dangerous_medical_advice',
  'harassment',
  'misleading_information',
  'scam_or_advertising',
  'personal_data',
  'other',
] as const satisfies readonly ReportReason[];

export const communityCategoryLabels: readonly { value: CommunityCategory; label: string }[] = [
  { value: 'testimony', label: 'Témoignage' },
  { value: 'question', label: 'Question' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'daily_life', label: 'Vie quotidienne' },
  { value: 'resources', label: 'Ressources' },
];

export const communityFilterLabels: readonly { value: CommunityFilter; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'question', label: 'Questions' },
  { value: 'testimony', label: 'Témoignages' },
];

export const reportReasonLabels: readonly { value: ReportReason; label: string }[] = [
  { value: 'dangerous_medical_advice', label: 'Conseil médical dangereux' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'misleading_information', label: 'Information trompeuse' },
  { value: 'scam_or_advertising', label: 'Arnaque ou publicité' },
  { value: 'personal_data', label: 'Données personnelles' },
  { value: 'other', label: 'Autre' },
];
