// Adapte l’état vide au filtre de modération actif.
// Explique simplement pourquoi aucune carte n’apparaît.
// Distingue les signalements en attente des dossiers traités.
// Réutilise le composant vide du design system.
// N’ajoute aucune action quand elle n’est pas nécessaire.
import { EmptyState } from '@/components/ui/EmptyState';
import type { ModerationStatus } from '../types';

type ModerationEmptyStateProps = {
  status: ModerationStatus;
};

const emptyStateContent = {
  pending: {
    title: 'Aucun signalement en attente',
    description: 'Les nouveaux signalements apparaîtront ici.',
  },
  reviewed: {
    title: 'Aucun signalement traité',
    description: 'Les signalements traités apparaîtront ici.',
  },
  dismissed: {
    title: 'Aucun signalement rejeté',
    description: 'Les signalements rejetés apparaîtront ici.',
  },
} as const;

export function ModerationEmptyState({ status }: ModerationEmptyStateProps) {
  return <EmptyState {...emptyStateContent[status]} />;
}
