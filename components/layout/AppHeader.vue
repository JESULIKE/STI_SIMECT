<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import StreakCounter from '~/components/gamification/StreakCounter.vue'

const studentStore = useStudentStore()
const { user, clear } = useUserSession()
const route = useRoute()

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/auth/login')
}

const navItems = computed(() => {
  const items = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Aprender', path: '/learn/BASIC/ANALYSIS' },
    { name: 'Mi Progreso', path: '/progress' }
  ]
  
  if (user.value?.role !== 'STUDENT') {
    items.push({ name: 'Analítica', path: '/admin/analytics' })
  }
  
  return items
})

const isActive = (path: string) => route.path.startsWith(path.split('/')[1] ? `/${path.split('/')[1]}` : path)

// Lógica de pulso para puntos
const isPulsing = ref(false)
watch(() => studentStore.progress.totalPoints, (newVal, oldVal) => {
  if (newVal > oldVal) {
    isPulsing.value = true
    setTimeout(() => isPulsing.value = false, 600)
  }
})
</script>

<template>
  <header class="h-20 bg-white/80 border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-xl transition-all duration-300">
    <div class="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      
      <!-- Izquierda: Logo y Navegación -->
      <div class="flex items-center gap-10">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95">
          <UiAppLogo />
        </NuxtLink>

        <!-- Navegación Desktop -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-100"
            :class="isActive(item.path) ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-800'"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Derecha: Stats & Perfil -->
      <div class="flex items-center gap-4">
        
        <!-- Puntos -->
        <div 
          :class="[
            'hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl text-white transition-transform duration-300 shadow-lg shadow-indigo-500/20',
            isPulsing ? 'scale-110' : ''
          ]"
        >
          <span class="text-lg leading-none">⭐</span>
          <span class="font-black tracking-tighter text-sm">{{ studentStore.progress.totalPoints }}</span>
        </div>

        <StreakCounter class="hidden sm:flex" />
        
        <div class="h-6 w-px bg-slate-200"></div>
        
        <button 
          @click="handleLogout"
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Cerrar sesión"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

    </div>

    <!-- Navegación Móvil (Opcional: se podría añadir un menú desplegable aquí si se desea) -->
  </header>
</template>
