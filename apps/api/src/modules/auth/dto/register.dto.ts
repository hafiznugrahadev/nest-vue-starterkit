import { createZodDto } from 'nestjs-zod';
import { registerSchema } from '@starterkit/schemas';

/** Self-service registration payload (only accepted when registration is enabled). */
export class RegisterDto extends createZodDto(registerSchema.strict()) {}
