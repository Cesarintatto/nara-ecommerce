// Validación mínima de entradas del admin. Para PATCH, `undefined` significa
// "no tocar ese campo" (Prisma ignora las claves undefined).

export class ValidationError extends Error {}

const isMissing = (v: unknown) => v === undefined;
const isEmpty = (v: unknown) => v === null || (typeof v === 'string' && v.trim() === '');

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function requiredString(v: unknown, field: string, max = 200): string {
  if (typeof v !== 'string' || v.trim() === '') throw new ValidationError(`"${field}" es obligatorio`);
  if (v.trim().length > max) throw new ValidationError(`"${field}" supera ${max} caracteres`);
  return v.trim();
}

// En creación: string o null. En edición (partial): además undefined = sin cambio.
export function optionalString(v: unknown, field: string, max = 500, partial = false): string | null | undefined {
  if (isMissing(v)) return partial ? undefined : null;
  if (isEmpty(v)) return null;
  if (typeof v !== 'string') throw new ValidationError(`"${field}" debe ser texto`);
  if (v.trim().length > max) throw new ValidationError(`"${field}" supera ${max} caracteres`);
  return v.trim();
}

export function optionalBool(v: unknown, field: string): boolean | undefined {
  if (isMissing(v)) return undefined;
  if (typeof v !== 'boolean') throw new ValidationError(`"${field}" debe ser verdadero o falso`);
  return v;
}

export function optionalInt(v: unknown, field: string, partial = false): number | null | undefined {
  if (isMissing(v)) return partial ? undefined : null;
  if (isEmpty(v)) return null;
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
    throw new ValidationError(`"${field}" debe ser un número entero positivo`);
  }
  return n;
}

export function optionalDate(v: unknown, field: string, partial = false): Date | null | undefined {
  if (isMissing(v)) return partial ? undefined : null;
  if (isEmpty(v)) return null;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) throw new ValidationError(`"${field}" no es una fecha válida`);
  return d;
}

export function hexColor(v: unknown, field = 'hex'): string {
  if (typeof v !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(v.trim())) {
    throw new ValidationError(`"${field}" debe ser un color HEX como #1F3A2E`);
  }
  return v.trim().toUpperCase();
}

export function slugField(v: unknown, fallbackFrom: string | undefined, partial = false): string | undefined {
  if (isMissing(v) || isEmpty(v)) {
    if (partial) return undefined;
    if (!fallbackFrom) throw new ValidationError('"slug" es obligatorio');
    return slugify(fallbackFrom);
  }
  const slug = slugify(String(v));
  if (!slug) throw new ValidationError('"slug" no es válido');
  return slug;
}

export function idList(v: unknown, field: string, partial = false): string[] | undefined {
  if (isMissing(v)) return partial ? undefined : [];
  if (!Array.isArray(v) || v.some((id) => typeof id !== 'string')) {
    throw new ValidationError(`"${field}" debe ser una lista de ids`);
  }
  return [...new Set(v as string[])];
}

export function urlList(v: unknown, field: string, partial = false): string[] | undefined {
  if (isMissing(v)) return partial ? undefined : [];
  if (!Array.isArray(v) || v.some((u) => typeof u !== 'string' || !/^https?:\/\//.test(u))) {
    throw new ValidationError(`"${field}" debe ser una lista de URLs`);
  }
  return v as string[];
}
