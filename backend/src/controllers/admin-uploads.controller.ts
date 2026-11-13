import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  uploadImage as uploadToStorage,
  isStorageConfigured,
  StorageNotConfiguredError,
  InvalidImageError,
  UPLOAD_FOLDERS,
  UploadFolder,
} from '../services/storage.service';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB (fotos del celular)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  },
});

// Recibe el campo "image" (multipart/form-data) y traduce los errores de multer a 400.
export const receiveImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen supera los 15 MB'
          : 'Sube una sola imagen JPG, PNG o WebP en el campo "image"';
      return res.status(400).json({ error: message });
    }
    return next(err);
  });
};

// Campo opcional "folder": banners | sections | products (define la carpeta y el tamaño máximo)
export const uploadImage = async (req: Request, res: Response) => {
  if (!isStorageConfigured()) {
    return res.status(503).json({ error: 'El almacenamiento de imágenes no está configurado (GCS_BUCKET)' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Sube una imagen JPG, PNG o WebP en el campo "image"' });
  }

  const rawFolder = typeof req.body?.folder === 'string' ? req.body.folder : 'products';
  if (!UPLOAD_FOLDERS.includes(rawFolder as UploadFolder)) {
    return res.status(400).json({ error: `"folder" debe ser uno de: ${UPLOAD_FOLDERS.join(', ')}` });
  }

  try {
    const url = await uploadToStorage(req.file.buffer, rawFolder as UploadFolder);
    return res.status(201).json({ url });
  } catch (err) {
    if (err instanceof InvalidImageError) return res.status(400).json({ error: err.message });
    if (err instanceof StorageNotConfiguredError) return res.status(503).json({ error: err.message });
    console.error('[uploads] Error subiendo imagen a GCS:', err);
    const detail =
      process.env.NODE_ENV !== 'production' && err instanceof Error ? ` Detalle: ${err.message}` : '';
    return res.status(500).json({ error: `No se pudo subir la imagen. Revisa el bucket y sus permisos.${detail}` });
  }
};
