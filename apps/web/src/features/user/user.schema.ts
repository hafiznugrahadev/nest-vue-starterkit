import { z } from 'zod';
import { createUserSchema } from '@starterkit/schemas';

// Create form uses the shared schema verbatim (same rules the API enforces).
export { createUserSchema };

/**
 * Edit form variant: email is read-only (optional here) and a blank password means
 * "leave unchanged" — a UI-only nuance, so it stays local rather than in the
 * shared package.
 */
export const editUserSchema = createUserSchema.extend({
  email: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters').or(z.literal('')),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = { name?: string; password?: string; roles?: string[] };
