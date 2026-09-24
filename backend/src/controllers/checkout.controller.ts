// /backend/src/controllers/checkout.controller.ts
import crypto from 'crypto';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { StockService, InsufficientStockError, CartItemInput } from '../services/stock.service';
import { buildCheckoutUrl, fetchTransaction, isWompiConfigured } from '../config/wompi';

interface CheckoutBody {
  items: CartItemInput[];
  customerEmail: string;
  customerName: string;
  shippingAddress: Prisma.InputJsonValue;
}

const validateBody = (body: Partial<CheckoutBody>): string | null => {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return 'El carrito está vacío.';
  }
  for (const item of body.items) {
    if (!item?.productId || typeof item.productId !== 'string') {
      return 'Cada item del carrito necesita un productId válido.';
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return 'La cantidad de cada item debe ser un entero mayor a 0.';
    }
  }
  if (!body.customerEmail || typeof body.customerEmail !== 'string') {
    return 'El email del cliente es obligatorio.';
  }
  if (!body.customerName || typeof body.customerName !== 'string') {
    return 'El nombre del cliente es obligatorio.';
  }
  if (!body.shippingAddress || typeof body.shippingAddress !== 'object') {
    return 'La dirección de envío es obligatoria.';
  }
  return null;
};

export const createCheckout = async (req: Request, res: Response) => {
  if (!isWompiConfigured()) {
    console.error('[Checkout] Faltan WOMPI_PUBLIC_KEY / WOMPI_INTEGRITY_SECRET / WOMPI_EVENTS_SECRET');
    return res.status(503).json({ error: 'Los pagos no están disponibles en este momento.' });
  }

  const { items, customerEmail, customerName, shippingAddress } = req.body as Partial<CheckoutBody>;

  const validationError = validateBody({ items, customerEmail, customerName, shippingAddress });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    // 1. Traer los productos reales: el total se calcula con los precios de
    // la base de datos, nunca con lo que mande el cliente.
    const productIds = [...new Set(items!.map((item) => item.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const missingId = productIds.find((id) => !productMap.has(id));
    if (missingId) {
      return res.status(400).json({ error: `Producto no encontrado: ${missingId}` });
    }

    const total = items!.reduce(
      (sum, item) => sum.add(productMap.get(item.productId)!.basePrice.mul(item.quantity)),
      new Prisma.Decimal(0),
    );
    const amountInCents = total.mul(100).toDecimalPlaces(0).toNumber();

    // 2. Reservar stock (todo o nada) bajo un Checkout identificado por la
    // referencia única que viaja a Wompi.
    const reference = `NARA-${crypto.randomUUID()}`;
    const checkout = await StockService.createCheckoutReservation(
      items!,
      reference,
      amountInCents,
      customerEmail!,
      customerName!,
      shippingAddress!,
    );

    // 3. URL del Web Checkout firmada, que expira junto con la reserva
    const checkoutUrl = buildCheckoutUrl({
      reference,
      amountInCents,
      expiresAt: checkout.expiresAt,
      redirectUrl: `${process.env.CLIENT_URL}/gracias`,
      customerEmail: customerEmail!,
      customerName: customerName!,
    });

    res.status(201).json({ checkoutUrl, reference, expiresAt: checkout.expiresAt });
  } catch (error: any) {
    if (error instanceof InsufficientStockError) {
      return res.status(400).json({ error: error.message });
    }
    console.error('[Checkout Error]', error);
    res.status(500).json({ error: 'No se pudo iniciar el pago.' });
  }
};

/**
 * Estado de una transacción para la página /gracias (Wompi agrega
 * ?id=<transactionId> a la redirect-url). Solo informa: la orden se
 * consolida únicamente desde el webhook firmado.
 */
export const getTransactionStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!/^[A-Za-z0-9-]{1,64}$/.test(id)) {
    return res.status(400).json({ error: 'ID de transacción inválido.' });
  }

  try {
    const transaction = await fetchTransaction(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transacción no encontrada.' });
    }
    res.json({ status: transaction.status, reference: transaction.reference });
  } catch (error) {
    console.error('[Checkout] Error consultando transacción en Wompi:', error);
    res.status(502).json({ error: 'No se pudo consultar el estado del pago.' });
  }
};
