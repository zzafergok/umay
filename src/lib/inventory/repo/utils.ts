/**
 * Recursively removes keys with `undefined` values from objects and arrays
 * so payloads remain Firestore-safe.
 */
export function omitUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefinedDeep(item)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, omitUndefinedDeep(entryValue)]);
    return Object.fromEntries(entries) as T;
  }
  return value;
}
