<template>
  <!-- Layout limpio para páginas de autenticación — fondo heredado del html (#BADDFF) -->
  <div class="flex min-h-screen flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
    <slot />
  </div>
</template>

<script setup lang="ts">
const uiStore = useUIStore()
onMounted(() => uiStore.initTheme())
</script>
