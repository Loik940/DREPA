// Vérifie qu’aucune opération Médicaments d’une ancienne session ne survit au changement de compte.
import { runMedicationOperation, setActiveMedicationOwner } from './operation-lock';

describe('medication operation session guard', () => {
  it('accepts only the active owner', async () => {
    setActiveMedicationOwner('user-a');
    await expect(runMedicationOperation('user-a', async () => 'ok')).resolves.toBe('ok');
    setActiveMedicationOwner('user-b');
    await expect(runMedicationOperation('user-a', async () => 'stale')).rejects.toThrow('ancienne session');
  });

  it('rejects an operation invalidated while awaiting', async () => {
    setActiveMedicationOwner('user-a');
    let release: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => { release = resolve; });
    const operation = runMedicationOperation('user-a', async () => {
      await waiting;
      return 'finished';
    });
    await Promise.resolve();
    setActiveMedicationOwner('user-b');
    release?.();
    await expect(operation).rejects.toThrow('ancienne session');
  });
});
