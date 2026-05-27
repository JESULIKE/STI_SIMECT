<script setup lang="ts">
import { useTourStore, type TourStep } from '~/stores/tour'

definePageMeta({ layout: 'main' })
const studentStore = useStudentStore()
const { user } = useUserSession()
const router = useRouter()
const tourStore = useTourStore()

const isLoading = ref(true)
const realPhases = ref([])
const realBadges = ref<any[]>([])

// Cargar datos reales desde la base de datos (Sección 12.3)
onMounted(async () => {
  try {
    const data: any = await $fetch('/api/student/progress')
    
    studentStore.setProgress({
      totalPoints: data.points,
      currentStreak: data.streak
    })

    // Sincronizar el nivel adaptativo si viene de la BD
    if (data.nivelActual) {
      studentStore.setAssignedLevel(data.nivelActual)
    }
    
    realPhases.value = data.phases
    realBadges.value = data.badges || []
  } catch (error) {
    console.error('Error cargando Dashboard real:', error)
  } finally {
    isLoading.value = false
    
    // Auto-disparar el tour en el primer ingreso si es estudiante
    if (user.value?.role === 'STUDENT') {
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
      // Pequeño timeout para que el layout se cargue y los elementos estén listos en el DOM
      setTimeout(() => {
        tourStore.autoStart('dashboard', dashboardSteps)
      }, 500)
    }
  }
})

const currentPhaseLabel = computed(() => {
  const active = realPhases.value.find((p: any) => p.status === 'En curso') || 
                 realPhases.value.find((p: any) => p.status === 'Pendiente') ||
                 realPhases.value[0]
  
  if (active) {
    if (active.code === 'ANALYSIS') return 'Fase 1'
    if (active.code === 'EVALUATION') return 'Fase 2'
    if (active.code === 'JUDGMENT') return 'Fase 3'
  }
  
  const map = { ANALYSIS: 'Fase 1', EVALUATION: 'Fase 2', JUDGMENT: 'Fase 3' }
  return map[studentStore.progress.phase] || 'Fase 1'
})

const stats = computed(() => [
  { label: 'Puntos', value: studentStore.progress.totalPoints, icon: '⭐', color: 'text-amber-500' },
  { label: 'Fase', value: currentPhaseLabel.value, icon: '🎯', color: 'text-indigo-500' },
  { label: 'Racha', value: `${studentStore.progress.currentStreak} días`, icon: '🔥', color: 'text-orange-500' },
  {
    label: 'Nivel',
    value: studentStore.progress.assignedLevel?.label || 'Básico',
    icon: studentStore.progress.assignedLevel?.emoji || '🟢',
    color: studentStore.progress.assignedLevel?.color === 'indigo'
      ? 'text-indigo-600'
      : studentStore.progress.assignedLevel?.color === 'red'
        ? 'text-red-600'
        : 'text-emerald-600'
  }
])

const handleContinue = () => {
  const active = realPhases.value.find((p: any) => p.status === 'En curso') || 
                 realPhases.value.find((p: any) => p.status === 'Pendiente') ||
                 realPhases.value[0]
  const phaseCode = active?.code || studentStore.progress.phase
  router.push(`/learn/${studentStore.progress.level}/${phaseCode}`)
}

// Emojis educativos cayendo en el dashboard
const floatingEmojis = [
  { emoji: '📚', delay: '0s',   duration: '7s',  left: '2%',  size: '2rem' },
  { emoji: '✏️', delay: '1.2s', duration: '9s',  left: '7%',  size: '1.5rem' },
  { emoji: '🎓', delay: '0.4s', duration: '6.5s',left: '13%', size: '2.2rem' },
  { emoji: '📐', delay: '2.1s', duration: '8s',  left: '19%', size: '1.4rem' },
  { emoji: '🔬', delay: '1.6s', duration: '7.5s',left: '25%', size: '1.8rem' },
  { emoji: '📝', delay: '0.7s', duration: '8.5s',left: '31%', size: '1.6rem' },
  { emoji: '🧠', delay: '2.5s', duration: '6s',  left: '37%', size: '2rem' },
  { emoji: '📖', delay: '0.3s', duration: '7s',  left: '43%', size: '1.9rem' },
  { emoji: '🔭', delay: '1.9s', duration: '9s',  left: '49%', size: '1.5rem' },
  { emoji: '🎒', delay: '3.1s', duration: '6.5s',left: '55%', size: '2rem' },
  { emoji: '📚', delay: '1.3s', duration: '8s',  left: '61%', size: '2.2rem' },
  { emoji: '📊', delay: '2.4s', duration: '7s',  left: '67%', size: '1.3rem' },
  { emoji: '🌟', delay: '0.6s', duration: '8.5s',left: '73%', size: '1.7rem' },
  { emoji: '✏️', delay: '1.8s', duration: '6.5s',left: '79%', size: '1.5rem' },
  { emoji: '🎓', delay: '2.9s', duration: '7.5s',left: '85%', size: '2rem' },
  { emoji: '📌', delay: '0.9s', duration: '9s',  left: '91%', size: '1.4rem' },
  { emoji: '🧠', delay: '3.6s', duration: '6s',  left: '96%', size: '1.8rem' },
]

