import { Link } from 'expo-router';
import { View } from 'react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function ForgotPasswordScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScreenPlaceholder title="Mot de passe oublié" description="La récupération de session sera configurée avec Supabase Auth." />
      <Link href="/(auth)/login">Retour à la connexion</Link>
    </View>
  );
}
