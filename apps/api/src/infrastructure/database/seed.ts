import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { hashPassword } from '../../common/utils/password';
import * as schema from './schema';
import { roles, userRoles, users } from './schema';

// Single root .env (cwd = apps/api when run via `bun run --filter`). Env vars win.
config({ path: ['../../.env', '.env'] });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema, casing: 'snake_case' });

/** Upsert a role by name (idempotent) and return its row. */
async function upsertRole(name: string) {
  await db.insert(roles).values({ name }).onConflictDoNothing({ target: roles.name });
  const [row] = await db.select().from(roles).where(eq(roles.name, name));
  return row;
}

/** Upsert a user by email, then reset its roles (idempotent re-seed). */
async function upsertUser(
  data: { email: string; name: string; password: string },
  roleIds: string[],
) {
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({ target: users.email, set: { updatedAt: new Date() } })
    .returning({ id: users.id, email: users.email });

  await db.delete(userRoles).where(eq(userRoles.userId, user.id));
  if (roleIds.length) {
    await db.insert(userRoles).values(roleIds.map((roleId) => ({ userId: user.id, roleId })));
  }
  return user;
}

async function main() {
  // Roles are data (M2M). Upsert the well-known ones; add more rows freely.
  const [superRole, adminRole, userRole] = await Promise.all([
    upsertRole('SUPER_ADMIN'),
    upsertRole('ADMIN'),
    upsertRole('USER'),
  ]);

  // Super admin manages users (CRUD). All three roles.
  const superAdmin = await upsertUser(
    {
      email: 'superadmin@starterkit.test',
      name: 'Super Admin',
      password: await hashPassword('super1234'),
    },
    [superRole.id, adminRole.id, userRole.id],
  );

  // Admin holds two roles (demonstrates a multi-role user).
  const admin = await upsertUser(
    { email: 'admin@starterkit.test', name: 'Admin', password: await hashPassword('admin123') },
    [adminRole.id, userRole.id],
  );

  const user = await upsertUser(
    {
      email: 'user@starterkit.test',
      name: 'Regular User',
      password: await hashPassword('user1234'),
    },
    [userRole.id],
  );

  console.log('Seed complete:', {
    superAdmin: superAdmin.email,
    admin: admin.email,
    user: user.email,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