const glosario = [
  {
    titulo: 'Pensamiento Crítico',
    emoji: '🔍',
    descripcion: 'Capacidad de analizar información, dudar de afirmaciones sin evidencia y evaluar argumentos antes de aceptarlos como verdaderos.'
  },
  {
    titulo: 'Metacognición',
    emoji: '🧠',
    descripcion: 'Pensar sobre cómo piensas. Es ser consciente de tu propio aprendizaje, saber qué estrategias te funcionan y monitorear tu progreso.'
  },
  {
    titulo: 'Falacia',
    emoji: '⚠️',
    descripcion: 'Un engaño o error oculto en un argumento. Parece lógico a primera vista, pero si lo analizas bien, te das cuenta de que la conclusión no tiene sentido.'
  },
  {
    titulo: 'Fuente Confiable',
    emoji: '⚖️',
    descripcion: 'Información que proviene de expertos, estudios o instituciones serias que pueden ser verificadas y respaldadas por evidencia real.'
  },
  {
    titulo: 'Hecho vs Opinión',
    emoji: '📊',
    descripcion: 'Un hecho es algo que se puede comprobar de forma objetiva (ej. "el río subió 2 metros"). Una opinión es lo que alguien cree o siente al respecto.'
  },
  {
    titulo: 'JOL (Juicio de Aprendizaje)',
    emoji: '⏱️',
    descripcion: 'Es la estimación que haces sobre qué tan bien crees que has entendido algo o cuánto tiempo crees que te tomará resolver una tarea.'
  }
]
</script>

