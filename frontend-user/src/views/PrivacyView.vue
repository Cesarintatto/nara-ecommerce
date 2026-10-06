<script setup>
import LegalLayout from '../components/legal/LegalLayout.vue'
import LegalField from '../components/legal/LegalField.vue'
import { LEGAL, POLICY_EFFECTIVE_DATE } from '../legal/legalInfo'
import { useMeta } from '../composables/useMeta'

useMeta(() => ({
  title: 'Política de tratamiento de datos',
  description: 'Cómo NARA recolecta, usa y protege tus datos personales, conforme a la Ley 1581 de 2012.',
  path: '/privacidad',
}))

const sections = [
  { id: 'responsable', title: 'Responsable' },
  { id: 'marco', title: 'Marco legal' },
  { id: 'datos', title: 'Datos que tratamos' },
  { id: 'finalidades', title: 'Para qué los usamos' },
  { id: 'autorizacion', title: 'Autorización' },
  { id: 'terceros', title: 'Con quién los compartimos' },
  { id: 'derechos', title: 'Tus derechos' },
  { id: 'procedimiento', title: 'Consultas y reclamos' },
  { id: 'navegacion', title: 'Almacenamiento en tu navegador' },
  { id: 'seguridad', title: 'Seguridad' },
  { id: 'menores', title: 'Menores de edad' },
  { id: 'vigencia', title: 'Vigencia' },
]
</script>

