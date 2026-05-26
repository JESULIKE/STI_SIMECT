<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import { useKitStore } from '~/stores/kit'
import StreakCounter from '~/components/gamification/StreakCounter.vue'
import { useTourStore, type TourStep } from '~/stores/tour'

const studentStore = useStudentStore()
const kit = useKitStore()
const { user, clear } = useUserSession()
const route = useRoute()
const tourStore = useTourStore()

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

const triggerTour = () => {
  if (route.path.includes('/dashboard')) {
    const dashboardSteps: TourStep[] = [
      {
        target: null,
        title: '¡Bienvenido al Tutor SIMECT! 🧠',
        description: 'Este es tu espacio de entrenamiento para agudizar tu mente. Te guiaremos en un breve recorrido para que conozcas cómo funciona.',
        emoji: '✨',
        position: 'center'
      },
      {
        target: '#tour-stats-panel',
        title: 'Tus Estadísticas Clave 🏆',
        description: 'Aquí ves tus Puntos totales, la Fase actual, tu Racha de días consecutivos y tu nivel de entrenamiento.',
        emoji: '📊',
        position: 'bottom'
      },
      {
        target: '#tour-learning-map',
        title: 'Mapa de Aprendizaje 🗺️',
        description: 'Esta ruta muestra tu camino. Cada fase tiene subfases obligatorias con barras individuales de progreso.',
        emoji: '🗺️',
        position: 'bottom'
      },
      {
        target: '#tour-continue-btn',
        title: 'Entrar en Acción 🚀',
        description: '¡Haz clic aquí para continuar directamente con tu siguiente desafío de aprendizaje!',
        emoji: '⚡',
        position: 'top'
      },
      {
        target: '#tour-narrative-panel',
        title: 'Historias e Insignias 🏅',
        description: 'Descubre los fragmentos de historia que has desbloqueado y las insignias que demuestran tu nivel.',
        emoji: '🎁',
        position: 'left'
      },
      {
        target: '#tour-kit-btn',
        title: 'Tu Kit de Herramientas 🧰',
        description: 'Aquí se guardan las herramientas (hechos y falacias) que vas descubriendo en las historias. ¡Consúltalas siempre que las necesites!',
        emoji: '🧰',
        position: 'bottom'
      },
      {
        target: null,
        title: '¡Listo para empezar! 🚀',
        description: 'Ya conoces tu centro de operaciones. ¡Comienza a resolver retos y demuestra tu agudeza mental!',
        emoji: '🧠',
        position: 'center'
      }
    ]
    tourStore.startTour('dashboard', dashboardSteps)
  } else if (route.path.includes('/learn/')) {
    const learnSteps: TourStep[] = [
      {
        target: null,
        title: '¡Bienvenido a la Sala de Desafíos! 🎮',
        description: 'Aquí resolverás diversos retos interactivos para entrenar tu pensamiento crítico. Veamos qué tiene esta pantalla.',
        emoji: '💡',
        position: 'center'
      },
      {
        target: '#tour-progress-bars',
        title: 'Tu Progreso en Tiempo Real 📈',
        description: 'Estas barras muestran tu avance en la actividad actual, en la fase en la que te encuentras y en tu nivel global.',
        emoji: '📊',
        position: 'bottom'
      },
      {
        target: '#tour-story-btn',
        title: 'Releer la Historia 📖',
        description: 'Si tienes dudas o necesitas recordar el contexto de Mateo y su entorno, puedes presionar este botón para abrir la historia en cualquier momento.',
        emoji: '📚',
        position: 'bottom'
      },
      {
        target: '#tour-workspace',
        title: 'Espacio de Trabajo 🛠️',
        description: 'Esta es la zona de juego principal donde interactúas, seleccionas, clasificas o respondes los retos planteados.',
        emoji: '🧠',
        position: 'top'
      },
      {
        target: '#tour-confidence',
        title: 'Confianza Metacognitiva ⭐',
        description: 'Valora tu seguridad antes de responder: 1 estrella si dudas, 2 si tienes confianza, o 3 si estás totalmente seguro de tu respuesta. ¡Esto ayuda a tu entrenamiento mental!',
        emoji: '🧠',
        position: 'top'
      },
      {
        target: '#tour-submit',
        title: 'Enviar Solución ⚡',
        description: 'Una vez respondido el reto y seleccionada tu confianza, presiona este botón para que nuestro motor analice tu respuesta y te dé feedback inmediato.',
        emoji: '🚀',
        position: 'top'
      },
      {
        target: '#tour-help-btn',
        title: 'Pistas del Tutor ❔',
        description: '¿Te sientes atascado? No te preocupes. Haz clic en este botón de interrogación para pedirle una pista estratégica al tutor.',
        emoji: '🤝',
        position: 'top'
      },
      {
        target: null,
        title: '¡Todo listo! 🌟',
        description: '¡Ahora conoces a la perfección todas las herramientas! Demuestra tu agudeza mental resolviendo los retos.',
        emoji: '🧠',
        position: 'center'
      }
    ]
    tourStore.startTour('learn', learnSteps)
  } else {
    const genericSteps: TourStep[] = [
      {
        target: null,
        title: 'Tutor Inteligente SIMECT 🧠',
        description: 'Estamos aquí para ayudarte a desarrollar habilidades de de pensamiento analítico y toma de decisiones en tiempo real.',
        emoji: '✨',
        position: 'center'
      }
    ]
    tourStore.startTour('generic', genericSteps)
  }
}

const triggerTourMobile = () => {
  closeMobile()
  triggerTour()
}
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
        <!-- Botón Guía Desktop -->
        <button
          v-if="user?.role === 'STUDENT'"
          @click="triggerTour"
          class="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
          title="Ver explicación guiada de esta pantalla"
        >
          <span class="text-base leading-none">💡</span>
          <span>Guía</span>
        </button>

        <!-- Kit -->
        <button
          id="tour-kit-btn"
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

        <!-- Guía móvil -->
        <button
          v-if="user?.role === 'STUDENT'"
          @click="triggerTourMobile"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all mt-1"
        >
          <span class="text-xl">💡</span>
          Iniciar Guía
        </button>

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
