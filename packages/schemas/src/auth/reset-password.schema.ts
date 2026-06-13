import { z } from 'zod';

/**
 * Server-side reset payload: the opaque token from the emailed link plus the new
 * password. The web form adds its own `confirmPassword` match check on top (a
 * UI-only concern) and supplies `token` from the URL, so it keeps a local schema.
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
