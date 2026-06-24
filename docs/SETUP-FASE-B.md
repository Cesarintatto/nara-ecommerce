# Fase B — Base de datos y backend NARA

Sigue estos pasos **en orden**. Cuando termines cada bloque, avísame y validamos juntos.

---

## Bloque 1 — Instalar PostgreSQL (solo una vez)

### Opción A: Instalador oficial (recomendado en Windows)

1. Descarga PostgreSQL desde https://www.postgresql.org/download/windows/
2. Instala con el asistente y **anota la contraseña del usuario `postgres`**.
3. Deja el puerto por defecto: **5432**.

### Opción B: Docker (si ya usas Docker)

```powershell
docker run --name nara-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nara_db -p 5432:5432 -d postgres:16
```

Con Docker, tu `DATABASE_URL` sería:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nara_db"
```

---

## Bloque 2 — Crear la base de datos `nara_db`

### Con pgAdmin o DBeaver

1. Conéctate al servidor local (usuario `postgres`).
2. Crea una base de datos llamada **`nara_db`**.

### Con línea de comandos (psql)

```powershell
psql -U postgres -h localhost
```

Dentro de psql:

```sql
CREATE DATABASE nara_db;
\q
```

---

## Bloque 3 — Configurar `backend/.env`

1. Copia el ejemplo:

```powershell
cd backend
copy .env.example .env
```

2. Edita `backend/.env` y pon **tu contraseña real** en `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/nara_db"
JWT_SECRET=un_secreto_largo_minimo_32_caracteres_dev
```

3. Las URLs locales ya vienen bien para desarrollo; no las cambies salvo que uses otros puertos.

> **Importante:** No subas `.env` a Git. Solo `.env.example`.

---

## Bloque 4 — Migraciones y datos de prueba

Desde la carpeta `backend`:

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

| Comando | Qué hace |
|---------|----------|
| `db:generate` | Genera el cliente Prisma |
| `db:migrate` | Crea las tablas en PostgreSQL |
| `db:seed` | Usuario admin + productos de ejemplo |

### Credenciales admin por defecto (tras el seed)

| Campo | Valor |
|-------|--------|
| Email | `admin@nara.com` |
| Contraseña | `admin123` |

(Puedes cambiarlas en `.env` con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` antes del seed.)

---

## Bloque 5 — Levantar el backend

```powershell
cd backend
npm run dev
```

Deberías ver:

```
[NARA API] Escuchando en http://localhost:3000
```

### Comprobar que todo está bien

Abre en el navegador o con curl:

- http://localhost:3000/api/v1/health → debe decir `"database": "connected"`
- http://localhost:3000/api/v1/products → lista de productos JSON

---

## Bloque 6 — Frontends

### Admin (login real)

```powershell
cd frontend-admin
copy .env.example .env
npm run dev
```

Entra en http://localhost:5174/login con `admin@nara.com` / `admin123`.

### User (landing)

```powershell
cd frontend-user
npm run dev
```

http://localhost:5173 — landing NARA (sin API aún).

---

## Bloque 7 — Servicios externos (opcional, más adelante)

| Servicio | Variable | Cuándo lo necesitas |
|----------|----------|---------------------|
| Mercado Pago | `MP_ACCESS_TOKEN` | Checkout y pagos |
| Brevo | `BREVO_API_KEY` | Emails de confirmación y envío |

Sin estas claves el catálogo, login y dashboard **sí funcionan**. Checkout y emails fallarán hasta configurarlos.

---

## Si algo falla

### `Can't reach database server`

- PostgreSQL no está corriendo.
- Contraseña incorrecta en `DATABASE_URL`.
- La BD `nara_db` no existe.

### `P1001` / `ECONNREFUSED`

- Revisa host `localhost` y puerto `5432`.

### `db:migrate` pide nombre de migración

- Escribe `init` cuando Prisma lo pregunte.

### Health dice `"database": "disconnected"`

- El backend arrancó pero no conecta a la BD → revisa Bloque 2 y 3.

---

## Checklist rápido para avisarme

Cuando termines, dime:

- [ ] PostgreSQL instalado y corriendo
- [ ] Base `nara_db` creada
- [ ] `backend/.env` configurado con `DATABASE_URL` y `JWT_SECRET`
- [ ] `npm run db:migrate` y `npm run db:seed` sin errores
- [ ] http://localhost:3000/api/v1/health → `connected`
- [ ] Login admin en http://localhost:5174 funciona

Con eso seguimos con checkout, catálogo en el user y despliegue.
