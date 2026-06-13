import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from '@starterkit/schemas';

/**
 * Shared with the web create-user form. Email uniqueness is enforced in
 * UsersService.create (409 on conflict), not here, so the schema stays pure.
 */
export class CreateUserDto extends createZodDto(createUserSchema.strict()) {}
