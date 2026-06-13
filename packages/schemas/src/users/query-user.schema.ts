import { z } from 'zod';
import { UserRole } from '@starterkit/shared-types';
import { baseQuerySchema } from '../common/query.schema';

/**
 * User list query — extends the base with a repeatable `roles` filter
 * (`?roles=ADMIN&roles=USER`). A single value is coerced to an array, mirroring
 * the old class-transformer `@Transform`.
 */
export const queryUserSchema = baseQuerySchema.extend({
  roles: z
    .union([z.nativeEnum(UserRole), z.array(z.nativeEnum(UserRole))])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional(),
});

export type QueryUserInput = z.infer<typeof queryUserSchema>;
