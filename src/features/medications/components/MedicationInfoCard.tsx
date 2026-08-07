// Carte de prudence rappelant que les traitements affichés doivent avoir été prescrits.
import { StatusBanner } from '@/components/ui/StatusBanner';

export function MedicationInfoCard() {
  return <StatusBanner tone="warning" message="Ajoute uniquement les traitements prescrits par ton professionnel de santé. DRÉPA ne prescrit aucun médicament et ne modifie aucun dosage." />;
}
