# Build desde la raíz del monorepo:
#   docker build -f backend/Dockerfile -t nara-api .
#
# Cloud Run (ejemplo):
#   gcloud run deploy nara-api --image REGION-docker.pkg.dev/PROJECT/nara/nara-api --port 8080

FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# --- Dependencias ---
FROM base AS deps
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci -w backend

# --- Build TypeScript + Prisma Client ---
FROM deps AS builder
COPY backend/prisma ./backend/prisma/
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src/
WORKDIR /app/backend
RUN npm run build

# --- Imagen de producción ---
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh

RUN npm ci -w backend --omit=dev --ignore-scripts \
  && chmod +x ./backend/docker-entrypoint.sh

COPY --from=builder /app/backend/dist ./backend/dist/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

WORKDIR /app/backend

EXPOSE 8080

USER node

ENTRYPOINT ["./docker-entrypoint.sh"]
