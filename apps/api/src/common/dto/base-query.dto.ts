import { createZodDto } from 'nestjs-zod';
import { baseQuerySchema } from '@starterkit/schemas';

/**
 * SPEC DRY #2 — every list endpoint extends this schema. Feature query DTOs add
 * their own filters by extending `baseQuerySchema`. The old `get skip()` getter is
 * replaced by the `computeSkip(query)` helper from @starterkit/schemas.
 */
export class BaseQueryDto extends createZodDto(baseQuerySchema) {}
