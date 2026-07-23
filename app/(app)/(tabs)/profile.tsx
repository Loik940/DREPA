import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useProfileQuery } from '@/features/profile/queries';
import { useAuth } from '@/providers/auth-provider';
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const profileQuery = useProfileQuery(user?.id);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text>{profileQuery.data?.first_name ?? 'Profil incomplet'}</Text>
      <Text>{profileQuery.data?.country ?? 'Pays non renseigné'}</Text>
      <Pressable onPress={() => void signOut()} style={styles.button}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
});
