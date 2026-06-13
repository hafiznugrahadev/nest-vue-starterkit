import { createZodDto } from 'nestjs-zod';
import { updateProfileSchema } from '@starterkit/schemas';

/**
 * Self-service profile update for the *authenticated* user. Deliberately narrow:
 * the display name and avatar are editable here — email is immutable and roles
 * can never be changed by the user themselves (that stays a SUPER_ADMIN action).
 */
export class UpdateProfileDto extends createZodDto(updateProfileSchema.strict()) {}
