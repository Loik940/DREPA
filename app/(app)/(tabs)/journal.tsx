import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

export default function JournalScreen() {
  return (
    <ScreenContainer>
      <EmptyState title="Ton journal est prêt" description="La saisie de santé sera disponible dans une prochaine étape." />
    </ScreenContainer>
  );
}
