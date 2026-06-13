import { and, asc, desc, eq, ilike, or, sql, SQL } from 'drizzle-orm';
import { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { computeSkip } from '@starterkit/schemas';
import type { Database } from '@infrastructure/database/drizzle.service';
import { BaseQueryDto } from '../dto/base-query.dto';
import { buildPaginationMeta, PaginatedResult } from '../interfaces/paginated-result.interface';

/**
 * Minimal structural type of a Drizzle relational-query namespace
 * (e.g. `db.query.users`). Avoids coupling the base class to a concrete entity
 * while staying type-checked.
 */
export interface RelationalQuery {
  findFirst(args?: Record<string, unknown>): Promise<unknown>;
  findMany(args?: Record<string, unknown>): Promise<unknown[]>;
}

/** Read options forwarded to the relational query (`with` = relations, `columns` = select/omit). */
export interface ReadOptions {
  with?: Record<string, unknown>;
  columns?: Record<string, boolean>;
}

export interface ListOptions extends ReadOptions {
  /** Extra WHERE expression ANDed with the search clause. */
  where?: SQL;
}

/** Drop keys whose value is `undefined` (Drizzle `.set()` would otherwise no-op/NULL). */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/**
 * SPEC ⭐ `BaseRepository<T>` — the only place that talks to Drizzle directly.
 * Subclasses expose the concrete table + relational query + searchable columns;
 * everything else (pagination, search OR-clause, sorting) is inherited.
 */
export abstract class BaseRepository<T> {
  /** The Drizzle database handle. */
  protected abstract get db(): Database;
  /** Concrete pgTable, e.g. `users`. */
  protected abstract get table(): PgTable;
  /** Relational query namespace, e.g. `this.db.query.users`. */
  protected abstract get query(): RelationalQuery;

  /** Columns included in `?search=` (case-insensitive contains). */
  protected readonly searchableColumns: PgColumn[] = [];

  async paginate(query: BaseQueryDto, options: ListOptions = {}): Promise<PaginatedResult<T>> {
    const { page, limit, search, order, sortBy } = query;

    const conditions: SQL[] = [];
    if (options.where) conditions.push(options.where);
    if (search && this.searchableColumns.length > 0) {
      const term = `%${search}%`;
      const searchClause = or(...this.searchableColumns.map((c) => ilike(c, term)));
      if (searchClause) conditions.push(searchClause);
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const sortColumn = this.column(sortBy) ?? this.column('createdAt') ?? this.idColumn;
    const orderBy = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [data, total] = await Promise.all([
      this.query.findMany({
        where,
        with: options.with,
        columns: options.columns,
        orderBy,
        limit,
        offset: computeSkip(query),
      }),
      this.countWhere(where),
    ]);

    return { data: data as T[], meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string, options: ReadOptions = {}): Promise<T | null> {
    const row = await this.query.findFirst({
      where: eq(this.idColumn, id),
      with: options.with,
      columns: options.columns,
    });
    return (row ?? null) as T | null;
  }

  async findOne(where: SQL, options: ReadOptions = {}): Promise<T | null> {
    const row = await this.query.findFirst({ where, with: options.with, columns: options.columns });
    return (row ?? null) as T | null;
  }

  async create(values: Record<string, unknown>): Promise<T> {
    const [row] = await this.db
      .insert(this.table)
      .values(values as never)
      .returning();
    return row as T;
  }

  async update(id: string, values: Record<string, unknown>): Promise<T> {
    const [row] = await this.db
      .update(this.table)
      .set(stripUndefined(values))
      .where(eq(this.idColumn, id))
      .returning();
    return row as T;
  }

  async delete(id: string): Promise<T> {
    const [row] = await this.db.delete(this.table).where(eq(this.idColumn, id)).returning();
    return row as T;
  }

  count(where?: SQL): Promise<number> {
    return this.countWhere(where);
  }

  exists(where: SQL): Promise<boolean> {
    return this.countWhere(where).then((n) => n > 0);
  }

  /** The table's `id` column. */
  protected get idColumn(): PgColumn {
    return this.columns.id;
  }

  /** Column lookup by JS key (used for dynamic `sortBy`). */
  private column(key: string): PgColumn | undefined {
    return this.columns[key];
  }

  private get columns(): Record<string, PgColumn> {
    return this.table as unknown as Record<string, PgColumn>;
  }

  private async countWhere(where?: SQL): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table)
      .where(where);
    return count;
  }
}
