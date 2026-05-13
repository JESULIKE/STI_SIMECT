<template>
  <div class="min-h-screen transition-colors duration-300">
    <!-- Navbar principal -->
    <UiAppNavbar />

    <!-- Contenido de la página -->
    <main id="main-content" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const uiStore = useUIStore()

// Inicializar tema al montar el layout
onMounted(() => {
  uiStore.initTheme()
})
</script>
