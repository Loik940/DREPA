// Onglet Médicaments : placeholder du futur module de traitements et rappels.
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

export default function MedicationsScreen() {
  return (
    <ScreenContainer>
      <EmptyState title="Tes rappels arriveront bientôt" description="La gestion des traitements prescrits sera disponible dans une prochaine étape." />
    </ScreenContainer>
  );
}
