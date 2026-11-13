// Datos legales de Naracol Estudio usados en Términos, Política de Tratamiento
// de Datos y el aviso de aceptación.
//
// ⚠️ Antes de publicar, reemplaza TODOS los valores que empiezan por
// "[Por definir" (se ven resaltados en las páginas legales) y haz revisar los
// textos por alguien con conocimiento legal.
//
// Si cambias el contenido de las políticas, actualiza POLICY_VERSION: el aviso
// vuelve a aparecer a quienes aceptaron la versión anterior.

export const POLICY_VERSION = '2026-11-13'
export const POLICY_EFFECTIVE_DATE = '13 de noviembre de 2026'

export const LEGAL = {
  brand: 'Naracol Estudio',
  website: 'www.naracol.com',

  // Responsable del tratamiento / vendedor (art. 50 Ley 1480 de 2011, art. 13 Decreto 1377 de 2013)
  // Se conservan los datos del titular que operaba NARA: confirma que sigan siendo los correctos.
  responsibleName: 'Cesar Cristian Restrepo Piedrahita',
  responsibleIdType: 'C.C.',
  responsibleId: '1037609808',
  address: 'Carrera 99 # 66e - 43 Luna del Viento Ap 606',
  city: '[Por definir: ciudad y departamento]',
  email: '[Por definir: correo de contacto de Naracol]',
  phone: '(+57) 305 405 0812', // WhatsApp de Naracol

  // Condiciones comerciales
  shippingCoverage: 'todo el territorio colombiano',
  productionTime: '[Por definir: tiempo de diseño e impresión, p. ej. 2 a 5 días hábiles]',
  warrantyTerm: '[Por definir: término de garantía, p. ej. tres (3) meses]',
}

// true si el valor aún es un marcador pendiente (se resalta en pantalla)
export const isPending = (value) => typeof value === 'string' && value.startsWith('[Por definir')