<template>
  <div class="min-h-screen p-6 lg:p-12 transition-colors duration-500 relative">

    <!-- ══ Emojis educativos cayendo — capa FIJA sobre toda la pantalla ══ -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <span
        v-for="(item, i) in floatingEmojis"
        :key="i"
        class="falling-emoji absolute top-0"
        :style="{
          left: item.left,
          fontSize: item.size,
          animationDelay: item.delay,
          animationDuration: item.duration
        }"
      >{{ item.emoji }}</span>
    </div>

    <div class="max-w-6xl mx-auto space-y-12 relative z-10">
      
      <!-- Header: Saludo y Stats (Sección 10.1) -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div class="space-y-2">
          <h1 class="text-4xl font-black text-black italic uppercase tracking-tighter">
            Hola, {{ user?.name || 'Estudiante' }}
          </h1>
          
          <div v-if="user?.studentCode" class="inline-block mt-2 px-4 py-2 bg-blue-100 border-2 border-blue-300 rounded-xl shadow-sm">
            <p class="text-[10px] text-blue-600 font-black uppercase tracking-widest leading-none mb-1">Tu Código de Acceso</p>
            <p class="text-xl text-blue-900 font-mono font-black leading-none">{{ user.studentCode }}</p>
          </div>
          
          <p class="text-black font-medium italic mt-2">Tu camino de aprendizaje comienza aquí.</p>
        </div>
        
        <div id="tour-stats-panel" class="grid grid-cols-3 gap-3 w-full md:w-auto md:flex md:gap-4">
          <div v-for="stat in stats" :key="stat.label"
               class="bg-white px-3 py-4 md:px-6 rounded-[32px] shadow-xl border-2 border-white flex flex-col items-center overflow-hidden">
            <span class="text-2xl mb-1">{{ stat.icon }}</span>
            <span class="text-lg md:text-xl font-black text-black font-mono truncate w-full text-center">{{ stat.value }}</span>
            <span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-black text-center leading-tight">{{ stat.label }}</span>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <!-- Columna Izquierda: Progreso de Fases -->
        <div class="lg:col-span-2 space-y-8">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black px-2">Tu Mapa de Aprendizaje</h2>
          
          <div id="tour-learning-map" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <template v-if="isLoading">
              <div v-for="i in 3" :key="i" class="h-48 bg-slate-100 animate-pulse rounded-[40px]"></div>
            </template>
            
            <div v-else v-for="phase in realPhases" :key="phase.name" 
                 class="bg-white p-6 rounded-[40px] shadow-xl border-2 border-white flex flex-col justify-between group hover:border-indigo-200 transition-all">
              <div class="space-y-4">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-black text-black uppercase tracking-tighter italic text-xs leading-tight flex-1">{{ phase.name }}</h3>
                  <span class="shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full" 
                    :class="phase.status === 'Completado' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-black'"
                  >{{ phase.status }}</span>
                </div>
                
                <!-- Sub-fases -->
                <div class="space-y-2">
                  <div v-for="sp in phase.subPhases" :key="sp.code" class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="sp.progress === 100 ? 'bg-emerald-500' : sp.progress > 0 ? 'bg-indigo-500' : 'bg-slate-200'"></div>
                      <span class="text-[9px] font-bold text-black leading-tight flex-1">{{ sp.name }}</span>
                    </div>
                    <div class="flex items-center gap-2 pl-3">
                      <div class="flex-1 h-1 bg-slate-50 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-400" :style="{ width: `${sp.progress}%` }"></div>
                      </div>
                      <span class="text-[8px] font-black text-slate-500">{{ sp.progress }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-4 mt-auto">
                <div class="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: `${phase.progress}%` }"></div>
                </div>
                <p class="text-[8px] font-black text-center mt-1 text-slate-400 uppercase tracking-widest">{{ Math.round(phase.progress) }}% TOTAL</p>
              </div>
            </div>
          </div>

          <!-- Botón de Continuar Gigante (Pantalla 2) -->
          <button id="tour-continue-btn" @click="handleContinue" 
                  class="w-full group relative overflow-hidden bg-emerald-500 hover:bg-emerald-400 p-12 rounded-[48px] shadow-2xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 text-left">
            <div class="relative z-10">
              <span class="text-white/70 text-[10px] font-black uppercase tracking-[0.5em] block mb-2">Próximo Reto</span>
              <h2 class="text-4xl font-black text-white italic uppercase tracking-tighter">Continuar mi viaje</h2>
            </div>
            <div class="absolute right-12 top-1/2 -translate-y-1/2 text-white/20 text-8xl font-black group-hover:translate-x-4 transition-transform">
              →
            </div>
          </button>

          <!-- Glosario de Conceptos -->
          <div class="bg-white rounded-[40px] p-8 md:p-10 shadow-xl border-2 border-slate-100">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                📖
              </div>
              <div>
                <h2 class="text-xl md:text-2xl font-black text-black italic uppercase tracking-tighter">Glosario SIMECT</h2>
                <p class="text-xs text-slate-500 font-medium">Conceptos clave para tu entrenamiento mental</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(concepto, i) in glosario" :key="i" class="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-colors group">
                <div class="flex items-start gap-3 mb-2">
                  <span class="text-xl group-hover:scale-110 transition-transform">{{ concepto.emoji }}</span>
                  <h3 class="text-sm font-black text-indigo-900 uppercase tracking-widest">{{ concepto.titulo }}</h3>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed font-medium pl-8">
                  {{ concepto.descripcion }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Narrativa (Pantalla 3) -->
        <div id="tour-narrative-panel" class="space-y-8">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black px-2">Historias Desbloqueadas</h2>
          
          <div class="bg-indigo-600 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            <div class="relative z-10 space-y-6">
              <div class="w-full h-40 bg-white/10 rounded-3xl overflow-hidden relative">
                <img src="/Contexto.png" alt="Contextualización" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-white italic uppercase">El Sistema y el Tema</h3>
                <p class="text-white/70 text-xs font-medium italic leading-relaxed line-clamp-3">
                  Consulta aquí qué es SIMECT, cómo funciona y la historia de Mateo en las inundaciones de Córdoba.
                </p>
              </div>
              <NuxtLink
                to="/contextualization"
                class="block w-full py-4 bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-indigo-50 transition-colors text-center"
              >
                Ver Contextualización
              </NuxtLink>
            </div>
          </div>

          <!-- Galería de Insignias (real) -->
          <div class="bg-white rounded-[40px] p-8 border-2 border-white shadow-xl">
            <GamificationBadgeDisplay :badges="realBadges" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══ Emojis cayendo ═══ */
.falling-emoji {
  animation: fall linear infinite;
  opacity: 0;
  user-select: none;
}

@keyframes fall {
  0%   { transform: translateY(-60px) rotate(0deg);   opacity: 0; }
  5%   { opacity: 0.6; }
  90%  { opacity: 0.4; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
</style>
