import { Injectable } from '@nestjs/common';
import { and, eq, exists, inArray, sql } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import {
  BaseRepository,
  RelationalQuery,
  stripUndefined,
} from '@common/repositories/base.repository';
import { BaseQueryDto } from '@common/dto/base-query.dto';
import { PaginatedResult } from '@common/interfaces/paginated-result.interface';
import { DrizzleService, Transaction } from '@infrastructure/database/drizzle.service';
import { roles, userRoles, users } from '@infrastructure/database/schema';
import { UserEntity } from './entities/user.entity';

/** A user row with its roles included and the password omitted. */
export type UserWithRoles = Omit<UserEntity, 'roles'> & { roles: { name: string }[] };

/** Raw relational-query shape (roles reached through the join table). */
type RawUserWithRoles = Omit<UserEntity, 'roles'> & { userRoles: { role: { name: string } }[] };

/** Eager-load config that reaches `roles` through the `user_roles` join table. */
const WITH_ROLES = { userRoles: { columns: {}, with: { role: { columns: { name: true } } } } };

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  protected readonly searchableColumns: PgColumn[] = [users.name, users.email];

  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  protected get db() {
    return this.drizzle.db;
  }

  protected get table() {
    return users;
  }

  protected get query(): RelationalQuery {
    return this.drizzle.db.query.users as unknown as RelationalQuery;
  }

  /** Paginated list with roles flattened and the password omitted. */
  async paginateWithRoles(
    query: BaseQueryDto,
    roleNames?: string[],
  ): Promise<PaginatedResult<UserWithRoles>> {
    const where = roleNames?.length
      ? exists(
          this.drizzle.db
            .select({ one: sql`1` })
            .from(userRoles)
            .innerJoin(roles, eq(userRoles.roleId, roles.id))
            .where(and(eq(userRoles.userId, users.id), inArray(roles.name, roleNames))),
        )
      : undefined;

    const page = await this.paginate(query, {
      where,
      columns: { password: false },
      with: WITH_ROLES,
    });
    return {
      ...page,
      data: page.data.map((u) => flatten(u as unknown as RawUserWithRoles)),
    };
  }

  async findWithRoles(id: string): Promise<UserWithRoles | null> {
    const row = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { password: false },
      with: WITH_ROLES,
    });
    return row ? flatten(row as unknown as RawUserWithRoles) : null;
  }

  /** The only path that reads the password hash — used to verify the current
   * password before a self-service change. */
  async findWithPassword(id: string): Promise<{ id: string; password: string } | null> {
    const row = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { id: true, password: true },
    });
    return row ?? null;
  }

  async createWithRoles(
    data: { email: string; name: string; password: string },
    roleNames: string[],
  ): Promise<UserWithRoles> {
    const id = await this.drizzle.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(data).returning({ id: users.id });
      await this.assignRoles(tx, user.id, roleNames);
      return user.id;
    });
    return (await this.findWithRoles(id))!;
  }

  async updateWithRoles(
    id: string,
    data: { name?: string; password?: string; avatarUrl?: string | null },
    roleNames?: string[],
  ): Promise<UserWithRoles> {
    await this.drizzle.db.transaction(async (tx) => {
      // Always touch updatedAt (mirrors Prisma's @updatedAt on every update).
      await tx
        .update(users)
        .set({ ...stripUndefined(data), updatedAt: new Date() })
        .where(eq(users.id, id));
      if (roleNames) {
        await tx.delete(userRoles).where(eq(userRoles.userId, id));
        await this.assignRoles(tx, id, roleNames);
      }
    });
    return (await this.findWithRoles(id))!;
  }

  /** Resolve role names → ids and insert the join rows (no-op for empty input). */
  private async assignRoles(tx: Transaction, userId: string, roleNames: string[]): Promise<void> {
    if (!roleNames.length) return;
    const roleRows = await tx
      .select({ id: roles.id })
      .from(roles)
      .where(inArray(roles.name, roleNames));
    if (roleRows.length) {
      await tx.insert(userRoles).values(roleRows.map((r) => ({ userId, roleId: r.id })));
    }
  }
}

/** Flatten the join-table shape into `roles: { name }[]`. */
function flatten(row: RawUserWithRoles): UserWithRoles {
  const { userRoles: links, ...user } = row;
  return { ...user, roles: links.map((l) => ({ name: l.role.name })) };
}
