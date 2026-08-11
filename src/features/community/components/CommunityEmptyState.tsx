// Affiche l’état vide du fil communautaire.
// Explique simplement qu’aucune publication n’est visible.
// Invite la personne à démarrer un échange utile.
// Réutilise l’état vide du design system.
// Transmet l’action Publier à l’écran parent.
import { EmptyState } from '@/components/ui/EmptyState';

type CommunityEmptyStateProps = {
  onPublish: () => void;
};

export function CommunityEmptyState({ onPublish }: CommunityEmptyStateProps) {
  return (
    <EmptyState
      title="Aucune publication pour le moment"
      description="Vous pouvez lancer le premier échange avec la communauté."
      actionLabel="Publier"
      onAction={onPublish}
    />
  );
}
