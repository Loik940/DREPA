// Déduplique les identifiants valides avant toute opération sur les notifications locales.
export function uniqueNotificationIds(ids: readonly (string | null | undefined)[]) {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

export class NotificationCancellationError extends Error {
  constructor(
    public readonly cancelledIds: string[],
    public readonly cause?: unknown,
  ) {
    super('L’annulation des notifications est incomplète.');
    this.name = 'NotificationCancellationError';
  }
}

// Ce filtre pur sélectionne seulement les snapshots dont la notification a réellement été annulée.
export function filterByNotificationIds<T>(
  snapshots: readonly T[],
  cancelledIds: readonly string[],
  getNotificationId: (snapshot: T) => string | null,
) {
  const cancelledIdSet = new Set(cancelledIds);
  return snapshots.filter((snapshot) => {
    const notificationId = getNotificationId(snapshot);
    return notificationId !== null && cancelledIdSet.has(notificationId);
  });
}
