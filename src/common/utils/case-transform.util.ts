/**
 * Recursive object-key case conversion.
 *
 * The frontend's types (ProjectRow, InvoiceRow, etc.) are the original
 * Supabase-generated snake_case types and were never changed. TypeORM
 * entities use idiomatic camelCase properties. Rather than rewrite every
 * frontend type/component or every backend entity/DTO, we convert at the
 * API boundary: responses go out snake_case, incoming request bodies come
 * in converted to camelCase before validation. Everything internal to
 * Nest/TypeORM stays camelCase; everything on the wire matches what the
 * frontend has always expected.
 *
 * Skips Date objects and arrays' primitive contents; recurses into plain
 * objects and arrays of objects only.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof Date) &&
    !Array.isArray(value)
  );
}

export function toSnakeCase<T = unknown>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => toSnakeCase(item)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(value);
    }
    return result as unknown as T;
  }
  return input;
}

export function toCamelCase<T = unknown>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCase(item)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const camelKey = key.replace(/_([a-z0-9])/g, (_match, letter: string) =>
        letter.toUpperCase(),
      );
      result[camelKey] = toCamelCase(value);
    }
    return result as unknown as T;
  }
  return input;
}
