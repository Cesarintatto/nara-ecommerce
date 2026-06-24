# Build desde la raíz del monorepo:
#   docker build -f frontend-user/Dockerfile \
#     --build-arg VITE_API_URL=https://api.tudominio.com \
#     -t nara-user .
#
# Cloud Run (ejemplo):
#   gcloud run deploy nara-user --image REGION-docker.pkg.dev/PROJECT/nara/nara-user --port 8080

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend-user/package.json ./frontend-user/
RUN npm ci -w frontend-user

COPY frontend-user ./frontend-user/

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/frontend-user
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY frontend-user/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend-user/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
