// Identifiants d'opération durables : survivent à un redémarrage jusqu'à confirmation du serveur.
// Ils ne contiennent aucune donnée personnelle et servent uniquement à rejouer une création sans doublon.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const prefix = '@drepa/operation-id/';

function serializePayload(payload: unknown) {
  const normalize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(normalize);
    if (!value || typeof value !== 'object') return value;
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, normalize(record[key])]));
  };
  return JSON.stringify(normalize(payload));
}

export async function getOrCreateOperationId(key: string, payload: unknown) {
  const storageKey = `${prefix}${key}`;
  const existing = await AsyncStorage.getItem(storageKey);
  const payloadHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    serializePayload(payload),
  );
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as { id?: string; payloadHash?: string };
      if (parsed.id && parsed.payloadHash === payloadHash) return parsed.id;
    } catch {
      // Les anciennes valeurs simples sont remplacées par le format lié au payload.
    }
  }
  const created = Crypto.randomUUID();
  await AsyncStorage.setItem(storageKey, JSON.stringify({ id: created, payloadHash }));
  return created;
}

export function clearOperationId(key: string) {
  return AsyncStorage.removeItem(`${prefix}${key}`);
}
