// /backend/src/config/sdks.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';
import * as SibApiV3Sdk from '@getbrevo/brevo';

// Mercado Pago Init
export const mpClient = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

// Brevo Init (Correos Transaccionales)
export const brevoEmailInstance = new SibApiV3Sdk.TransactionalEmailsApi();
brevoEmailInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

// Función base para enviar correos (Post-venta)
export const sendNaraEmail = async (to: string, templateId: number, params: object) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.templateId = templateId;
  sendSmtpEmail.params = params;
  return brevoEmailInstance.sendTransacEmail(sendSmtpEmail);
};