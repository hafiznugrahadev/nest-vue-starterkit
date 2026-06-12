# Project Structure Guide

> Panduan struktur folder + tech stack untuk project ini (`nest-vue-starterkit`). Berlaku sebagai konvensi tim.
> **Prinsip utama: DRY (Don't Repeat Yourself).** Setiap pola yang muncul ≥ 2 kali → angkat jadi abstraksi.

> **Arsitektur:** Monorepo (**Bun workspaces + Turbo**) dengan dua app — **`apps/api`** (NestJS) dan **`apps/web`** (Vue 3 SPA) — plus shared types di **`packages/shared-types`**. BE & FE terpisah, dipanggil via HTTP. Tipe kontrak (entity, enum, response, query) dibagi lewat package `@starterkit/shared-types`.

---

## Tech Stack Overview

<aside>
💡

sebelum mengganti tech stack inti (framework, ORM, runtime) wajib tanya saya terlebih dahulu pada plan mode. Project ini sudah monorepo dengan shared TypeScript types — pertahankan keputusan itu kecuali ada alasan kuat.

</aside>

### Monorepo & Tooling

| Kategori        | Pilihan                        | Catatan                                              |
| --------------- | ------------------------------ | ---------------------------------------------------- |
| Package Manager | **Bun** (`bun@1.3.x`)          | `engines.bun >= 1.3.0`                               |
| Monorepo Runner | **Turborepo**                  | `turbo run dev/build/test/typecheck`                 |
| Workspaces      | `apps/*`, `packages/*`         | `apps/api`, `apps/web`, `packages/shared-types`      |
| Shared Types    | **`@starterkit/shared-types`** | Entity, enum, `ApiResponse`, `Paginated`, query type |
| Language        | **TypeScript** (strict)        | `tsconfig.base.json` di root                         |

### Backend (`apps/api`)

| Kategori       | Pilihan                                                   | Catatan                                                                         |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Runtime        | **Bun** / Node.js LTS                                     | Bun untuk dev & script (seed/reset), Node untuk run prod                        |
| Framework      | **NestJS 11**                                             | Modular, DI, decorator-based                                                    |
| ORM            | **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`)           | Type-safe, SQL-first, schema di `infrastructure/database/schema.ts`             |
| Database (SQL) | **PostgreSQL** (`pg`)                                     | Default transactional, `casing: snake_case`                                     |
| Cache          | **Redis** (`ioredis`)                                     | Cache, rate-limit, token store                                                  |
| Object Storage | **S3-compatible** (`@aws-sdk/client-s3`)                  | MinIO / RustFS / S3 — file upload, asset storage                                |
| Mail           | **Nodemailer**                                            | Transactional email (verifikasi, reset password)                                |
| Auth           | **JWT** (`@nestjs/jwt` + `passport-jwt`) + refresh cookie | Access token (Bearer) + refresh token (httpOnly cookie)                         |
| Password Hash  | **bcrypt**                                                | `common/utils/password.ts`                                                      |
| Rate Limiting  | **@nestjs/throttler**                                     | Global throttle guard                                                           |
| **Validation** | **class-validator** + **class-transformer**               | **Standar NestJS. Jangan pakai Zod di BE — pecah pattern decorator-based.**     |
| Mapped Types   | **@nestjs/mapped-types**                                  | `PartialType`, `PickType`, `OmitType`, `IntersectionType` — kunci DRY untuk DTO |
| Logging        | **Pino** (`nestjs-pino` + `pino-http` + `pino-roll`)      | Fast, structured JSON logs, rolling file                                        |
| API Docs       | **Swagger** (`@nestjs/swagger`)                           | Auto-generated dari decorator, di-protect `express-basic-auth`                  |
| Testing        | **Jest** + Supertest                                      | Unit + e2e                                                                      |
| APP Ports      | configurable via `.env` (default `4400`)                  |                                                                                 |

### Frontend (`apps/web`)

| Kategori        | Pilihan                                          | Catatan                                              |
| --------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Framework       | **Vue 3** (Composition API, `<script setup>`)    | SPA murni (tanpa SSR)                                |
| Router          | **Vue Router 4**                                 | Route config di `src/router/`, guard berbasis meta   |
| Build Tool      | **Vite**                                         | Plugin: `@vitejs/plugin-vue`, `tailwindcss`          |
| Language        | **TypeScript**                                   | Strict mode, typecheck via `vue-tsc`                 |
| Styling         | **Tailwind CSS v4** (`@tailwindcss/vite`)        | Utility-first, no PostCSS config                     |
| UI Primitives   | **shadcn-vue style** (Reka UI)                   | Copy-paste, fully ownable, di `components/ui/`       |
| Forms           | **vee-validate** + **Zod** (`@vee-validate/zod`) | Zod **hanya** untuk FE schema                        |
| State + Data    | **Pinia**                                        | Auth/theme/notifications + feature store per domain  |
| HTTP Client     | **native `fetch`** wrapper (`lib/api-client.ts`) | `apiFetch` / `apiFetchRaw` — auth + 401 refresh      |
| Icons           | **Lucide Vue** (`lucide-vue-next`)               | Konsisten dengan shadcn                              |
| Charts          | **ApexCharts** (`vue3-apexcharts`)               | Dashboard analytics                                  |
| Command Palette | custom (Reka UI Dialog)                          | `⌘K` palette (`components/shell/CommandPalette.vue`) |
| i18n            | **vue-i18n**                                     | Locale `en` / `id` di `src/i18n/locales/`            |
| Date            | **date-fns**                                     | Hindari moment.js                                    |
| Notifications   | **vue-sonner**                                   | Toast modern                                         |
| Testing         | **Vitest** + **Playwright**                      | Unit + e2e                                           |
| APP Ports       | configurable via `.env` (default `4301`)         |                                                      |

### DevOps & Tooling

| Kategori           | Pilihan                                                            |
| ------------------ | ------------------------------------------------------------------ |
| Container          | **Docker** + **Docker Compose** (`docker/`, `docker-compose*.yml`) |
| Deploy             | **Dokploy** (self-hosted di VPS)                                   |
| Reverse Proxy      | **Traefik** / Nginx                                                |
| CDN / WAF          | **Cloudflare**                                                     |
| Monitoring         | **Zabbix** (infra) + **Sentry** (app)                              |
| CI/CD              | **GitHub Actions**                                                 |
| Linter / Formatter | **ESLint** (flat config) + **Prettier**                            |
| Git Hooks          | **Husky** + **lint-staged**                                        |
| Commits            | **Conventional Commits** + **Commitlint**                          |

---

## Shared Types (`packages/shared-types`)

Satu-satunya sumber kebenaran untuk kontrak tipe lintas BE↔FE. Dipublish sebagai dual build (CJS + ESM), di-consume via `workspace:*`.

```
packages/shared-types/src/
├── entities/        ← bentuk entity yang di-share (mis. User tanpa password)
├── enums/           ← UserRole, dst.
├── types/
│   ├── api-response.ts   ← ApiResponse<T>, ApiErrorResponse, Paginated<T>, PaginationMeta
│   └── query.ts          ← tipe query/pagination
└── index.ts         ← barrel
```

- ❌ Jangan duplikasi tipe response/enum di BE atau FE — import dari `@starterkit/shared-types`.
- ✅ Kontrak response (`{ success, data, meta?, message? }`) didefinisikan di sini, dipakai interceptor BE dan `api-client` FE.

---

## Backend (BE) Structure — NestJS + Drizzle

```
apps/api/src/
├── modules/
│   └── <feature>/
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts        ← extends BaseCrudService (jika CRUD)
│       ├── <feature>.repository.ts     ← extends BaseRepository<T>
│       ├── <feature>.module.ts
│       ├── dto/
│       │   ├── create-<feature>.dto.ts
│       │   ├── update-<feature>.dto.ts    ← extends PartialType(CreateDto)
│       │   └── query-<feature>.dto.ts     ← extends BaseQueryDto
│       ├── entities/
│       │   └── <feature>.entity.ts        ← extends BaseEntity (Swagger shape)
│       └── tests/
│   (modules saat ini: auth, users, files, notifications, logs, health)
│
├── common/
│   ├── dto/                 ← ⭐ BaseQueryDto, PaginatedDto
│   ├── entities/            ← ⭐ BaseEntity (id, timestamps)
│   ├── repositories/        ← ⭐ BaseRepository<T> (satu-satunya yang sentuh Drizzle)
│   ├── services/            ← ⭐ BaseCrudService<T>
│   ├── filters/             ← AllExceptionsFilter
│   ├── guards/              ← JwtAuthGuard, RolesGuard
│   ├── interceptors/        ← ResponseInterceptor
│   ├── interfaces/          ← PaginatedResult, buildPaginationMeta
│   ├── decorators/          ← @CurrentUser, @Roles, @Public, @ApiPaginatedResponse
│   ├── middleware/          ← RequestIdMiddleware
│   ├── validators/          ← ⭐ IsUnique (custom class-validator)
│   └── utils/               ← password, token, slug helpers
│
├── infrastructure/
│   ├── database/            ← Drizzle: drizzle.module.ts, drizzle.service.ts, schema.ts, seed.ts, reset.ts
│   ├── redis/               ← Cache service
│   ├── storage/             ← S3/MinIO/RustFS adapter
│   └── mail/                ← Nodemailer service
│
├── config/
│   ├── env.validation.ts    ← class-validator schema untuk env
│   └── app.config.ts
│
├── shared/
│   └── constants/
│
├── app.module.ts
└── main.ts                  ← Global pipes, filters, interceptors, Swagger

apps/api/
├── drizzle.config.ts        ← drizzle-kit (schema path, dialect postgres, snake_case)
└── drizzle/                 ← generated migrations
```

> **Catatan Drizzle vs Prisma:** tidak ada folder `prisma/`. Schema didefinisikan di `infrastructure/database/schema.ts` (pgTable), migrasi lewat `drizzle-kit` (`db:generate`, `db:migrate`, `db:push`, `db:studio`). Seed/reset lewat script Bun (`db:seed`, `db:reset`).

### Layer Responsibilities

| Layer             | Tanggung Jawab                                   | Boleh Akses                   |
| ----------------- | ------------------------------------------------ | ----------------------------- |
| `controller`      | Routing, parsing request, return response        | `service`                     |
| `service`         | Business logic, orchestration, transaction       | `repository`, other `service` |
| `repository`      | DB access via Drizzle                            | Drizzle (`Database`) only     |
| `dto`             | Validasi input (class-validator), shape response | —                             |
| `common/`         | Cross-cutting concerns + base abstractions       | —                             |
| `infrastructure/` | Adapter ke external system                       | External libraries            |

### Rules

- ❌ Controller **tidak boleh** akses repository langsung
- ❌ Service **tidak boleh** import controller
- ❌ Entity **tidak boleh** ke-expose langsung di response (pakai DTO / entity shape)
- ❌ **Jangan pakai Zod di BE** — gunakan class-validator agar konsisten dengan ekosistem NestJS (decorator, Swagger, transformer)
- ❌ **Hanya `BaseRepository` & subclass yang import Drizzle.** Service/controller jangan query DB langsung
- ✅ Setiap module self-contained, ekspor lewat `<feature>.module.ts`
- ✅ Shared logic antar module → angkat ke `common/`

---

## DRY Patterns (BE) — Wajib Diterapkan

### 1. Base Entity — JANGAN copy-paste `id`, `createdAt`, `updatedAt`

```ts
// common/entities/base.entity.ts
export abstract class BaseEntity {
  @ApiProperty() id: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
```

Setiap entity shape (untuk Swagger) extends ini, tidak menulis ulang field standard. Definisi kolom DB-nya tetap di `schema.ts` (Drizzle pgTable).

### 2. Base Query DTO — semua endpoint list pakai pola yang sama

```ts
// common/dto/base-query.dto.ts
export class BaseQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  // `skip` (offset) diturunkan dari page/limit untuk dipakai repository.
}
```

Feature DTO tinggal extend:

```ts
export class QueryUserDto extends BaseQueryDto {
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
}
```

### 3. Mapped Types — JANGAN tulis ulang DTO untuk update

```ts
// ❌ JANGAN duplikasi semua field dari Create
// ✅ PAKAI
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

Tools tersedia: `PartialType`, `PickType`, `OmitType`, `IntersectionType`.

### 4. Pagination Response — bentuk seragam di semua endpoint

```ts
// common/interfaces/paginated-result.interface.ts
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta; // { total, page, limit, totalPages }
}
export function buildPaginationMeta(total, page, limit): PaginationMeta {
  /* ... */
}
```

`PaginationMeta` & `Paginated<T>` di-share dari `@starterkit/shared-types` supaya FE pakai bentuk yang sama.

### 5. Generic Base Repository — satu-satunya yang bicara ke Drizzle

```ts
// common/repositories/base.repository.ts
export abstract class BaseRepository<T> {
  protected abstract get db(): Database; // Drizzle handle
  protected abstract get table(): PgTable; // pgTable konkret
  protected abstract get query(): RelationalQuery; // db.query.<table>
  protected readonly searchableColumns: PgColumn[] = [];

  paginate(query: BaseQueryDto, options?: ListOptions): Promise<PaginatedResult<T>>;
  findById(id, options?): Promise<T | null>;
  findOne(where: SQL, options?): Promise<T | null>;
  create(values): Promise<T>;
  update(id, values): Promise<T>; // auto strip undefined
  delete(id): Promise<T>;
  count(where?): Promise<number>;
  exists(where: SQL): Promise<boolean>;
}
```

Subclass cukup expose `db`, `table`, `query`, dan `searchableColumns` — pagination, search OR-clause (`ilike`), dynamic `sortBy`, dan offset diwariskan.

### 6. Generic Base Service — CRUD repetitif diangkat ke base class

```ts
// common/services/base-crud.service.ts
export abstract class BaseCrudService<T, CreateDto, UpdateDto, QueryDto extends BaseQueryDto> {
  protected abstract readonly entityName: string; // untuk pesan 404
  constructor(protected readonly repository: BaseRepository<T>) {}

  protected get defaultWith(): Record<string, unknown> | undefined {
    return undefined;
  } // eager relations
  protected get defaultColumns(): Record<string, boolean> | undefined {
    return undefined;
  } // select/omit

  findAll(query) {
    /* ... */
  }
  findOne(id) {
    /* throws NotFoundException pakai entityName */
  }
  create(dto) {
    /* ... */
  }
  update(id, dto) {
    /* ... */
  }
  remove(id) {
    /* ... */
  }
}
```

Feature service tinggal override yang perlu custom logic.

### 7. Response Transform Interceptor — bentuk response konsisten global

```ts
// common/interceptors/response.interceptor.ts
// { success: true, data: ..., meta?: ... } — set once, apply globally di main.ts
app.useGlobalInterceptors(new ResponseInterceptor());
```

Bentuk ini cocok dengan `ApiResponse<T>` di `@starterkit/shared-types`.

### 8. Global Validation Pipe — set sekali, berlaku di semua DTO

```ts
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

### 9. Custom Validator — validasi domain spesifik jangan ditulis manual berulang

```ts
// common/validators/is-unique.validator.ts
@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  validate(value, args) { /* check via Drizzle */ }
}
export function IsUnique(options: { table: string; column: string }) { /* registerDecorator */ }

