// Carte de prudence rappelant que les traitements affichés doivent avoir été prescrits.
import { StatusBanner } from '@/components/ui/StatusBanner';

// Composant de prudence : il rappelle que DRÉPA ne prescrit pas et ne modifie aucun dosage.
export function MedicationInfoCard() {
  return <StatusBanner tone="warning" message="Ajoute uniquement les traitements prescrits. Les rappels aident à l’organisation mais ne garantissent ni leur livraison ni la prise du traitement. DRÉPA ne prescrit et ne modifie aucun dosage." />;
}
