// Drizzle schema for starterkit (PostgreSQL).
// JS keys are camelCase (consumed unchanged by services/entities); DB columns are
// snake_case. IDs are native `uuid` with a DB-side default (gen_random_uuid()).
import { relations } from 'drizzle-orm';
import { index, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  // public URL of the user's avatar (storage module)
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { precision: 3 })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  // e.g. ADMIN, USER — add rows without code changes
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
});

// Many-to-many join between users and roles (scalable RBAC).
export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId] }),
    index('user_roles_role_id_idx').on(t.roleId),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // tokens rotated from one login share a family (reuse detection)
    familyId: text('family_id').notNull(),
    // SHA-256 of the opaque token (raw value never stored)
    tokenHash: text('token_hash').notNull().unique(),
    // set on rotation/logout; a non-null value means unusable
    revokedAt: timestamp('revoked_at', { precision: 3 }),
    expiresAt: timestamp('expires_at', { precision: 3 }).notNull(),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  },
  (t) => [
    index('refresh_tokens_user_id_idx').on(t.userId),
    index('refresh_tokens_family_id_idx').on(t.familyId),
  ],
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // SHA-256 of the opaque token (raw value never stored)
    tokenHash: text('token_hash').notNull().unique(),
    // set once the token is consumed; a non-null value means spent
    usedAt: timestamp('used_at', { precision: 3 }),
    expiresAt: timestamp('expires_at', { precision: 3 }).notNull(),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  },
  (t) => [index('password_reset_tokens_user_id_idx').on(t.userId)],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull(),
    // info | success | warning | error
    type: text('type').notNull().default('info'),
    readAt: timestamp('read_at', { precision: 3 }),
    createdAt: timestamp('created_at', { precision: 3 }).notNull().defaultNow(),
  },
  (t) => [index('notifications_user_id_created_at_idx').on(t.userId, t.createdAt)],
);

// ── Relations (Drizzle Relational Queries v1) ─────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  refreshTokens: many(refreshTokens),
  passwordResetTokens: many(passwordResetTokens),
  notifications: many(notifications),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
