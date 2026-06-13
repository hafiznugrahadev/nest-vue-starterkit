import { z } from 'zod';

/** Authenticated user rotating their own password (current password required). */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
