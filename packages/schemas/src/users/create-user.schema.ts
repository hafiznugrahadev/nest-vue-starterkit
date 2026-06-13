import { z } from 'zod';
import { UserRole } from '@starterkit/shared-types';

/** Role names assignable to a user. */
export const roleNameSchema = z.nativeEnum(UserRole);

/**
 * Create-user payload. Email uniqueness is intentionally NOT checked here — that
 * is a persistence concern enforced in UsersService.create (409 on conflict),
 * keeping this schema pure and reusable by the web form.
 */
export const createUserSchema = z.object({
  email: z.string().email('Enter a valid email'),
  name: z.string().min(2, 'Name is too short'),
  password: z.string().min(8, 'At least 8 characters'),
  roles: z.array(roleNameSchema).min(1, 'Select at least one role'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
