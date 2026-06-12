import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Drizzle ORM wired into Nest lifecycle hooks. Talks to PostgreSQL through the
 * `node-postgres` driver. Inject this service and use `.db` for queries.
 */
@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private readonly pool: Pool;
  public readonly db: NodePgDatabase<typeof schema>;

  constructor(config: ConfigService) {
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>('database.url'),
      max: 100,
      min: 10,
    });
    this.db = drizzle(this.pool, { schema, casing: 'snake_case' });
  }

  async onModuleInit(): Promise<void> {
    await this.db.execute(sql`select 1`);
    this.logger.log('Drizzle connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Drizzle disconnected');
  }
}

/** The fully-typed Drizzle database handle (with relational schema). */
export type Database = NodePgDatabase<typeof schema>;

/** A transaction handle as passed to `db.transaction(async (tx) => …)`. */
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
