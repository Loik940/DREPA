// Écran légal provisoire : réserve l’accès aux mentions et documents de consentement.
import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function LegalScreen() {
  // Le rendu principal réserve l’emplacement des informations légales.
  return <ScreenPlaceholder title="Mentions et consentements" description="Les textes légaux seront reliés aux consentements versionnés du MVP." />;
}
