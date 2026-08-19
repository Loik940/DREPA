// Carte de prudence rappelant que les traitements affichés doivent avoir été prescrits.
import { StatusBanner } from '@/components/ui/StatusBanner';

// Composant de prudence : il rappelle que DRÉPA ne prescrit pas et ne modifie aucun dosage.
export function MedicationInfoCard() {
  return <StatusBanner tone="warning" message="Ajoute uniquement les traitements prescrits. Les rappels sont programmés pour 30 jours : ouvre DRÉPA régulièrement pour renouveler cette fenêtre. Android peut les retarder et ils ne garantissent pas la prise. DRÉPA ne prescrit et ne modifie aucun dosage." />;
}
