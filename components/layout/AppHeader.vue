<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import { useKitStore } from '~/stores/kit'
import StreakCounter from '~/components/gamification/StreakCounter.vue'

const studentStore = useStudentStore()
const kit = useKitStore()
const { user, clear } = useUserSession()
const route = useRoute()

const mobileMenuOpen = ref(false)
const closeMobile = () => { mobileMenuOpen.value = false }

// Cierra el menú al cambiar de ruta
watch(() => route.path, closeMobile)

const handleLogout = async () => {
  closeMobile()
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/auth/login')
}

const navItems = computed(() => {
  const items = []
  
  if (user.value?.role === 'STUDENT') {
    items.push({ name: 'Dashboard', path: '/dashboard', icon: '🏠' })
    items.push({ name: 'Aprender', path: '/learn/BASIC/ANALYSIS', icon: '📚' })
    items.push({ name: 'Mi Progreso', path: '/progress', icon: '📈' })
  } else {
    items.push({ name: 'Analítica Docente', path: '/admin/analytics', icon: '👩‍🏫' })
  }
  
  return items
})

const isActive = (path: string) =>
  route.path.startsWith(path.split('/')[1] ? `/${path.split('/')[1]}` : path)

const isPulsing = ref(false)
watch(() => studentStore.progress.totalPoints, (newVal, oldVal) => {
  if (newVal > oldVal) {
    isPulsing.value = true
    setTimeout(() => isPulsing.value = false, 600)
  }
})
</script>

<template>
  <header class="bg-white/90 border-b-2 border-blue-100 sticky top-0 z-30 shadow-sm backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

      <!-- ── LOGO ── -->
      <NuxtLink to="/dashboard" class="flex items-center gap-2 group shrink-0 transition-transform hover:scale-105 active:scale-95">
        <UiAppLogo />
      </NuxtLink>

      <!-- ── NAV DESKTOP ── -->
      <nav class="hidden md:flex items-center gap-1 flex-1">
        <NuxtLink
          v-for="item in navItems" :key="item.path" :to="item.path"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-50"
          :class="isActive(item.path) ? 'text-blue-600 bg-blue-100' : 'text-slate-600'"
        >
          {{ item.name }}
        </NuxtLink>
      </nav>

      <!-- ── DERECHA DESKTOP ── -->
      <div class="hidden md:flex items-center gap-3">
        <!-- Puntos -->
        <div :class="['flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl text-white shadow-lg shadow-indigo-500/20 transition-transform', isPulsing ? 'scale-110' : '']">
          <span class="text-base leading-none">⭐</span>
          <span class="font-black text-sm">{{ studentStore.progress.totalPoints }}</span>
        </div>
        <StreakCounter />
        <!-- Kit -->
        <button
          v-if="user?.role === 'STUDENT'"
          @click="kit.toggle()"
          :class="['relative flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all', kit.isOpen ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600 hover:bg-blue-100']"
        >
          <span class="text-base leading-none">🧰</span>
          <span>Kit</span>
          <span v-if="kit.factsCount + kit.fallaciesCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
            {{ kit.factsCount + kit.fallaciesCount }}
          </span>
        </button>
        <div class="h-6 w-px bg-slate-200"/>
        <!-- Logout -->
        <button @click="handleLogout"
          class="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      <!-- ── MÓVIL: Kit rápido + Hamburguesa ── -->
      <div class="flex md:hidden items-center gap-2">
        <!-- Kit rápido en móvil -->
        <button
          v-if="user?.role === 'STUDENT'"
          @click="kit.toggle()"
          :class="['relative flex items-center justify-center w-10 h-10 rounded-xl text-lg transition-all', kit.isOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600']"
        >
          🧰
          <span v-if="kit.factsCount + kit.fallaciesCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center">
            {{ kit.factsCount + kit.fallaciesCount }}
          </span>
        </button>
        <!-- Hamburguesa -->
        <button @click="mobileMenuOpen = !mobileMenuOpen"
          class="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-blue-50 gap-1.5 transition-all hover:bg-blue-100">
          <span :class="['block w-5 h-0.5 bg-blue-600 transition-all duration-300', mobileMenuOpen ? 'rotate-45 translate-y-2' : '']"/>
          <span :class="['block w-5 h-0.5 bg-blue-600 transition-all duration-300', mobileMenuOpen ? 'opacity-0' : '']"/>
          <span :class="['block w-5 h-0.5 bg-blue-600 transition-all duration-300', mobileMenuOpen ? '-rotate-45 -translate-y-2' : '']"/>
        </button>
      </div>
    </div>

    <!-- ── MENÚ MÓVIL DESPLEGABLE ── -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen"
        class="md:hidden border-t-2 border-blue-100 bg-white/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1">

        <!-- Stats móvil -->
        <div class="flex items-center gap-3 py-3 px-2 border-b border-blue-100 mb-2">
          <div class="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl text-white">
            <span>⭐</span>
            <span class="font-black text-sm">{{ studentStore.progress.totalPoints }}</span>
          </div>
          <StreakCounter />
        </div>

        <!-- Nav links -->
        <NuxtLink
          v-for="item in navItems" :key="item.path" :to="item.path"
          @click="closeMobile"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all"
          :class="isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-blue-50'"
        >
          <span class="text-xl">{{ item.icon }}</span>
          {{ item.name }}
        </NuxtLink>

        <!-- Logout móvil -->
        <button @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-2 border-t border-blue-100 pt-4">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.mobile-menu-enter-active, .mobile-menu-leave-active {
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
}
.mobile-menu-enter-from, .mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
