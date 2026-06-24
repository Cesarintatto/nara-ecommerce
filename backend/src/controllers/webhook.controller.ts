// /backend/src/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import { Payment } from 'mercadopago';
import { mpClient } from '../config/sdks';
import { OrderService } from '../services/order.service';

export const handleMPWebhook = async (req: Request, res: Response) => {
  const { query } = req;
  const topic = query.topic || query.type;

  try {
    // Solo procesamos notificaciones de pagos
    if (topic === 'payment') {
      const paymentId = String(query.id || query['data.id']);
      
      // Obtener detalles del pago desde MP
      const payment = await new Payment(mpClient).get({ id: paymentId });

      if (payment.status === 'approved') {
        // preference_id es nuestra llave para encontrar la reserva de stock
        const preferenceId = (payment as { preference_id?: string }).preference_id;
        if (!preferenceId) {
          return res.status(200).send('OK');
        }
        
        console.log(`[Webhook] Pago aprobado para preferencia: ${preferenceId}`);
        await OrderService.finalizeOrder(preferenceId, paymentId);
      }
    }

    // Siempre responder 200 para confirmar recepción a Mercado Pago
    res.status(200).send('OK');
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).send('Internal Server Error');
  }
};