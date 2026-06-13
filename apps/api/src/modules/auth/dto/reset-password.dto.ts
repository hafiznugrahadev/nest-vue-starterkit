import { createZodDto } from 'nestjs-zod';
import { resetPasswordSchema } from '@starterkit/schemas';

export class ResetPasswordDto extends createZodDto(resetPasswordSchema.strict()) {}
