# Deploy a producción — NARA (naracol.com)

Proyecto GCP: **NARA-ecommerce** (`gen-lang-client-0695806857`, número `1013000463393`), región `southamerica-east1`.
Todo el deploy lo hace `cloudbuild.yaml`: construye las 3 imágenes, corre las migraciones en un Cloud Run Job y despliega API, tienda y admin.

## 1. Antes del deploy (una sola vez)

### Contenido
- [ ] Completar los datos legales en `frontend-user/src/legal/legalInfo.js` (todo lo que dice `[Por definir…]`: documento, dirección, correo, teléfono, envíos, cambios, garantía). En las páginas `/terminos` y `/privacidad` se ven resaltados en amarillo mientras falten.
- [ ] Revisar los textos legales con un abogado o contador (son una base conforme a Ley 1480/2011 y Ley 1581/2012, no asesoría legal).

### Google Cloud
- [ ] Bucket de imágenes `nara-product-images` creado, con lectura pública (`allUsers` → `roles/storage.objectViewer`).
- [ ] Cloud Run puede subir imágenes:
      `gcloud storage buckets add-iam-policy-binding gs://nara-product-images --member=serviceAccount:1013000463393-compute@developer.gserviceaccount.com --role=roles/storage.objectCreator`
- [ ] Secretos en Secret Manager (5): `nara-database-url`, `nara-jwt-secret`, `nara-cron-secret`, `nara-wompi-integrity-secret`, `nara-wompi-events-secret` (los de Wompi con valores `prod_…`).
- [ ] La service account `1013000463393-compute@developer.gserviceaccount.com` con `roles/secretmanager.secretAccessor` sobre los 5 secretos.
- [ ] Conocer el nombre de conexión de Cloud SQL (va en `_CLOUD_SQL_INSTANCE`):
      `gcloud sql instances describe nara-db-instance --format="value(connectionName)"`

### Wompi (modo Producción)
- [ ] `_WOMPI_PUBLIC_KEY` en `cloudbuild.yaml` = llave `pub_prod_…` ✅
- [ ] URL de eventos: `https://api.naracol.com/api/v1/webhooks/wompi`
- [ ] Nombre del comercio: **NARA** (hoy aparece "BANCOLOMBIA" en la pantalla de pago).

### Correos (opcional para salir)
- [ ] Crear en Brevo las plantillas 1 (confirmación de compra) y 2 (guía de envío), guardar la API key como secreto `nara-brevo-api-key` y poner `_BREVO_ENABLED: "true"` en `cloudbuild.yaml`. Mientras esté en `"false"`, las compras funcionan pero no se envían correos.

## 2. Subir el código

```bash
git add --renormalize .
git add -A
git commit -m "Nueva landing, imágenes en GCS, categorías, páginas legales y consentimiento"
git push origin main
```

## 3. Ejecutar el deploy

Si hay un trigger de Cloud Build conectado a `main`, el push lo dispara. Si no, desde la raíz del repo:

```bash
gcloud builds submit --config cloudbuild.yaml --project gen-lang-client-0695806857 \
  --substitutions=_CLOUD_SQL_INSTANCE="PROYECTO:REGION:INSTANCIA"
```

El pipeline corre las migraciones pendientes antes de desplegar:
`20261006120000_catalog_categories` (6 categorías) y `20261006130000_privacy_consent` (registro de autorización de datos).

## 4. Verificación después del deploy

- [ ] `https://api.naracol.com/api/v1/health` responde OK.
- [ ] `https://www.naracol.com` muestra la nueva landing y el aviso de políticas.
- [ ] `/terminos` y `/privacidad` cargan sin textos resaltados en amarillo.
- [ ] Admin: subir una imagen a un producto → aparece en la tienda.
- [ ] Compra real de bajo valor: pagar, volver a `/gracias` (aprobado), ver la orden en el admin con su fecha de aceptación de políticas, y reembolsarla desde el panel de Wompi.
- [ ] En el panel de Wompi, el evento de esa transacción figura entregado (200) al webhook.

## Rollback

Cada servicio de Cloud Run conserva sus revisiones anteriores: en la consola (Cloud Run → servicio → Revisiones) se puede devolver el 100 % del tráfico a la revisión previa. Las migraciones de esta entrega solo agregan datos/columnas, así que la versión anterior sigue funcionando con la base migrada.
