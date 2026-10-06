<script setup>
import LegalLayout from '../components/legal/LegalLayout.vue'
import LegalField from '../components/legal/LegalField.vue'
import { LEGAL, POLICY_EFFECTIVE_DATE } from '../legal/legalInfo'
import { useMeta } from '../composables/useMeta'

useMeta(() => ({
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de compra en NARA: precios, pagos, envíos, derecho de retracto, garantía y reversión del pago.',
  path: '/terminos',
}))

const sections = [
  { id: 'vendedor', title: 'Quién vende' },
  { id: 'aceptacion', title: 'Aceptación' },
  { id: 'productos', title: 'Productos y tallas' },
  { id: 'precios', title: 'Precios' },
  { id: 'compra', title: 'Compra y pago' },
  { id: 'envios', title: 'Envíos y entregas' },
  { id: 'retracto', title: 'Derecho de retracto' },
  { id: 'cambios', title: 'Cambios por talla' },
  { id: 'garantia', title: 'Garantía' },
  { id: 'reversion', title: 'Reversión del pago' },
  { id: 'pqr', title: 'Peticiones, quejas y reclamos' },
  { id: 'propiedad', title: 'Propiedad intelectual' },
  { id: 'datos', title: 'Datos personales' },
  { id: 'ley', title: 'Ley aplicable' },
  { id: 'cambios-terminos', title: 'Cambios a estos términos' },
]
</script>

