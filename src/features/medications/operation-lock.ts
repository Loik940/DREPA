// Verrou local partagé : sérialise les mutations et la réconciliation qui combinent Supabase et Android.
// Il évite qu’une opération native annule ou remplace le planning qu’une autre opération est en train de valider.
let operationQueue: Promise<void> = Promise.resolve();

export async function runMedicationOperation<T>(operation: () => Promise<T>) {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.then(() => undefined, () => undefined);
  return result;
}
