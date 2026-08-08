// Cette route permet de modifier un profil déjà créé.
// Elle réutilise le même formulaire que le parcours d'onboarding.
// Les champs sont préremplis avec les données privées du compte authentifié.
// La sauvegarde conserve la validation et les protections du module Profil.
// Aucun champ de suivi ne produit de diagnostic ou de conseil médical.
import { useRouter } from 'expo-router';

import { ProfileForm } from '@/features/profile/components/ProfileForm';

export default function ProfileEditScreen() {
  const router = useRouter();

  return (
    <ProfileForm
      title="Modifier mon profil"
      description="Mets à jour les informations que tu souhaites conserver dans ton espace privé."
      submitLabel="Enregistrer les modifications"
      onSaved={() => router.replace('/(app)/(tabs)/profile')}
    />
  );
}
