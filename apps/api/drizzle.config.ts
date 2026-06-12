import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Single root .env (CLI runs with cwd = apps/api). Existing env vars win.
config({ path: ['../../.env', '.env'] });

export default defineConfig({
  schema: './src/infrastructure/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
