#!/bin/sh
set -e

cd /app/backend

# En Cloud Run las migraciones corren aparte, vía el Job "${SERVICE}-migrate"
# (ver cloudbuild.yaml), que fija RUN_MIGRATIONS=false en el servicio web para
# que las instancias no migren por su cuenta. Por defecto queda en "true" para
# que `docker run` local siga funcionando sin pasos extra.
if [ "${RUN_MIGRATIONS:-true}" = "true" ] && [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Aplicando migraciones..."
  /app/node_modules/.bin/prisma migrate deploy
fi

echo "[entrypoint] Iniciando API en puerto ${PORT:-8080}..."
exec node dist/server.js
