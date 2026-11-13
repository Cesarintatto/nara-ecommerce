// /backend/src/services/storage.service.ts
// Imágenes en Google Cloud Storage.
//
// Cada imagen subida desde el admin se normaliza (orientación EXIF y tamaño
// máximo según su uso) y se convierte a WebP antes de guardarse en GCS_BUCKET:
//   banners/<uuid>.webp   → carrusel del home (hasta 2400 px de ancho)
//   sections/<uuid>.webp  → portadas de sección
//   products/<uuid>.webp  → fotos de producto
// Devuelve la URL pública que se guarda en la base de datos.
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

export const UPLOAD_FOLDERS = ['banners', 'sections', 'products'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const MAX_SIZE: Record<UploadFolder, { width: number; height: number }> = {
  banners: { width: 2400, height: 1600 },
  sections: { width: 1600, height: 1600 },
  products: { width: 1600, height: 2000 },
};

const WEBP_QUALITY = 82;

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

function getBucketName(): string {
  const bucket = process.env.GCS_BUCKET?.trim();
  if (!bucket) throw new StorageNotConfiguredError();
  return bucket;
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.GCS_BUCKET?.trim());
}

export async function uploadImage(buffer: Buffer, folder: UploadFolder): Promise<string> {
  const bucketName = getBucketName();
  const { width, height } = MAX_SIZE[folder];

  let webp: Buffer;
  try {
    webp = await sharp(buffer)
      .rotate() // respeta la orientación EXIF de las fotos del celular
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new InvalidImageError();
  }

  const objectName = `${folder}/${randomUUID()}.webp`;

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
