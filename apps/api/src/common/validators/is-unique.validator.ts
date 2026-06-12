import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DrizzleService } from '@infrastructure/database/drizzle.service';
import { roles, users } from '@infrastructure/database/schema';

/** Tables eligible for uniqueness checks, keyed by the `model` arg. */
const TABLE_REGISTRY: Record<string, PgTable> = { user: users, role: roles };

export interface IsUniqueArgs {
  /** Registered table key, e.g. 'user' or 'role'. */
  model: string;
  /** Column to check, defaults to the decorated property name. */
  column?: string;
}

/**
 * SPEC DRY #8 — async DB-backed uniqueness validator. Registered as a provider so
 * class-validator (via `useContainer`) can inject DrizzleService.
 *   `@IsUnique({ model: 'user', column: 'email' }) email: string;`
 */
@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly drizzle: DrizzleService) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    if (value === undefined || value === null) return true;
    const { model, column } = args.constraints[0] as IsUniqueArgs;
    const field = column ?? args.property;

    const table = TABLE_REGISTRY[model];
    if (!table) return true;
    const col = (table as unknown as Record<string, PgColumn>)[field];
    if (!col) return true;

    const [{ count }] = await this.drizzle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
      .where(eq(col, value as string));
    return count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} already exists`;
  }
}

export function IsUnique(args: IsUniqueArgs, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsUnique',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [args],
      validator: IsUniqueConstraint,
    });
  };
}
