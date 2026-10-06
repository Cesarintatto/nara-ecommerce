// Datos legales de NARA usados en Términos y Condiciones, Política de
// Tratamiento de Datos, footer y aviso de aceptación.
//
// ⚠️ Antes de publicar en producción, reemplaza TODOS los valores que empiezan
// por "[Por definir" (se ven resaltados en las páginas legales).
//
// Si cambias el contenido de las políticas, actualiza POLICY_VERSION: el aviso
// vuelve a aparecer a quienes aceptaron la versión anterior, y cada compra
// guarda en la base de datos la versión que la clienta aceptó.

export const POLICY_VERSION = '2026-10-06'
export const POLICY_EFFECTIVE_DATE = '6 de octubre de 2026'

export const LEGAL = {
  brand: 'NARA',
  website: 'www.naracol.com',

  // Responsable del tratamiento / vendedor (art. 50 Ley 1480 de 2011, art. 13 Decreto 1377 de 2013)
  responsibleName: 'Cesar Cristian Restrepo Piedrahita', // titular registrado en Wompi — confirmar
  responsibleIdType: '[Por definir: CC o NIT]',
  responsibleId: '[Por definir: número de documento]',
  address: '[Por definir: dirección física]',
  city: 'Colombia', // p. ej. 'Medellín, Antioquia'
  email: '[Por definir: correo de atención]',
  phone: '[Por definir: teléfono o WhatsApp]',

  // Condiciones comerciales
  shippingCoverage: 'todo el territorio colombiano',
  shippingCost: '[Por definir: costo del envío o cómo se calcula]',
  shippingTime: '[Por definir: tiempo de entrega, p. ej. 3 a 8 días hábiles]',
  sizeExchange: '[Por definir: política de cambios por talla, p. ej. dentro de los 15 días siguientes a la entrega]',
  warrantyTerm: '[Por definir: término de la garantía, p. ej. 3 meses]',
}

// true si el valor aún es un marcador pendiente (se resalta en pantalla)
export const isPending = (value) => typeof value === 'string' && value.startsWith('[Por definir')