<template>
  <LegalLayout
    title="Política de tratamiento de datos personales"
    :effective-date="POLICY_EFFECTIVE_DATE"
    :sections="sections"
  >
    <h2 id="responsable">1. Responsable del tratamiento</h2>
    <p>
      <strong><LegalField :value="LEGAL.responsibleName" /></strong>, identificado(a) con
      <LegalField :value="LEGAL.responsibleIdType" /> <LegalField :value="LEGAL.responsibleId" />, quien opera
      la marca <strong>{{ LEGAL.brand }}</strong> y la tienda {{ LEGAL.website }}.
    </p>
    <ul>
      <li>Dirección: <LegalField :value="LEGAL.address" />, <LegalField :value="LEGAL.city" /></li>
      <li>Correo para temas de datos personales: <LegalField :value="LEGAL.email" /></li>
      <li>Teléfono: <LegalField :value="LEGAL.phone" /></li>
    </ul>

    <h2 id="marco">2. Marco legal</h2>
    <p>
      Esta política cumple la Ley Estatutaria 1581 de 2012 de protección de datos personales, el Decreto
      1377 de 2013 (compilado en el Decreto Único Reglamentario 1074 de 2015) y demás normas que los
      modifiquen o complementen. Tratamos tus datos con base en los principios de legalidad, finalidad,
      libertad, veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad.
    </p>

    <h2 id="datos">3. Datos que tratamos</h2>
    <p>Solo pedimos lo necesario para venderte y entregarte tus prendas:</p>
    <ul>
      <li><strong>Identificación y contacto:</strong> nombre completo, correo electrónico y teléfono.</li>
      <li><strong>Entrega:</strong> dirección, ciudad y departamento.</li>
      <li>
        <strong>Compra:</strong> prendas compradas, valor, fecha, referencia y estado del pago, y número
        de guía del envío.
      </li>
      <li>
        <strong>Autorización:</strong> fecha en que aceptaste esta política y la versión aceptada, como
        prueba de tu autorización.
      </li>
    </ul>
    <p>
      <strong>No recibimos ni guardamos los datos de tu tarjeta o cuenta bancaria:</strong> esos datos
      los ingresas directamente en la plataforma de Wompi. Tampoco guardamos las medidas que escribes en
      el asistente de tallas: el cálculo se hace en tu propio navegador.
    </p>
    <p>No recolectamos datos sensibles (como datos de salud, origen étnico u orientación política).</p>

    <h2 id="finalidades">4. Para qué usamos tus datos</h2>
    <ul>
      <li>Procesar tu compra, confirmar el pago y enviarte la confirmación del pedido.</li>
      <li>Despachar y entregar tus prendas, y enviarte el número de guía.</li>
      <li>Atender tus solicitudes de cambio, retracto, garantía, reversión del pago y PQR.</li>
      <li>Cumplir nuestras obligaciones legales, contables y tributarias.</li>
      <li>Prevenir fraudes y mantener la seguridad de la tienda.</li>
      <li>
        Enviarte novedades y promociones de NARA, solo si lo autorizas de forma expresa. Puedes dejar
        de recibirlas en cualquier momento.
      </li>
    </ul>
    <p>Si en el futuro queremos usar tus datos para otra finalidad, te pediremos una nueva autorización.</p>

    <h2 id="autorizacion">5. Autorización</h2>
    <p>
      Antes de pagar, te pedimos marcar una casilla para autorizar el tratamiento de tus datos según
      esta política. Esa autorización es previa, expresa e informada, y guardamos la fecha y la versión
      aceptada como prueba. Puedes revocarla o pedir la supresión de tus datos en cualquier momento,
      salvo cuando tengamos el deber legal o contractual de conservarlos (por ejemplo, los registros
      contables de una compra).
    </p>

    <h2 id="terceros">6. Con quién compartimos tus datos</h2>
    <p>
      No vendemos ni alquilamos tus datos. Solo los compartimos con proveedores que nos ayudan a
      prestarte el servicio, que actúan como encargados del tratamiento y deben protegerlos:
    </p>
    <ul>
      <li><strong>Wompi (Bancolombia):</strong> procesamiento de pagos.</li>
      <li><strong>Empresas transportadoras:</strong> entrega de pedidos (nombre, teléfono y dirección).</li>
      <li>
        <strong>Google Cloud:</strong> alojamiento del sitio y de la base de datos, en servidores ubicados
        en Brasil.
      </li>
      <li><strong>Brevo:</strong> envío de correos de confirmación y seguimiento del pedido.</li>
    </ul>
    <p>
      Algunos de estos proveedores almacenan información fuera de Colombia. Al aceptar esta política
      autorizas esa transmisión internacional, que se hace con proveedores que cuentan con medidas de
      seguridad adecuadas y únicamente para las finalidades aquí descritas. También entregaremos datos a
      autoridades cuando una norma o una orden judicial lo exija.
    </p>

    <h2 id="derechos">7. Tus derechos</h2>
    <p>Como titular de los datos, según el artículo 8 de la Ley 1581 de 2012, tienes derecho a:</p>
    <ul>
      <li>Conocer, actualizar y rectificar tus datos.</li>
      <li>Solicitar prueba de la autorización que nos diste.</li>
      <li>Ser informada sobre el uso que les damos.</li>
      <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
      <li>Revocar la autorización y pedir la supresión de tus datos cuando no exista un deber legal de conservarlos.</li>
      <li>Acceder gratuitamente a tus datos personales.</li>
    </ul>

    <h2 id="procedimiento">8. Cómo hacer consultas y reclamos</h2>
    <p>
      Escríbenos a <LegalField :value="LEGAL.email" /> indicando tu nombre, el correo con el que
      compraste, tu solicitud y cómo quieres recibir la respuesta.
    </p>
    <ul>
      <li>
        <strong>Consultas</strong> (conocer qué datos tenemos y cómo los usamos): respondemos en máximo
        diez (10) días hábiles. Si necesitamos más tiempo, te avisaremos y responderemos dentro de los
        cinco (5) días hábiles siguientes.
      </li>
      <li>
        <strong>Reclamos</strong> (corregir, actualizar, suprimir datos o revocar la autorización):
        respondemos en máximo quince (15) días hábiles, prorrogables hasta por ocho (8) días hábiles
        más, avisándote el motivo. Si el reclamo está incompleto, te pediremos completarlo dentro de los
        cinco (5) días siguientes; si pasan dos (2) meses sin respuesta, se entenderá que desististe.
      </li>
    </ul>
    <p>
      Solo podrás acudir a la SIC después de haber agotado este trámite con nosotros (artículo 16 de la
      Ley 1581 de 2012).
    </p>

    <h2 id="navegacion">9. Almacenamiento en tu navegador</h2>
    <p>
      Usamos el almacenamiento local de tu navegador solo para funciones esenciales: recordar las prendas
      de tu carrito y que ya aceptaste estas políticas. Hoy no usamos cookies de publicidad ni de
      analítica. Si en el futuro las usamos, actualizaremos esta política y te pediremos autorización.
      Puedes borrar estos datos desde la configuración de tu navegador; en ese caso el carrito se vaciará.
    </p>

    <h2 id="seguridad">10. Seguridad</h2>
    <p>
      Protegemos tus datos con medidas técnicas y administrativas razonables: conexión cifrada (HTTPS),
      acceso restringido al panel administrativo, contraseñas y llaves guardadas en sistemas seguros, y
      pagos procesados por una pasarela certificada. Ningún sistema es infalible, pero trabajamos para
      evitar accesos no autorizados, pérdida o uso indebido de tu información.
    </p>

    <h2 id="menores">11. Menores de edad</h2>
    <p>
      La tienda está dirigida a personas mayores de edad. No recolectamos a sabiendas datos de menores de
      18 años.
    </p>

    <h2 id="vigencia">12. Vigencia</h2>
    <p>
      Esta política rige desde el {{ POLICY_EFFECTIVE_DATE }}. Conservaremos tus datos mientras sean
      necesarios para las finalidades descritas y durante el tiempo que exijan las normas contables,
      tributarias y de protección al consumidor. Si modificamos esta política, publicaremos la nueva
      versión en esta página y te la mostraremos de nuevo al ingresar al sitio.
    </p>
  </LegalLayout>
</template>
