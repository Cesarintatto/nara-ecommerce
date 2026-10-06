// /backend/src/services/storage.service.ts
// Imágenes de productos en Google Cloud Storage.
//
// Cada imagen subida desde el admin se normaliza (orientación, máx. 1600×2000)
// y se convierte a WebP antes de guardarse en el bucket GCS_BUCKET, en la
// carpeta de su categoría: products/<categoria>/<uuid>.webp (p. ej.
// products/blusas/…). Devuelve la URL pública que se guarda en Product.images.
//
// Credenciales:
//   - Cloud Run: la service account del servicio (Application Default
//     Credentials). Necesita roles/storage.objectCreator sobre el bucket.
//   - Local: `gcloud auth application-default login`, o la variable
//     GOOGLE_APPLICATION_CREDENTIALS apuntando a un JSON de service account.
import { randomUUID } from 'crypto';
import { Storage } from '@google-cloud/storage';
import sharp from 'sharp';

const storage = new Storage();

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('GCS_BUCKET no está configurado en el servidor');
  }
}

export class InvalidImageError extends Error {
  constructor() {
    super('El archivo no es una imagen válida');
  }
}

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 2000;
const WEBP_QUALITY = 82;

function getBucketName(): string {
  const bucket = process.env.GCS_BUCKET?.trim();
  if (!bucket) throw new StorageNotConfiguredError();
  return bucket;
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.GCS_BUCKET?.trim());
}

// "Bodys" → "bodys", "Pantalones" → "pantalones"; sin categoría → "sin-categoria"
export function categoryFolder(categoryName?: string | null): string {
  const slug = (categoryName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'sin-categoria';
}

export async function uploadProductImage(buffer: Buffer, categoryName?: string | null): Promise<string> {
  const bucketName = getBucketName();

  let webp: Buffer;
  try {
    webp = await sharp(buffer)
      .rotate() // respeta la orientación EXIF de las fotos del celular
      .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new InvalidImageError();
  }

  const objectName = `products/${categoryFolder(categoryName)}/${randomUUID()}.webp`;

  await storage
    .bucket(bucketName)
    .file(objectName)
    .save(webp, {
      resumable: false,
      contentType: 'image/webp',
      metadata: {
        // El nombre es único (uuid), así que el navegador puede guardarla en caché para siempre
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

  return `https://storage.googleapis.com/${bucketName}/${objectName}`;
}
