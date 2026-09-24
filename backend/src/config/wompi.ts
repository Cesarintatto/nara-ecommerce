// /backend/src/config/wompi.ts
// Integración con Wompi (Bancolombia) vía API REST — sin SDK.
// Docs: https://docs.wompi.co/docs/colombia/widget-checkout-web/
//       https://docs.wompi.co/docs/colombia/eventos/
import crypto from 'crypto';

export const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';
export const WOMPI_CURRENCY = 'COP';

// Se leen en cada llamada (no al cargar el módulo) para no depender del
// orden en que se importa dotenv.
const env = () => ({
  publicKey: process.env.WOMPI_PUBLIC_KEY || '',
  integritySecret: process.env.WOMPI_INTEGRITY_SECRET || '',
  eventsSecret: process.env.WOMPI_EVENTS_SECRET || '',
});

export const isWompiConfigured = (): boolean => {
  const { publicKey, integritySecret, eventsSecret } = env();
  return Boolean(publicKey && integritySecret && eventsSecret);
};

// Las llaves de pruebas empiezan por pub_test_ y las de producción por
// pub_prod_: con eso sabemos contra qué ambiente consultar la API.
export const wompiApiBaseUrl = (): string =>
  env().publicKey.startsWith('pub_prod_')
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';

const sha256 = (value: string) => crypto.createHash('sha256').update(value, 'utf8').digest('hex');

/**
 * Firma de integridad del Web Checkout:
 * SHA256("<reference><amountInCents><currency>[<expirationTime>]<integritySecret>")
 */
export const buildIntegritySignature = (
  reference: string,
  amountInCents: number,
  currency: string,
  expirationTime: string | null,
  integritySecret: string,
): string => sha256(`${reference}${amountInCents}${currency}${expirationTime ?? ''}${integritySecret}`);

interface CheckoutUrlParams {
  reference: string;
  amountInCents: number;
  expiresAt: Date;
  redirectUrl: string;
  customerEmail: string;
  customerName: string;
}

/**
 * Arma la URL del Web Checkout (formulario GET) con la firma de integridad.
 * El expiration-time coincide con el TTL de la reserva de stock: pasado ese
 * momento Wompi ya no deja pagar, así nunca se cobra una reserva liberada.
 */
export const buildCheckoutUrl = (p: CheckoutUrlParams): string => {
  const { publicKey, integritySecret } = env();
  const expirationTime = p.expiresAt.toISOString();

  const params = new URLSearchParams({
    'public-key': publicKey,
    currency: WOMPI_CURRENCY,
    'amount-in-cents': String(p.amountInCents),
    reference: p.reference,
    'signature:integrity': buildIntegritySignature(
      p.reference,
      p.amountInCents,
      WOMPI_CURRENCY,
      expirationTime,
      integritySecret,
    ),
    'expiration-time': expirationTime,
    'redirect-url': p.redirectUrl,
    'customer-data:email': p.customerEmail,
    'customer-data:full-name': p.customerName,
  });

  return `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
};

/** Lee una ruta tipo "transaction.amount_in_cents" dentro de event.data */
const readPath = (data: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>(
    (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
    data,
  );

export interface WompiEvent {
  event?: string;
  data?: {
    transaction?: {
      id?: string;
      status?: string;
      reference?: string;
      amount_in_cents?: number;
      currency?: string;
    };
  };
  environment?: string;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
}

/**
 * Checksum de eventos:
 * SHA256(<valores de signature.properties, en orden><timestamp><eventsSecret>)
 * Se compara en tiempo constante contra signature.checksum (o el header
 * X-Event-Checksum, que trae el mismo valor).
 */
export const verifyEventChecksum = (body: WompiEvent, headerChecksum?: string): boolean => {
  const { eventsSecret } = env();
  const properties = body?.signature?.properties;
  const received = (body?.signature?.checksum || headerChecksum || '').toLowerCase();

  if (!eventsSecret || !Array.isArray(properties) || properties.length === 0) return false;
  if (typeof body.timestamp !== 'number' || !/^[a-f0-9]{64}$/.test(received)) return false;

  const concatenated = properties.map((prop) => String(readPath(body.data, prop) ?? '')).join('');
  const expected = sha256(`${concatenated}${body.timestamp}${eventsSecret}`);

  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
};

/**
 * Consulta pública de una transacción (no requiere llave privada).
 * Devuelve null si Wompi responde 404.
 */
export const fetchTransaction = async (
  transactionId: string,
): Promise<{ id: string; status: string; reference: string } | null> => {
  const response = await fetch(`${wompiApiBaseUrl()}/transactions/${encodeURIComponent(transactionId)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Wompi respondió ${response.status}`);

  const { data } = (await response.json()) as { data: { id: string; status: string; reference: string } };
  return { id: data.id, status: data.status, reference: data.reference };
};
