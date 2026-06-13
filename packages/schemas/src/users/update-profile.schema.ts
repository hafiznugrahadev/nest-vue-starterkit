import { z } from 'zod';

/**
 * Self-service profile update for the authenticated user. Deliberately narrow:
 * display name + avatar key only. Email is immutable and roles can never be
 * self-assigned.
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name is too short').optional(),
  // Storage KEY (e.g. "avatars/abc.png"), resolved to a presigned URL on read.
  avatarUrl: z.string().max(2048).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
