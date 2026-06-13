import { createZodDto } from 'nestjs-zod';
import { changePasswordSchema } from '@starterkit/schemas';

/** Authenticated user rotating their own password (current password required). */
export class ChangePasswordDto extends createZodDto(changePasswordSchema.strict()) {}
