import { z } from 'zod';

/**
 * Shared base for every list endpoint. `z.coerce.number()` replaces the old
 * class-transformer `@Type(() => Number)` so query strings (`?page=2`) coerce to
 * numbers. Feature query schemas extend this with their own filters.
 */
export const baseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  sortBy: z.string().default('createdAt'),
});

export type BaseQueryInput = z.infer<typeof baseQuerySchema>;

/** 0-based offset derived from page/limit — replaces the old `BaseQueryDto.get skip()`. */
export const computeSkip = (q: { page: number; limit: number }): number => (q.page - 1) * q.limit;
