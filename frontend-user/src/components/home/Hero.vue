<template>
  <section class="relative h-[90vh] flex items-center justify-center px-6 text-center">
    <div class="max-w-3xl z-10">
      <h1 class="text-5xl md:text-7xl font-noto-serif leading-tight mb-6 text-gray-800">
        Tu cuerpo, tu ritmo, tu estilo
      </h1>
      <p class="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-manrope">
        En NARA, creamos prendas que se adaptan a ti, celebrando tu individualidad y la belleza de lo real.
      </p>
      <router-link to="/catalogo" class="bg-nara-olive text-white px-10 py-4 rounded-lg font-montserrat tracking-wider hover:bg-nara-sand transition-all duration-300 transform hover:scale-105 shadow-lg shadow-nara-olive/30">
        Ver Colección
      </router-link>
    </div>
    
    <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-nara-sand/10 rounded-full blur-3xl opacity-50"></div>
    <div class="absolute -top-20 -right-20 w-96 h-96 bg-nara-olive/10 rounded-full blur-3xl opacity-50"></div>
  </section>
</template>