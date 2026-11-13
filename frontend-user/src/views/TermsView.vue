<script setup>
import LegalLayout from '../components/legal/LegalLayout.vue'
import LegalField from '../components/legal/LegalField.vue'
import { LEGAL, POLICY_EFFECTIVE_DATE } from '../legal/legalInfo'
import { useMeta } from '../composables/useMeta'

useMeta(() => ({
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de Naracol Estudio: pedidos por WhatsApp, piezas impresas en 3D, envíos, garantía y PQR.',
  path: '/terminos',
}))

const sections = [
  { id: 'quien', title: 'Quiénes somos' },
  { id: 'aceptacion', title: 'Aceptación' },
  { id: 'catalogo', title: 'El catálogo' },
  { id: 'pedidos', title: 'Cómo se hace un pedido' },
  { id: 'colores', title: 'Colores y piezas impresas' },
  { id: 'envios', title: 'Entregas' },
  { id: 'retracto', title: 'Derecho de retracto' },
  { id: 'garantia', title: 'Garantía' },
  { id: 'pqr', title: 'Peticiones, quejas y reclamos' },
  { id: 'propiedad', title: 'Propiedad intelectual' },
  { id: 'datos', title: 'Datos personales' },
  { id: 'ley', title: 'Ley aplicable' },
]
</script>

<template>
  <LegalLayout title="Términos y condiciones" :effective-date="POLICY_EFFECTIVE_DATE" :sections="sections">
    <h2 id="quien">1. Quiénes somos</h2>
    <p>
      <strong>{{ LEGAL.brand }}</strong> ({{ LEGAL.website }}) es un estudio de diseño e impresión 3D operado por
      <strong><LegalField :value="LEGAL.responsibleName" /></strong>, identificado con
      <LegalField :value="LEGAL.responsibleIdType" /> <LegalField :value="LEGAL.responsibleId" />, con domicilio en
      <LegalField :value="LEGAL.address" />, <LegalField :value="LEGAL.city" />. Contacto:
      <LegalField :value="LEGAL.email" /> · WhatsApp <LegalField :value="LEGAL.phone" />.
    </p>

    <h2 id="aceptacion">2. Aceptación</h2>
    <p>
      Al navegar este sitio y hacer un pedido aceptas estos términos. Si no estás de acuerdo con ellos, te pedimos no
      usar el sitio.
    </p>

    <h2 id="catalogo">3. El catálogo</h2>
    <p>
      Este sitio es un catálogo: muestra las piezas que diseñamos e imprimimos, sus precios de referencia y los
      colores disponibles. No se hacen compras ni pagos dentro del sitio. Los precios están en pesos colombianos;
      las piezas marcadas como «A cotizar» se cotizan según el pedido.
    </p>

    <h2 id="pedidos">4. Cómo se hace un pedido</h2>
    <p>
      Los pedidos se hacen por WhatsApp. Al escribirnos te confirmamos la disponibilidad, el precio final, el
      color, el tiempo de producción (<LegalField :value="LEGAL.productionTime" />), el costo de envío y el medio
      de pago. El pedido queda confirmado cuando ambas partes lo acuerdan por ese medio.
    </p>

    <h2 id="colores">5. Colores y piezas impresas</h2>
    <p>
      Las piezas se fabrican por capas con impresión 3D. Es normal que tengan líneas de capa visibles y pequeñas
      variaciones entre una unidad y otra. Los colores en pantalla son una referencia: el tono real depende del
      filamento y de tu pantalla.
    </p>

    <h2 id="envios">6. Entregas</h2>
    <p>
      Enviamos a {{ LEGAL.shippingCoverage }} por medio de empresas transportadoras, o acordamos la entrega por
      WhatsApp. El costo y el tiempo de envío se informan antes de confirmar el pedido.
    </p>

    <h2 id="retracto">7. Derecho de retracto</h2>
    <p>
      En las ventas a distancia puedes retractarte dentro de los <strong>cinco (5) días hábiles</strong>
      siguientes a la entrega (artículo 47 de la Ley 1480 de 2011), devolviendo el producto sin uso y en las
      mismas condiciones en que lo recibiste. Los costos de la devolución corren por tu cuenta.
    </p>
    <p>
      Según la misma norma, el retracto no aplica a piezas hechas según tus especificaciones o claramente
      personalizadas (por ejemplo, con un nombre o un diseño hecho a pedido).
    </p>

    <h2 id="garantia">8. Garantía</h2>
    <p>
      Nuestras piezas tienen la garantía legal de calidad, idoneidad y seguridad de la Ley 1480 de 2011, por
      <LegalField :value="LEGAL.warrantyTerm" /> desde la entrega. Si una pieza llega con un defecto de
      fabricación, escríbenos con fotos: la reimprimimos, la cambiamos o, si no es posible, te devolvemos el dinero.
    </p>
    <p>
      La garantía no cubre el desgaste normal, golpes o caídas, la exposición a calor o sol directo (que puede
      deformar el material) ni modificaciones hechas a la pieza.
    </p>

    <h2 id="pqr">9. Peticiones, quejas y reclamos</h2>
    <p>
      Escríbenos a <LegalField :value="LEGAL.email" /> o por WhatsApp al <LegalField :value="LEGAL.phone" />.
      Respondemos en un máximo de quince (15) días hábiles. También puedes acudir a la Superintendencia de
      Industria y Comercio (<a href="https://www.sic.gov.co" target="_blank" rel="noopener">www.sic.gov.co</a>).
    </p>

    <h2 id="propiedad">10. Propiedad intelectual</h2>
    <p>
      La marca Naracol, su logo, los diseños de las piezas, las fotografías y los textos de este sitio pertenecen a
      Naracol Estudio o se usan con autorización. No pueden copiarse ni usarse con fines comerciales sin autorización
      previa y por escrito. Cuando nos envías un diseño para imprimir, declaras que tienes derecho a usarlo.
    </p>

    <h2 id="datos">11. Datos personales</h2>
    <p>
      Tratamos tus datos según nuestra
      <router-link to="/privacidad">Política de Tratamiento de Datos Personales</router-link> (Ley 1581 de 2012).
    </p>

    <h2 id="ley">12. Ley aplicable</h2>
    <p>
      Estos términos se rigen por las leyes de Colombia. Podemos actualizarlos; la versión vigente siempre estará
      publicada en esta página con su fecha.
    </p>
  </LegalLayout>
</template>
