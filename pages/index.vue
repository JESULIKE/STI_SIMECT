<script setup lang="ts">
const { loggedIn } = useUserSession()

// Siempre redirigir al login si no hay sesión, o al dashboard si la hay.
// El login será la puerta de entrada principal según los nuevos requerimientos.
if (loggedIn.value) {
  await navigateTo('/dashboard')
} else {
  await navigateTo('/auth/login')
}

definePageMeta({ layout: 'default' })

useSeoMeta({
  title: 'Inicio',
  description: 'Sistema Tutor Inteligente SIMECT – Plataforma de aprendizaje adaptativo.',
})
</script>

<template>
  <div class="flex h-[60vh] items-center justify-center">
    <div class="text-center">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <p class="mt-4 text-surface-600 font-medium">Cargando STI SIMECT...</p>
    </div>
  </div>
</template>

