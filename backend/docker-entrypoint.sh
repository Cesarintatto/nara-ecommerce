#!/bin/sh
set -e

cd /app/backend

if [ "${RUN_MIGRATIONS:-true}" = "true" ] && [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Aplicando migraciones..."
  /app/node_modules/.bin/prisma migrate deploy
fi

echo "[entrypoint] Iniciando API en puerto ${PORT:-8080}..."
exec node dist/server.js
