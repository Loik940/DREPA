// Onglet Communauté : placeholder du futur espace de publications et de modération.
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';

export default function CommunityScreen() {
  // Le rendu principal présente l’état d’attente de la future communauté.
  return (
    <ScreenContainer>
      <EmptyState title="La communauté se prépare" description="Les échanges et la modération seront ajoutés après validation du socle." />
    </ScreenContainer>
  );
}
