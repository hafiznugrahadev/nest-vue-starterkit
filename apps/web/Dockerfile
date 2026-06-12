# syntax=docker/dockerfile:1
# Multi-stage build for @starterkit/web (Vue 3 SPA served as static files by nginx).
# Build context MUST be the repo root: `docker build -f apps/web/Dockerfile .`

# ─────────────────────────────── deps ────────────────────────────────────────
FROM oven/bun:1.3.3 AS deps
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
COPY apps/web ./apps/web
# Bake public env vars into the client bundle at build time.
ARG VITE_API_BASE
ARG VITE_REGISTRATION_ENABLED=false
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_REGISTRATION_ENABLED=${VITE_REGISTRATION_ENABLED}
RUN bun run --filter @starterkit/shared-types build \
    && bun run --filter @starterkit/web build

# ─────────────────────────────── runtime ─────────────────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY docker/nginx/web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 4301
CMD ["nginx", "-g", "daemon off;"]
