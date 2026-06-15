# syntax=docker/dockerfile:1
# Multi-stage build for @starterkit/api (NestJS + Drizzle on Bun).
# Build context MUST be the repo root: `docker build -f apps/api/Dockerfile .`

# ─────────────────────────────── deps ────────────────────────────────────────
# Cached install from the lockfile. --ignore-scripts skips workspace postinstalls
# that would otherwise run before the shared-types build later in this stage.
# bcrypt ships prebuilt binaries, so it needs no install script.
FROM oven/bun:1.3.14 AS deps
WORKDIR /app
COPY package.json bun.lock turbo.json tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile --ignore-scripts

# ─────────────────────────────── build ───────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
# shared-types first (api imports it), then the API. Drizzle has no codegen step —
# the schema is plain TypeScript compiled with the rest of the source.
RUN bun run --filter @starterkit/shared-types build \
    && bun run --filter @starterkit/api build

# ─────────────────────────────── runtime ─────────────────────────────────────
FROM oven/bun:1.3.14-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/api
# CA roots for TLS connections to managed Postgres/Redis.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# Bun installs per workspace, so copy BOTH the hoisted root node_modules and the
# api's own node_modules (which holds its deps + the `.bin/drizzle-kit` CLI used
# by `db:migrate`).
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages/shared-types/dist /app/packages/shared-types/dist
COPY --from=build /app/packages/shared-types/package.json /app/packages/shared-types/package.json
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/drizzle ./drizzle
COPY --from=build /app/apps/api/drizzle.config.ts ./drizzle.config.ts
# Entrypoint script: apply migrations, then boot (see docker/prod-api.sh). For
# multiple replicas, run the migration as a separate release step instead.
COPY docker/prod-api.sh /app/docker/prod-api.sh
EXPOSE 4400
ENTRYPOINT ["sh", "/app/docker/prod-api.sh"]
