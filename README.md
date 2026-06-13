# Starter Kit

A **Bun + Turbo monorepo** starter kit — NestJS API + Vue 3 SPA web with
authentication, a users datatable, and reusable components, built to the team
[`SPEC.md`](./SPEC.md) conventions.

```
starterkit/
├── apps/
│   ├── api/            NestJS 11 + Drizzle ORM backend (JWT auth, class-validator, Swagger, Pino)
│   └── web/            Vue 3 SPA frontend (Reka UI, Pinia, Vue Router, vue-i18n)
├── packages/
│   └── shared-types/   TS contracts (UserRole, API envelope, entities) shared by both
├── docker-compose.yml  Postgres + Redis (backing services for local dev)
└── turbo.json
```

## Stack

| Layer    | Tech                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| Backend  | Bun · NestJS 11 · Drizzle ORM · PostgreSQL · Redis · JWT                                      |
| Frontend | Vue 3 · Vite · Tailwind v4 · Reka UI (shadcn-style) · Pinia · Vue Router · vee-validate + Zod |
| Shared   | `@starterkit/shared-types` (UserRole + API contracts, compiled to CJS/ESM)                    |

## What's included

- **Auth** — email/password login, short-lived JWT access token + rotating refresh
  token in an httpOnly cookie (with reuse detection), `/auth/refresh` + `/auth/logout`,
  global JWT & role guards, login rate limiting.
- **Users datatable** — admin-only `GET /users` (paginated, searchable; password never
  returned) rendered with a generic, reusable `<DataTable />`.
- **Reusable components** — shadcn-style UI primitives (Reka UI), vee-validate field
  components, and Error/Empty/Loading state blocks; `BaseRepository`/`BaseCrudService`/
  `BaseQueryDto` on the backend.

## Getting started

```bash
# 1. Install (Bun workspaces)
bun install

# 2. One .env for the whole monorepo
cp .env.example .env

# 3. Start backing services (Postgres + Redis)
docker compose up -d postgres redis

# 4. Apply Drizzle migrations + seed
bun run --filter @starterkit/api db:migrate   # apply migrations
bun run --filter @starterkit/api db:seed

# 5. Run everything (one command for api + web)
bun run serve
```

> **Single `.env`:** there is exactly one env file at the repo root. The API loads
> it via `ConfigModule` (`envFilePath: ../../.env`); the web reads `VITE_`-prefixed
> vars through Vite.

Running `bun run serve` (host processes):

- API → http://localhost:4400/api · Swagger → http://localhost:4400/api/docs
- Web → http://localhost:4301

Or the full stack in Docker (`docker compose up`). The containers publish **no host
ports** — OrbStack routes to each over HTTPS at its auto-domain
`<service>.starterkit-dev.orb.local` (no manual TLS):

- Web → https://web.starterkit-dev.orb.local · API → https://api.starterkit-dev.orb.local/api
- Adminer → https://adminer.starterkit-dev.orb.local · Mailpit → https://mailpit.starterkit-dev.orb.local
- RustFS S3 API → https://rustfs.starterkit-dev.orb.local · console → https://console-rustfs.starterkit-dev.orb.local
- Postgres → `postgres.starterkit-dev.orb.local:5432` · Redis → `redis.starterkit-dev.orb.local:6379`

> **CORS + cookies:** the refresh cookie requires an explicit `CORS_ORIGIN` (the web
> origin) on the API — a wildcard `*` is rejected by browsers for credentialed requests.

### Ports (configurable in the root `.env`)

| App | Default | Where to change                                                   |
| --- | ------- | ----------------------------------------------------------------- |
| Web | `4301`  | `.env` → `WEB_PORT`                                               |
| API | `4400`  | `.env` → `API_PORT` (also update `CORS_ORIGIN` + `VITE_API_BASE`) |

### Serve commands

| Command             | Starts                         |
| ------------------- | ------------------------------ |
| `bun run serve`     | API + Web together (Turbo)     |
| `bun run serve:api` | API only (`:4400`, watch mode) |
| `bun run serve:web` | Web only (`:4301`, HMR)        |

### Seed credentials

| Role        | Email                        | Password    |
| ----------- | ---------------------------- | ----------- |
| Super Admin | `superadmin@starterkit.test` | `super1234` |
| Admin       | `admin@starterkit.test`      | `admin123`  |
| User        | `user@starterkit.test`       | `user1234`  |

## DRY patterns

**Backend** (`apps/api/src/common`): `BaseEntity`, `BaseQueryDto`, `PaginatedDto`,
`BaseRepository<T>` (with `omit` support), `BaseCrudService`, `ResponseInterceptor`,
global `ValidationPipe`, `IsUnique` async validator, `ApiPaginatedResponse` decorator,
`@Global()` Drizzle/Redis modules.

**Frontend** (`apps/web/src`): vee-validate field components, Pinia feature stores
(`features/user`, `features/logs`, `features/profile`), and a single `api-client` with
transparent 401→refresh→retry.

## Scripts (root)

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `bun run serve`     | Run api + web                 |
| `bun run dev`       | Alias of `serve`              |
| `bun run build`     | Build all packages (ordered)  |
| `bun run typecheck` | Type-check the whole monorepo |
| `bun run lint`      | Lint all packages             |
| `bun run test`      | Run unit tests                |
