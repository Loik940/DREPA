// Verrou local partagé : sérialise les mutations et la réconciliation qui combinent Supabase et Android.
// Il évite qu’une opération native annule ou remplace le planning qu’une autre opération est en train de valider.
let operationQueue: Promise<void> = Promise.resolve();
let activeOwnerId: string | null = null;
let activeGeneration = 0;
let currentOperation: { ownerId: string; generation: number } | null = null;

export function setActiveMedicationOwner(ownerId: string | null) {
  if (ownerId === activeOwnerId) return activeGeneration;
  activeOwnerId = ownerId;
  activeGeneration += 1;
  return activeGeneration;
}

export function assertCurrentMedicationOperation() {
  if (!currentOperation) return;
  if (currentOperation.ownerId !== activeOwnerId || currentOperation.generation !== activeGeneration) {
    throw new Error('Cette opération appartient à une ancienne session.');
  }
}

export async function runMedicationOperation<T>(ownerId: string | undefined, operation: () => Promise<T>) {
  if (!ownerId) throw new Error('La session utilisateur est indisponible.');
  const generation = activeGeneration;
  const guardedOperation = async () => {
    if (ownerId !== activeOwnerId || generation !== activeGeneration) {
      throw new Error('Cette opération appartient à une ancienne session.');
    }
    currentOperation = { ownerId, generation };
    try {
      const result = await operation();
      assertCurrentMedicationOperation();
      return result;
    } finally {
      currentOperation = null;
    }
  };
  const result = operationQueue.then(guardedOperation, guardedOperation);
  operationQueue = result.then(() => undefined, () => undefined);
  return result;
}
