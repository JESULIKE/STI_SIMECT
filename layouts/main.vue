<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import KitHerramientas from '~/components/ui/KitHerramientas.vue'
import InteractiveTour from '~/components/ui/InteractiveTour.vue'
</script>

<template>
  <div class="min-h-screen font-sans transition-colors duration-300 bg-[#D7EEFA]">
    <div class="flex-1 flex flex-col min-h-screen transition-all duration-300">
      <AppHeader />
      <main class="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
    <!-- Kit de Herramientas — disponible en toda la app -->
    <KitHerramientas />
    <!-- Guía Interactiva Spotlight -->
    <InteractiveTour />
  </div>
</template>
