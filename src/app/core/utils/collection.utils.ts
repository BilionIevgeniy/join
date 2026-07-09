/**
 * Converts a list of items into a lookup map keyed by id, skipping items without one.
 * Shared by services (ContactService, TaskService) that keep their local state as a
 * `Record<string, T>` map instead of an array, for O(1) lookups by id.
 */
export function toMapById<T extends { id?: string }>(items: T[]): Record<string, T> {
  const map: Record<string, T> = {};
  items.forEach((item) => {
    if (item.id) map[item.id] = item;
  });
  return map;
}

/**
 * First `max` items of a list, for avatar-stack style UI that shows a limited
 * number of items directly and collapses the rest into a "+N" badge.
 * Pairs with {@link countRemaining}.
 */
export function takeVisible<T>(items: T[], max: number): T[] {
  return items.slice(0, max);
}

/** Count of items beyond `max`, for the "+N" badge that pairs with {@link takeVisible}. */
export function countRemaining<T>(items: T[], max: number): number {
  return Math.max(0, items.length - max);
}
