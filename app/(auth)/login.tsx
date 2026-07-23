import { Link } from 'expo-router';
import { View } from 'react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScreenPlaceholder title="Connexion" description="Le formulaire d'authentification sera ajouté dans le socle de la semaine 1." />
      <Link href="/(auth)/register">Créer un compte</Link>
      <Link href="/(auth)/forgot-password">Mot de passe oublié</Link>
    </View>
  );
}
