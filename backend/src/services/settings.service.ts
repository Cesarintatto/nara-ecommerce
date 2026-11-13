// Ajustes del sitio guardados como clave/valor. Solo se aceptan las claves conocidas.
import { prisma } from '../lib/prisma';
import { ValidationError } from '../lib/validation';

export const SETTING_DEFAULTS = {
  whatsappNumber: '573054050812', // Solo dígitos, con indicativo de país (wa.me)
  whatsappMessage: 'Hola Naracol, quiero hacer un pedido.',
  instagramUrl: 'https://www.instagram.com/somosnaracol',
  tiktokUrl: 'https://www.tiktok.com/@somosnaracol',
  facebookUrl: 'https://www.facebook.com/somosnaracol',
  contactEmail: '',
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

const KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany({ where: { key: { in: KEYS } } });
  const result: Settings = { ...SETTING_DEFAULTS };
  for (const row of rows) result[row.key as SettingKey] = row.value;
  return result;
}

export async function updateSettings(input: Record<string, unknown>): Promise<Settings> {
  const updates: [SettingKey, string][] = [];
  for (const [key, raw] of Object.entries(input)) {
    if (!KEYS.includes(key as SettingKey)) throw new ValidationError(`Ajuste desconocido: "${key}"`);
    if (typeof raw !== 'string') throw new ValidationError(`"${key}" debe ser texto`);
    let value = raw.trim();
    if (key === 'whatsappNumber') {
      value = value.replace(/\D/g, '');
      if (value.length < 10 || value.length > 15) {
        throw new ValidationError('El WhatsApp debe incluir el indicativo del país, p. ej. 573054050812');
      }
    }
    if (key.endsWith('Url') && value && !/^https?:\/\//.test(value)) {
      throw new ValidationError(`"${key}" debe empezar por https://`);
    }
    if (value.length > 500) throw new ValidationError(`"${key}" es demasiado largo`);
    updates.push([key as SettingKey, value]);
  }

  await prisma.$transaction(
    updates.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
  return getSettings();
}
