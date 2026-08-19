// Identifiants d'opération durables : survivent à un redémarrage jusqu'à confirmation du serveur.
// Ils ne contiennent aucune donnée personnelle et servent uniquement à rejouer une création sans doublon.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const prefix = '@drepa/operation-id/';

export async function getOrCreateOperationId(key: string) {
  const storageKey = `${prefix}${key}`;
  const existing = await AsyncStorage.getItem(storageKey);
  if (existing) return existing;
  const created = Crypto.randomUUID();
  await AsyncStorage.setItem(storageKey, created);
  return created;
}

export function clearOperationId(key: string) {
  return AsyncStorage.removeItem(`${prefix}${key}`);
}