// Pakainya:
@IsUnique({ table: 'users', column: 'email' })
email: string;
```

### 10. Composable Decorators — gabungan decorator yang sering dipakai

```ts
// common/decorators/api-paginated.decorator.ts
export const ApiPaginatedResponse = <T extends Type<unknown>>(model: T) =>
  applyDecorators(
    ApiExtraModels(PaginatedDto, model),
    ApiOkResponse({
      /* schema gabungan */
    }),
  );
```

Decorator lain yang sudah ada: `@CurrentUser`, `@Roles`, `@Public`.

### 11. Module Forwarding — Drizzle/Redis/Storage/Mail module global

```ts
@Global()
@Module({ providers: [DrizzleService], exports: [DrizzleService] })
export class DrizzleModule {}
```

`DrizzleModule`, `RedisModule`, `StorageModule`, `MailModule` dibuat `@Global()` — jangan import berulang per feature.

---

## DRY Checklist (BE)

Sebelum commit, tanya:

- [ ] Apakah ada DTO yang menulis ulang field dari DTO lain? → pakai `PartialType` / `PickType`
- [ ] Apakah ada entity shape yang menulis ulang `id`, `createdAt`, `updatedAt`? → extend `BaseEntity`
- [ ] Apakah ada service yang punya CRUD identik? → extend `BaseCrudService`
- [ ] Apakah ada repository yang query Drizzle manual untuk paginate/search? → pakai `BaseRepository`
- [ ] Apakah ada validasi yang muncul di > 2 DTO? → buat custom validator decorator
- [ ] Apakah ada query pagination yang ditulis manual? → pakai `BaseQueryDto`
- [ ] Apakah ada response shape yang tidak seragam? → pastikan `ResponseInterceptor` global
- [ ] Apakah tipe response/enum diduplikasi di BE & FE? → angkat ke `@starterkit/shared-types`
- [ ] Apakah Drizzle/Redis/Storage di-inject manual per module? → jadikan `@Global()`

---

## Frontend (FE) Structure — Vue 3 SPA

```
apps/web/src/
├── main.ts                         ← boot: pinia → i18n → auth.bootstrap() → router → mount
├── App.vue                         ← <RouterView /> + <Toaster /> (vue-sonner)
├── router/
│   └── index.ts                    ← route config + global guards (requiresAuth / guestOnly / roles)
│
├── layouts/
│   ├── AuthLayout.vue              ← split-screen layout grup auth (login, register, dst)
│   └── DashboardLayout.vue         ← sidebar + header + main (route group dashboard)
│
├── views/                          ← page components (1 file per route)
│   ├── LandingView.vue             ← `/`
│   ├── LoginView.vue …             ← auth pages
│   └── DashboardView.vue …        ← dashboard, users, profile, logs, demo fields
│
├── features/                       ← ⚠️ domain modules, import eksplisit
│   └── <feature>/
│       ├── <feature>.api.ts        ← fetcher per feature (pakai api-client)
│       ├── <feature>.store.ts      ← Pinia store (state list + pagination + actions)
│       ├── <feature>.schema.ts     ← Zod schemas (FE-only)
│       ├── types.ts
│       └── components/             ← komponen domain-specific (table, form modal, cards)
│   (features saat ini: user, profile, logs)
│
├── components/
│   ├── ui/                         ← shadcn-vue style primitives (Reka UI) — anggap third-party
│   ├── fields/                     ← TextField, SelectField, dll (vee-validate `useField`)
│   ├── blocks/                     ← organisms: chart, metric-card, breadcrumb
│   └── shell/                      ← AppSidebar, AppHeader, CommandPalette, UserMenu, dll
│
├── composables/                    ← global composables (use-upload)
├── stores/                         ← Pinia global (pinia.ts instance, auth, theme, sidebar, palette, notifications)
├── lib/                            ← ⚠️ import eksplisit
│   ├── api-client.ts               ← apiFetch / apiFetchRaw (fetch wrapper + 401 refresh mutex)
│   ├── utils.ts                    ← `cn()` dll (dibutuhkan shadcn)
│   └── constants.ts
├── i18n/
│   ├── index.ts                    ← createI18n + cookie locale detection
│   └── locales/                    ← en.json, id.json
└── styles/                         ← Tailwind entry (main.css, design tokens @theme)
```

### Auth Flow (cookie-based)

1. **Login** → `POST /auth/login` → access token (JWT, 15m) disimpan **di memori** (Pinia), refresh token di **httpOnly cookie** (7 hari, di-set server).
2. **Boot** (`main.ts`) → `auth.bootstrap()` memanggil `POST /auth/refresh` (credentials: include) **sebelum** router resolve navigasi pertama — guard selalu melihat state auth yang benar saat hard reload.
3. **401 di API call** → `api-client` otomatis refresh sekali (mutex) lalu retry; gagal → `clearSession()`.
4. **Guard** (`router.beforeEach`): `requiresAuth` → redirect `/login?redirect=`, `guestOnly` → `/dashboard`, `meta.roles` tak terpenuhi → `/dashboard`.

### Layer Responsibilities

| Layer                 | Boleh Berisi                 | Boleh Akses                                                    |
| --------------------- | ---------------------------- | -------------------------------------------------------------- |
| `components/ui/`      | Base primitives only         | — (third-party)                                                |
| `components/fields/`  | Form field molecules         | `ui/`, `lib/`                                                  |
| `components/blocks/`  | Complex standalone organisms | `fields/`, `ui/`, `lib/`, `stores/`                            |
| `components/shell/`   | App layout chrome            | `blocks/`, `ui/`, `stores/`, `router`                          |
| `features/<x>/`       | Domain-specific              | `fields/`, `blocks/`, `ui/`, `lib/`, `composables/`, `stores/` |
| `views/` + `layouts/` | Routing & page composition   | Semua                                                          |

## DRY Patterns (FE) — Wajib Diterapkan

### 1. Table per Feature

Table dirender dengan markup `<table>` ber-style konsisten (header uppercase, hover row, pagination bar). Saat pola berulang ≥ 2 kali (Rule of Three) → angkat jadi `<DataTable />` generic di `components/blocks/`; feature cukup definisikan kolom.

### 2. Field Components

`<TextField />`, `<SelectField />`, dst di `components/fields/` — bundling label + input + error message, terintegrasi dengan **vee-validate** (`useField(name)`). Form di feature/view tinggal pakai `useForm({ validationSchema: toTypedSchema(zodSchema) })` lalu pasang field dengan prop `name`.

### 3. Shared Zod Schemas

Schema feature di `features/<x>/<x>.schema.ts` (mis. `user.schema.ts` → `createUserSchema`, `editUserSchema`). Schema primitif lintas feature → angkat ke `lib/`. Zod **hanya** di FE (BE pakai class-validator). Enum di-import dari `@starterkit/shared-types`.

### 4. API Client (fetch wrapper)

Satu modul `lib/api-client.ts`. Bukan axios/ofetch — pakai native `fetch` yang dibungkus:

```ts
// lib/api-client.ts
export async function apiFetch<T>(url, opts?): Promise<T>; // unwrap → data
export async function apiFetchRaw<T>(url, opts?): Promise<ApiResponse<T>>; // dengan meta (pagination)
```

Sudah handle: inject Bearer token dari `auth.store` (via instance `pinia`), auto **401 → refresh → retry** (mutex), dan unwrap `ApiResponse`. Feature `*.api.ts` tinggal panggil `apiFetch`/`apiFetchRaw`, tidak setup ulang.

### 5. Pinia Store per Feature

Pola seragam di `features/<x>/<x>.store.ts`: state list + `meta` pagination + `params`, action `fetchList()`, mutasi (`create`/`update`/`remove`) yang re-fetch list + toast `vue-sonner` sukses/gagal. Debounce search di komponen, bukan di store.

### 6. Error / Empty / Loading State

State loading/error/empty dirender dengan pola yang sama di semua table/page (spinner `Loader2` + pesan + tombol retry). Saat berulang ≥ 2 kali → angkat jadi komponen `blocks/`.

---

## Dependency Rule

```
   views/ + layouts/
          ↓
       features/
          ↓
        blocks/
          ↓
        fields/
          ↓
          ui/

