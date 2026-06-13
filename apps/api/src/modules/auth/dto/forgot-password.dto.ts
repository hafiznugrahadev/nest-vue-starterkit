import { createZodDto } from 'nestjs-zod';
import { forgotPasswordSchema } from '@starterkit/schemas';

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema.strict()) {}
