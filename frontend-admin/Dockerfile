# Build desde la raíz del monorepo:
#   docker build -f frontend-admin/Dockerfile \
#     --build-arg VITE_API_URL=https://api.tudominio.com \
#     -t nara-admin .
#
# Cloud Run (ejemplo):
#   gcloud run deploy nara-admin --image REGION-docker.pkg.dev/PROJECT/nara/nara-admin --port 8080

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend-admin/package.json ./frontend-admin/
RUN npm ci -w frontend-admin

COPY frontend-admin ./frontend-admin/

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/frontend-admin
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY frontend-admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend-admin/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
