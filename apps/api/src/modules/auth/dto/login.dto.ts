import { createZodDto } from 'nestjs-zod';
import { loginSchema } from '@starterkit/schemas';

/** Validation lives in @starterkit/schemas — shared with the web login form. */
export class LoginDto extends createZodDto(loginSchema.strict()) {}
