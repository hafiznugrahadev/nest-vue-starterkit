#!/bin/sh
# Dev entrypoint for the web container (source is bind-mounted at /app).
# --ignore-scripts skips workspace postinstalls that would run before
# shared-types is built and hang the install.
set -e

echo "› Installing dependencies…"
bun install --frozen-lockfile --ignore-scripts

echo "› Building @starterkit/shared-types…"
bun run --filter @starterkit/shared-types build

echo "› Starting web (Vite HMR)…"
exec bun run --filter @starterkit/web dev
