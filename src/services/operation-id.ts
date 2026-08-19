// Identifiants d'opération durables : survivent à un redémarrage jusqu'à confirmation du serveur.
// Ils ne contiennent aucune donnée personnelle et servent uniquement à rejouer une création sans doublon.
import * as Crypto from 'expo-crypto';

import { secureStorage } from './secure-storage';

const prefix = '@drepa/operation-id/';
const indexKey = '@drepa/operation-id-index';

async function readIndex() {
  try {
    const value = await secureStorage.getItem(indexKey);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
}

async function registerKey(storageKey: string) {
  const keys = await readIndex();
  if (!keys.includes(storageKey)) await secureStorage.setItem(indexKey, JSON.stringify([...keys, storageKey]));
}

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
  const existing = await secureStorage.getItem(storageKey);
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
  await secureStorage.setItem(storageKey, JSON.stringify({ id: created, payloadHash }));
  await registerKey(storageKey);
  return created;
}

export function clearOperationId(key: string) {
  return secureStorage.removeItem(`${prefix}${key}`);
}

export async function clearAllOperationIds() {
  const keys = await readIndex();
  await Promise.all(keys.map((key) => secureStorage.removeItem(key).catch(() => undefined)));
  await secureStorage.removeItem(indexKey).catch(() => undefined);
}