<template>
  <LegalLayout title="Términos y condiciones" :effective-date="POLICY_EFFECTIVE_DATE" :sections="sections">
    <h2 id="vendedor">1. Quién vende</h2>
    <p>
      La tienda en línea <strong>{{ LEGAL.brand }}</strong> ({{ LEGAL.website }}) es operada por
      <strong><LegalField :value="LEGAL.responsibleName" /></strong>, identificado(a) con
      <LegalField :value="LEGAL.responsibleIdType" /> <LegalField :value="LEGAL.responsibleId" />,
      con domicilio en <LegalField :value="LEGAL.address" />, <LegalField :value="LEGAL.city" />.
    </p>
    <p>
      Puedes escribirnos a <LegalField :value="LEGAL.email" /> o comunicarte al
      <LegalField :value="LEGAL.phone" />.
    </p>

    <h2 id="aceptacion">2. Aceptación</h2>
    <p>
      Estos términos regulan el uso del sitio y las compras que hagas en él, de acuerdo con la
      Ley 1480 de 2011 (Estatuto del Consumidor), la Ley 527 de 1999 (comercio electrónico) y
      demás normas colombianas aplicables. Al navegar el sitio y, en especial, al marcar la casilla de
      aceptación antes de pagar, confirmas que los leíste y los aceptas. Si no estás de acuerdo, te
      pedimos no realizar compras.
    </p>
    <p>Para comprar debes ser mayor de edad y tener capacidad legal para contratar.</p>

    <h2 id="productos">3. Productos y tallas</h2>
    <p>
      Mostramos cada prenda con fotografías reales, su descripción, materiales y precio. Los colores
      pueden variar levemente según la pantalla de tu dispositivo.
    </p>
    <p>
      El asistente de tallas sugiere una talla a partir de las medidas que tú ingresas y de la horma
      de NARA. Es una guía orientativa: si tienes dudas, escríbenos antes de comprar.
    </p>
    <p>
      Las unidades disponibles se muestran en cada producto. Si una prenda se agota mientras
      compras, te avisaremos antes de cobrar.
    </p>

    <h2 id="precios">4. Precios</h2>
    <p>
      Todos los precios están en pesos colombianos (COP) e incluyen los impuestos aplicables. El valor
      total a pagar, con cualquier costo adicional, se muestra antes de confirmar el pago. El precio
      que se cobra es el vigente al momento de la compra.
    </p>
    <p>Costo de envío: <LegalField :value="LEGAL.shippingCost" />.</p>

    <h2 id="compra">5. Compra y pago</h2>
    <ol>
      <li>Agregas las prendas al carrito y completas tus datos de contacto y de envío.</li>
      <li>
        Aceptas estos términos y la
        <router-link to="/privacidad">Política de Tratamiento de Datos</router-link>.
      </li>
      <li>
        Te redirigimos a <strong>Wompi</strong> (Bancolombia), la pasarela de pagos, donde pagas con
        tarjeta, PSE, Nequi, Bancolombia u otros medios disponibles.
      </li>
      <li>Al iniciar el pago, tus prendas quedan apartadas durante 15 minutos.</li>
      <li>Cuando Wompi aprueba el pago, tu pedido queda confirmado y te avisamos por correo.</li>
    </ol>
    <p>
      NARA no recibe ni almacena los datos de tu tarjeta o de tu cuenta bancaria: el pago se procesa
      directamente en la plataforma segura de Wompi. Si el pago es rechazado o no se completa en el
      tiempo indicado, la compra no se realiza y las prendas vuelven a estar disponibles.
    </p>

    <h2 id="envios">6. Envíos y entregas</h2>
    <p>
      Enviamos a {{ LEGAL.shippingCoverage }} a través de empresas transportadoras. El tiempo estimado de
      entrega es: <LegalField :value="LEGAL.shippingTime" />, contado desde la confirmación del pago.
      Cuando despachemos tu pedido te enviaremos el número de guía para que puedas rastrearlo.
    </p>
    <p>
      Es importante que la dirección y el teléfono que registres sean correctos. Si el pedido no
      puede entregarse por datos errados, te contactaremos para coordinar un nuevo envío.
    </p>

    <h2 id="retracto">7. Derecho de retracto</h2>
    <p>
      Como compraste a distancia, tienes derecho a retractarte de la compra dentro de los
      <strong>cinco (5) días hábiles</strong> siguientes a la entrega, según el artículo 47 de la
      Ley 1480 de 2011. Para hacerlo:
    </p>
    <ul>
      <li>Avísanos por escrito a <LegalField :value="LEGAL.email" /> dentro de ese plazo.</li>
      <li>
        Devuelve la prenda por los mismos medios y en las mismas condiciones en que la recibiste: sin
        uso, sin lavar, con etiquetas y empaque.
      </li>
      <li>Los costos de transporte de la devolución corren por tu cuenta.</li>
    </ul>
    <p>
      Te reintegraremos el valor pagado, sin descuentos ni retenciones, a más tardar dentro de los
      treinta (30) días calendario siguientes a tu solicitud.
    </p>
    <p>
      Según la misma norma, el retracto no aplica a bienes de uso personal, como prendas de uso íntimo
      que por razones de higiene no pueden devolverse, ni a prendas hechas según especificaciones del
      cliente.
    </p>

    <h2 id="cambios">8. Cambios por talla</h2>
    <p>
      Además de tus derechos legales, puedes solicitar el cambio de talla de una prenda así:
      <LegalField :value="LEGAL.sizeExchange" />. La prenda debe estar sin uso, sin lavar y con sus
      etiquetas. El cambio está sujeto a disponibilidad de inventario.
    </p>

    <h2 id="garantia">9. Garantía</h2>
    <p>
      Todas nuestras prendas cuentan con la garantía legal de calidad, idoneidad y seguridad de los
      artículos 7 y siguientes de la Ley 1480 de 2011, por un término de
      <LegalField :value="LEGAL.warrantyTerm" /> desde la entrega. Si una prenda presenta un defecto de
      fabricación, escríbenos con fotos del defecto; podremos repararla, cambiarla por otra igual o, si
      no es posible, devolverte el dinero.
    </p>
    <p>
      La garantía no cubre el desgaste normal por uso, ni daños causados por lavado o cuidado distinto
      al indicado en la etiqueta, por accidentes o por modificaciones hechas a la prenda.
    </p>

    <h2 id="reversion">10. Reversión del pago</h2>
    <p>
      De acuerdo con el artículo 51 de la Ley 1480 de 2011 y su reglamentación, puedes solicitar la
      reversión del pago hecho con tarjeta de crédito, débito u otro instrumento electrónico cuando:
      fuiste objeto de fraude, la operación no fue solicitada, no recibiste el producto, o el producto
      no corresponde a lo solicitado o es defectuoso.
    </p>
    <p>
      Para hacerlo, presenta la queja ante nosotros en <LegalField :value="LEGAL.email" /> dentro de los
      <strong>cinco (5) días hábiles</strong> siguientes a la fecha en que conociste la situación (o
      recibiste el producto), y avisa también a la entidad emisora de tu tarjeta o medio de pago. Si la
      reversión procede por producto no recibido, no corresponde o es defectuoso, debes devolvernos el
      producto.
    </p>

    <h2 id="pqr">11. Peticiones, quejas y reclamos</h2>
    <p>
      Puedes enviarnos cualquier petición, queja o reclamo a <LegalField :value="LEGAL.email" /> o al
      <LegalField :value="LEGAL.phone" />. Te responderemos en un plazo máximo de quince (15) días
      hábiles. Si no quedas satisfecha con la respuesta, puedes acudir a la Superintendencia de
      Industria y Comercio (<a href="https://www.sic.gov.co" target="_blank" rel="noopener">www.sic.gov.co</a>).
    </p>

    <h2 id="propiedad">12. Propiedad intelectual</h2>
    <p>
      La marca NARA, el logo, las fotografías, los textos y el diseño de este sitio pertenecen a NARA o
      se usan con autorización. No pueden copiarse, reproducirse ni usarse con fines comerciales sin
      autorización previa y por escrito.
    </p>

    <h2 id="datos">13. Datos personales</h2>
    <p>
      Tratamos tus datos personales según nuestra
      <router-link to="/privacidad">Política de Tratamiento de Datos Personales</router-link>, conforme
      a la Ley 1581 de 2012.
    </p>

    <h2 id="ley">14. Ley aplicable</h2>
    <p>
      Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se
      resolverá ante las autoridades colombianas competentes, sin perjuicio de tu derecho a acudir a la
      Superintendencia de Industria y Comercio en su calidad de autoridad de protección al consumidor.
    </p>

    <h2 id="cambios-terminos">15. Cambios a estos términos</h2>
    <p>
      Podemos actualizar estos términos. La versión vigente siempre estará publicada en esta página con
      su fecha. Las compras se rigen por los términos vigentes al momento en que se realizaron.
    </p>
  </LegalLayout>
</template>