composables/ · lib/ · stores/ · i18n/   (shared, boleh diakses semua layer)

shared-types (@starterkit/shared-types)   ← kontrak tipe BE↔FE
```

> ⚠️ Jika butuh import melawan arah panah → **stop dan refactor**.

---

## Naming Conventions

| Item               | Konvensi                                     | Contoh                                   |
| ------------------ | -------------------------------------------- | ---------------------------------------- |
| File komponen (FE) | `PascalCase.vue`                             | `UserTable.vue`                          |
| Komponen (Vue)     | `PascalCase`                                 | `<UserTable />`                          |
| Composable         | `camelCase` prefix `use`, file `use-x.ts`    | `useUpload`                              |
| Util function      | `camelCase`                                  | `formatCurrency`                         |
| Constant           | `SCREAMING_SNAKE_CASE`                       | `MAX_FILE_SIZE`                          |
| Type/Interface     | `PascalCase`                                 | `UserListParams`                         |
| Folder feature     | `kebab-case`                                 | `user`, `profile`, `logs`                |
| View file          | `PascalCaseView.vue`                         | `views/UsersView.vue`                    |
| Layout             | `PascalCaseLayout.vue`                       | `AuthLayout.vue`, `DashboardLayout.vue`  |
| Store (Pinia)      | `x.store.ts`                                 | `auth.store.ts`                          |
| BE file (NestJS)   | `kebab-case.<type>.ts`                       | `users.service.ts`, `create-user.dto.ts` |
| API endpoint       | `kebab-case`, plural                         | `/api/users/:id`                         |
| Drizzle table      | `camelCase` export, kolom `snake_case` di DB | `users` → kolom `created_at`             |

---

## Environment & Config

- **Single root `.env`** untuk seluruh monorepo (api & web baca dari sini; `drizzle.config.ts` load `../../.env` lalu `.env`).
- **FE:** env yang public **wajib** prefix `VITE_` (mis. `VITE_API_BASE`) agar masuk client bundle — SPA tidak punya server, jadi semua env FE bersifat public; jangan taruh secret di FE.
- **BE (NestJS):** validasi env saat startup dengan **class-validator** (`config/env.validation.ts`) — bukan Zod. Akses via `ConfigService`, bukan `process.env` langsung di luar `config/`.
- Gunakan **`.env`** untuk secrets, **`.env.example`** untuk template.
- `DATABASE_URL` dipakai Drizzle (`drizzle-kit` & runtime). Port app (`4400` api, `4301` web) configurable via `.env`.

---

## Git Workflow

- **Branch:** `main` (prod) ← `develop` (staging) ← `feature/*`, `fix/*`, `chore/*`
- **Commit:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`), divalidasi **Commitlint** + **Husky**
- **Pre-commit:** `lint-staged` jalankan Prettier pada file staged
- **PR:** Wajib review minimal 1 reviewer, CI hijau, squash/rebase (no merge commit)

---

## DRY Checklist (FE)

Sebelum commit, tanya:

- [ ] Ada `<input>` + label + error ditulis manual berulang? → pakai `components/fields/` (vee-validate)
- [ ] Ada validasi muncul di > 2 form? → angkat ke `lib/` schema
- [ ] Ada `fetch`/axios di-setup ulang per feature? → pakai `apiFetch` dari `lib/api-client.ts`
- [ ] Ada pola fetch-list + pagination yang sama? → ikuti pola Pinia feature store (fetchList + re-fetch + toast)
- [ ] State empty/error/loading di-render beda-beda? → samakan polanya (angkat ke `blocks/` saat ≥ 2 kali)
- [ ] `features/<a>` import dari `features/<b>`? → angkat ke `components/`, `composables/`, atau `lib/`
- [ ] Tipe response/enum diketik ulang? → import dari `@starterkit/shared-types`

---

## Prinsip DRY — Rule of Three

1. **Pertama kali** ditulis: biarkan inline
2. **Kedua kali** ditulis: tandai, mulai pikirkan abstraksi
3. **Ketiga kali** ditulis: **wajib** angkat jadi shared (base class, util, hook, atau komponen)

> Tapi jangan over-abstract terlalu dini. Premature abstraction sama buruknya dengan duplikasi.
> </content>
> </invoke>
