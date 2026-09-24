// /backend/src/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import { isWompiConfigured, verifyEventChecksum, WompiEvent } from '../config/wompi';
import { OrderService } from '../services/order.service';
import { StockService } from '../services/stock.service';

/**
 * Eventos de Wompi. Wompi reintenta (30 min, 3 h y 24 h) cuando la respuesta
 * no es 200, así que solo se responde distinto de 200 cuando un reintento
 * puede servir (error interno) o la firma no es válida.
 */
export const handleWompiWebhook = async (req: Request, res: Response) => {
  if (!isWompiConfigured()) {
    console.error('[Webhook Wompi] Wompi no está configurado en el servidor');
    return res.status(503).send('Not configured');
  }

  const body = req.body as WompiEvent;

  if (!verifyEventChecksum(body, req.header('x-event-checksum'))) {
    console.warn('[Webhook Wompi] Evento con firma inválida, se descarta');
    return res.status(401).send('Invalid signature');
  }

  const transaction = body.data?.transaction;
  if (body.event !== 'transaction.updated' || !transaction?.id || !transaction.reference) {
    return res.status(200).send('OK');
  }

  try {
    switch (transaction.status) {
      case 'APPROVED':
        console.log(`[Webhook Wompi] Pago aprobado: ${transaction.reference} (tx ${transaction.id})`);
        await OrderService.finalizeOrder(
          transaction.reference,
          transaction.id,
          Number(transaction.amount_in_cents),
          transaction.currency || '',
        );
        break;

      case 'DECLINED':
      case 'VOIDED':
      case 'ERROR':
        console.log(`[Webhook Wompi] Pago ${transaction.status}: ${transaction.reference}, liberando reserva`);
        await StockService.releaseCheckout(transaction.reference);
        break;

      default:
        // PENDING u otros estados intermedios: se espera el evento final.
        break;
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('[Webhook Wompi Error]', error);
    res.status(500).send('Internal Server Error');
  }
};
