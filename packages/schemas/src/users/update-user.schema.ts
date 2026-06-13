import { z } from 'zod';
import { roleNameSchema } from './create-user.schema';

/** Admin update: email is immutable; pass any subset of name/password/roles. */
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name is too short').optional(),
  password: z.string().min(8, 'At least 8 characters').optional(),
  roles: z.array(roleNameSchema).min(1, 'Select at least one role').optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
