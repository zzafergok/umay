import { z } from 'zod';
import type { PaginatedResponse } from './types';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const basePaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(120).optional(),
});

export function parsePaginationSearchParams<TSchema extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: TSchema,
): z.infer<TSchema> {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (value !== '') {
      raw[key] = value;
    }
  });
  return schema.parse(raw);
}

export function paginateArray<TItem, TSummary = undefined>(
  allItems: TItem[],
  page: number,
  pageSize: number,
  summary?: TSummary,
): PaginatedResponse<TItem, TSummary> {
  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * pageSize;
  const items = allItems.slice(startIndex, startIndex + pageSize);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages: total === 0 ? 0 : totalPages,
    ...(summary !== undefined ? { summary } : {}),
  };
}

export function matchesTurkishSearch(
  query: string | undefined,
  ...fields: Array<string | null | undefined>
): boolean {
  const normalized = query?.trim().toLocaleLowerCase('tr-TR');
  if (!normalized) return true;
  return fields.some((field) =>
    field ? field.toLocaleLowerCase('tr-TR').includes(normalized) : false,
  );
}

export function buildCleanQueryParams<T extends Record<string, unknown>>(
  params: T,
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      clean[key] = value;
    }
  }
  return clean;
}
