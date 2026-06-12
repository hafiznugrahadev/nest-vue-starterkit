import { config } from 'dotenv';
import { Pool } from 'pg';

// Dev-only helper: drop & recreate the `public` schema (wipes all tables/data).
// Single root .env (cwd = apps/api when run via `bun run --filter`). Env vars win.
config({ path: ['../../.env', '.env'] });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  console.log('Database schema reset (public dropped & recreated). Run db:migrate next.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
