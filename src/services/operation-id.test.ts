// Vérifie que l'identifiant durable est réutilisé seulement pour un payload identique.
import { clearAllOperationIds, clearOperationId, getOrCreateOperationId } from './operation-id';

const mockValues = new Map<string, string>();
let mockUuidIndex = 0;

jest.mock('./secure-storage', () => ({ secureStorage: {
  getItem: async (key: string) => mockValues.get(key) ?? null,
  setItem: async (key: string, value: string) => { mockValues.set(key, value); },
  removeItem: async (key: string) => { mockValues.delete(key); },
} }));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: async (_algorithm: string, value: string) => `hash:${value}`,
  randomUUID: () => `00000000-0000-4000-8000-${String(++mockUuidIndex).padStart(12, '0')}`,
}));

describe('durable operation ids', () => {
  beforeEach(() => { mockValues.clear(); mockUuidIndex = 0; });

  it('reuses the id for the same payload', async () => {
    const first = await getOrCreateOperationId('medication:user-a', { name: 'A', dosage: '1' });
    const second = await getOrCreateOperationId('medication:user-a', { dosage: '1', name: 'A' });
    expect(second).toBe(first);
  });

  it('replaces the id when the payload changes or succeeds', async () => {
    const first = await getOrCreateOperationId('medication:user-a', { name: 'A' });
    const changed = await getOrCreateOperationId('medication:user-a', { name: 'B' });
    expect(changed).not.toBe(first);
    await clearOperationId('medication:user-a');
    await expect(getOrCreateOperationId('medication:user-a', { name: 'B' })).resolves.not.toBe(changed);
  });

  it('purges all operation ids on account cleanup', async () => {
    await getOrCreateOperationId('health:user-a', { pain: 1 });
    await getOrCreateOperationId('medication:user-a', { name: 'A' });
    await clearAllOperationIds();
    expect([...mockValues.keys()]).toHaveLength(0);
  });
});
