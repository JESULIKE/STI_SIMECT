<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen font-sans transition-colors duration-300 bg-[#BADDFF]">
    <div class="flex-1 flex flex-col min-h-screen transition-all duration-300">
      <!-- Cabecera Superior -->
      <AppHeader />
      
      <!-- Contenido de la Página -->
      <main class="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
