<script setup>
import { LEGAL, isPending } from '../../legal/legalInfo'

const year = new Date().getFullYear()
const email = isPending(LEGAL.email) ? '' : LEGAL.email
</script>

<template>
  <footer class="bg-nara-dark text-white">
    <div class="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-3 md:items-start">
      <div>
        <img src="@/assets/images/Nara-brown.png" alt="NARA" class="h-12 w-auto" />
        <p class="mt-5 max-w-xs font-noto-serif text-white/70 leading-relaxed">
          Tu cuerpo, tu ritmo, tu estilo.
        </p>
      </div>

      <nav aria-label="Tienda" class="font-manrope text-sm">
        <p class="text-white/50 mb-3">Tienda</p>
        <ul class="space-y-2">
          <li><router-link to="/catalogo" class="text-white/85 hover:text-nara-sand">Catálogo</router-link></li>
          <li><router-link to="/carrito" class="text-white/85 hover:text-nara-sand">Carrito</router-link></li>
          <li v-if="email">
            <a :href="`mailto:${email}`" class="text-white/85 hover:text-nara-sand">{{ email }}</a>
          </li>
        </ul>
      </nav>

      <nav aria-label="Legal" class="font-manrope text-sm">
        <p class="text-white/50 mb-3">Legal</p>
        <ul class="space-y-2">
          <li><router-link to="/terminos" class="text-white/85 hover:text-nara-sand">Términos y condiciones</router-link></li>
          <li><router-link to="/privacidad" class="text-white/85 hover:text-nara-sand">Política de tratamiento de datos</router-link></li>
        </ul>
      </nav>
    </div>

    <div class="border-t border-white/10">
      <p class="max-w-7xl mx-auto px-6 py-6 font-manrope text-xs text-white/50">© {{ year }} NARA. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>
