// Route d'onboarding : présente le formulaire partagé pour créer le profil requis.
// Après une sauvegarde réussie, elle ouvre les onglets protégés de l'application.
// Elle est utilisée par une personne authentifiée dont le profil reste incomplet.
// Elle manipule les informations personnelles et de suivi déclarées dans le formulaire.
// Les données restent privées et les champs de suivi ne constituent pas un avis médical.
import { useRouter } from 'expo-router';

import { ProfileForm } from '@/features/profile/components/ProfileForm';

export default function CompleteProfileScreen() {
  const router = useRouter();

  return (
    <ProfileForm
      title="Compléter mon profil"
      description="Ces informations restent privées et servent à personnaliser ton espace."
      submitLabel="Enregistrer le profil"
      onSaved={() => router.replace('/(app)/(tabs)')}
    />
  );
}
