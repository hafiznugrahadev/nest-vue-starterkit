import { createZodDto } from 'nestjs-zod';
import { updateUserSchema } from '@starterkit/schemas';

/** Email is immutable here; pass any subset of name/password/roles. */
export class UpdateUserDto extends createZodDto(updateUserSchema.strict()) {}
