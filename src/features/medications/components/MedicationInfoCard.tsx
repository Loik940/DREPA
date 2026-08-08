// Carte de prudence rappelant que les traitements affichés doivent avoir été prescrits.
import { StatusBanner } from '@/components/ui/StatusBanner';

// Composant de prudence : il rappelle que DRÉPA ne prescrit pas et ne modifie aucun dosage.
export function MedicationInfoCard() {
  return <StatusBanner tone="warning" message="Ajoute uniquement les traitements prescrits par ton professionnel de santé. DRÉPA ne prescrit aucun médicament et ne modifie aucun dosage." />;
}
