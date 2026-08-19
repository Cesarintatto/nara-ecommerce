// /backend/src/controllers/checkout.controller.ts
import { Request, Response } from 'express';
import { Preference } from 'mercadopago';
import { Prisma } from '@prisma/client';
import { mpClient } from '../config/sdks';
import { prisma } from '../lib/prisma';
import { StockService, InsufficientStockError, CartItemInput } from '../services/stock.service';

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
  const { items, customerEmail, customerName, shippingAddress } = req.body as Partial<CheckoutBody>;

  const validationError = validateBody({ items, customerEmail, customerName, shippingAddress });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    // 1. Traer los productos reales (precio y nombre actuales, no lo que
    // mande el cliente) para armar la preferencia de Mercado Pago.
    const productIds = [...new Set(items!.map((item) => item.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const missingId = productIds.find((id) => !productMap.has(id));
    if (missingId) {
      return res.status(400).json({ error: `Producto no encontrado: ${missingId}` });
    }

    // 2. Crear la preferencia en Mercado Pago con los items reales
    const preference = new Preference(mpClient);
    const mpResponse = await preference.create({
      body: {
        items: items!.map((item) => {
          const product = productMap.get(item.productId)!;
          return {
            id: product.id,
            title: product.name,
            quantity: item.quantity,
            unit_price: Number(product.basePrice),
            currency_id: 'COP',
          };
        }),
        notification_url: `${process.env.BACKEND_URL}/api/v1/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.CLIENT_URL}/gracias`,
          failure: `${process.env.CLIENT_URL}/carrito`,
        },
      },
    });

    // 3. Reservar stock de todos los items bajo un mismo Checkout
    await StockService.createCheckoutReservation(
      items!,
      mpResponse.id!,
      customerEmail!,
      customerName!,
      shippingAddress!,
    );

    res.status(201).json({
      checkoutUrl: mpResponse.init_point, // URL de Checkout Pro
      preferenceId: mpResponse.id,
    });
  } catch (error: any) {
    if (error instanceof InsufficientStockError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};
