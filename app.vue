<script setup lang="ts">
import { useUIStore } from '~/stores/ui'
const uiStore = useUIStore()

onMounted(() => {
  uiStore.initTheme()
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#6366f1" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
