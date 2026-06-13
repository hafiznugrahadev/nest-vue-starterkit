import { createZodDto } from 'nestjs-zod';
import { queryUserSchema } from '@starterkit/schemas';

/** SPEC DRY #2 — base list query + a repeatable `roles` filter. */
export class QueryUserDto extends createZodDto(queryUserSchema) {}
