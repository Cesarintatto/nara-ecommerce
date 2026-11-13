<script setup>
import LegalLayout from '../components/legal/LegalLayout.vue'
import LegalField from '../components/legal/LegalField.vue'
import { LEGAL, POLICY_EFFECTIVE_DATE } from '../legal/legalInfo'
import { useMeta } from '../composables/useMeta'

useMeta(() => ({
  title: 'Política de tratamiento de datos',
  description: 'Cómo Naracol Estudio trata tus datos personales, conforme a la Ley 1581 de 2012.',
  path: '/privacidad',
}))

const sections = [
  { id: 'responsable', title: 'Responsable' },
  { id: 'datos', title: 'Datos que tratamos' },
  { id: 'finalidades', title: 'Para qué los usamos' },
  { id: 'terceros', title: 'Con quién los compartimos' },
  { id: 'derechos', title: 'Tus derechos' },
  { id: 'procedimiento', title: 'Consultas y reclamos' },
  { id: 'navegador', title: 'Almacenamiento en tu navegador' },
  { id: 'vigencia', title: 'Vigencia' },
]
</script>

<template>
  <LegalLayout title="Política de tratamiento de datos personales" :effective-date="POLICY_EFFECTIVE_DATE" :sections="sections">
    <h2 id="responsable">1. Responsable del tratamiento</h2>
    <p>
      <strong><LegalField :value="LEGAL.responsibleName" /></strong>, identificado con
      <LegalField :value="LEGAL.responsibleIdType" /> <LegalField :value="LEGAL.responsibleId" />, quien opera
      <strong>{{ LEGAL.brand }}</strong> ({{ LEGAL.website }}). Dirección: <LegalField :value="LEGAL.address" />,
      <LegalField :value="LEGAL.city" />. Correo: <LegalField :value="LEGAL.email" />. Teléfono:
      <LegalField :value="LEGAL.phone" />.
    </p>
    <p>
      Esta política cumple la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y
      las normas que los modifiquen.
    </p>

    <h2 id="datos">2. Datos que tratamos</h2>
    <p>
      Este sitio no tiene formularios ni cuentas de usuario: no recolecta tus datos personales. Cuando nos
      escribes por WhatsApp o redes sociales para hacer un pedido, tratamos los datos que tú mismo nos compartes:
      nombre, teléfono, dirección de entrega y los detalles del pedido.
    </p>
    <p>No recolectamos datos sensibles.</p>

    <h2 id="finalidades">3. Para qué usamos tus datos</h2>
    <ul>
      <li>Atender tu pedido, cotizarlo, producirlo y entregarlo.</li>
      <li>Responder tus preguntas, garantías y PQR.</li>
      <li>Cumplir obligaciones legales, contables y tributarias.</li>
      <li>Enviarte novedades de Naracol solo si lo autorizas expresamente; puedes pedir que dejemos de hacerlo cuando quieras.</li>
    </ul>

    <h2 id="terceros">4. Con quién compartimos tus datos</h2>
    <p>
      No vendemos ni alquilamos tus datos. Solo los compartimos con quienes nos ayudan a atenderte: la empresa
      transportadora que entrega tu pedido (nombre, teléfono y dirección) y los servicios en los que nos
      comunicamos contigo (WhatsApp y redes sociales de Meta, y TikTok). El sitio y sus imágenes están alojados en
      Google Cloud. Algunos de estos servicios guardan información fuera de Colombia.
    </p>

    <h2 id="derechos">5. Tus derechos</h2>
    <p>Según el artículo 8 de la Ley 1581 de 2012 puedes:</p>
    <ul>
      <li>Conocer, actualizar y rectificar tus datos.</li>
      <li>Pedir prueba de tu autorización y saber cómo usamos tus datos.</li>
      <li>Revocar la autorización y pedir la supresión de tus datos cuando no exista un deber legal de conservarlos.</li>
      <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
    </ul>

    <h2 id="procedimiento">6. Consultas y reclamos</h2>
    <p>
      Escríbenos a <LegalField :value="LEGAL.email" />. Respondemos las consultas en máximo diez (10) días
      hábiles y los reclamos en máximo quince (15) días hábiles, prorrogables según la ley. Debes agotar este
      trámite antes de acudir a la SIC.
    </p>

    <h2 id="navegador">7. Almacenamiento en tu navegador</h2>
    <p>
      Solo guardamos en tu navegador que aceptaste estas políticas. No usamos cookies de publicidad ni de
      analítica; si en el futuro lo hacemos, actualizaremos esta política y te lo informaremos.
    </p>

    <h2 id="vigencia">8. Vigencia</h2>
    <p>
      Esta política rige desde el {{ POLICY_EFFECTIVE_DATE }}. Si la modificamos, publicaremos la nueva versión en
      esta página.
    </p>
  </LegalLayout>
</template>
