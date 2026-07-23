import { Link } from 'expo-router';
import { View } from 'react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScreenPlaceholder title="Inscription" description="Le formulaire d'inscription sera ajouté dans le socle de la semaine 1." />
      <Link href="/(auth)/login">Retour à la connexion</Link>
    </View>
  );
}
