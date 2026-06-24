// /backend/src/controllers/checkout.controller.ts
import { Request, Response } from 'express';
import { StockService } from '../services/stock.service';
import { mpClient } from '../config/sdks';
import { Preference } from 'mercadopago';

export const createCheckout = async (req: Request, res: Response) => {
  const { productId, quantity, customerEmail } = req.body;

  try {
    // 1. Crear la preferencia en Mercado Pago
    const preference = new Preference(mpClient);
    const mpResponse = await preference.create({
      body: {
        items: [{
          id: productId,
          title: "Prenda NARA Mid-Size",
          quantity: quantity,
          unit_price: 189000, // En producción viene de la DB
          currency_id: "COP"
        }],
        notification_url: `${process.env.BACKEND_URL}/api/v1/webhooks/mercadopago`,
        back_urls: {
          success: `${process.env.CLIENT_URL}/gracias`,
          failure: `${process.env.CLIENT_URL}/carrito`
        }
      }
    });

    // 2. Ejecutar la reserva de Stock con el ID de la preferencia
    await StockService.createReservation(productId, quantity, mpResponse.id!);

    res.status(201).json({
      checkoutUrl: mpResponse.init_point, // URL de Checkout Pro
      preferenceId: mpResponse.id
    });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};