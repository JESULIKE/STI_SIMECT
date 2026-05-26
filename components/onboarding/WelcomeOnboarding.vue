<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const { user } = useUserSession()
const emit = defineEmits<{
  complete: [data: { comprensionSIMECT: number; familiaridadTema: number }]
}>()

// ── Estado del wizard ─────────────────────────────────────────────────────
const step = ref(1) // 1=bienvenida, 2=qué es SIMECT, 3=el tema

// Respuestas a guardar
const comprensionSIMECT = ref(0)
const familiaridadTema = ref(0)

// ── Confeti ───────────────────────────────────────────────────────────────
const confettiPieces = ref<{ x: number; y: number; color: string; size: number; delay: string; duration: string; rotate: number }[]>([])
const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

function generateConfetti() {
  confettiPieces.value = Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 8 + Math.random() * 10,
    delay: `${(Math.random() * 1.5).toFixed(2)}s`,
    duration: `${(2.5 + Math.random() * 2).toFixed(2)}s`,
    rotate: Math.floor(Math.random() * 360)
  }))
}

// ── Estrellas ─────────────────────────────────────────────────────────────
const hoverStar = ref(0)

const goNext = () => {
  if (step.value < 3) step.value++
  else {
    emit('complete', {
      comprensionSIMECT: comprensionSIMECT.value,
      familiaridadTema: familiaridadTema.value
    })
  }
}
const goBack = () => { if (step.value > 1) step.value-- }

const canContinue = computed(() => {
  if (step.value === 2) return comprensionSIMECT.value > 0
  if (step.value === 3) return familiaridadTema.value > 0
  return true
})

const familiaridadLabel = computed(() => {
  const labels: Record<number, string> = {
    1: 'No sé nada del tema',
    2: 'He escuchado algo al respecto',
    3: 'Conozco lo básico',
    4: 'Estoy bastante informado',
    5: 'Entiendo muy bien lo que sucedió'
  }
  return familiaridadTema.value ? labels[familiaridadTema.value] : ''
})

onMounted(() => {
  generateConfetti()
  // Limpiar subfases vistas al iniciar onboarding (ej. tras un reset de datos)
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('simect_seen_subphases')
  }
})
</script>

<template>
  <div class="fixed inset-0 z-[200] bg-white overflow-y-auto">

    <!-- ══ PASO 1: BIENVENIDA ══════════════════════════════════════════ -->
    <div v-if="step === 1" class="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">

      <!-- Confeti -->
      <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          v-for="(p, i) in confettiPieces" :key="i"
          class="confetti-piece absolute"
          :style="{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate}deg)`
          }"
        />
      </div>

      <!-- Contenido centrado -->
      <div class="relative z-10 max-w-2xl w-full mx-auto text-center animate-in fade-in slide-in-from-bottom-6 duration-700">

        <!-- Ícono central -->
        <div class="inline-flex items-center justify-center w-28 h-28 rounded-[40px] bg-gradient-to-br from-indigo-500 to-emerald-500 text-white text-5xl mb-8 shadow-2xl shadow-indigo-500/30 rotate-3">
          🎓
        </div>

        <!-- Alerta de bienvenida -->
        <div class="bg-gradient-to-br from-indigo-50 to-emerald-50 border-2 border-indigo-200 rounded-[40px] p-8 md:p-10 shadow-xl mb-8">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 block mb-3">¡Bienvenido a SIMECT!</span>
          <h1 class="text-3xl md:text-4xl font-black text-black italic uppercase tracking-tight leading-tight mb-4">
            Hola, <span class="text-indigo-600">{{ user?.name || 'Estudiante' }}</span>
          </h1>
          <p class="text-lg text-slate-700 font-semibold leading-relaxed">
            Has realizado el primer paso para poner a prueba tus conocimientos.
          </p>
          <p class="text-2xl font-black text-indigo-600 uppercase tracking-widest mt-3">¡Bienvenido!</p>
        </div>

        <!-- Botón continuar -->
        <button
          @click="goNext"
          class="w-full inline-flex items-center justify-center gap-4 rounded-[40px] px-12 py-7 text-sm font-black text-white uppercase tracking-[0.4em] bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] transition-all shadow-2xl shadow-indigo-500/30"
        >
          Continuar
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ══ PASO 2: ¿QUÉ ES SIMECT? ═══════════════════════════════════ -->
    <div v-else-if="step === 2" class="min-h-screen max-w-3xl mx-auto px-6 py-12 md:py-16 animate-in fade-in slide-in-from-right-4 duration-500">

      <!-- Barra de progreso -->
      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-10">
        <div class="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.4)]"></div>
      </div>

      <div class="mb-8">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Contextualización · Paso 1 de 2</span>
        <h2 class="text-3xl md:text-4xl font-black text-black italic uppercase tracking-tight mt-2">¿Qué es SIMECT?</h2>
      </div>

      <!-- Tarjeta principal -->
      <div class="bg-white border-2 border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm mb-6">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">🤖</div>
          <div>
            <h3 class="font-black text-black uppercase tracking-tight text-lg">Sistema Tutor Inteligente</h3>
            <p class="text-slate-600 text-sm font-medium leading-relaxed mt-1">
              SIMECT es un sistema tutor inteligente para alumnos de <strong>grado octavo y noveno</strong>.
              En lugar de evaluar de forma tradicional, estimula el <strong>pensamiento crítico</strong>,
              la <strong>metacognición</strong> y la <strong>toma de decisiones</strong>.
            </p>
          </div>
        </div>

        <div class="w-full h-px bg-slate-100 mb-6"></div>

        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">⚙️</div>
          <div>
            <h3 class="font-black text-black uppercase tracking-tight text-lg">¿Cómo funciona?</h3>
            <p class="text-slate-600 text-sm font-medium leading-relaxed mt-1">
              El sistema identifica el nivel de complejidad en el que te encuentras mediante unas preguntas.
              Se compone de <strong>3 fases</strong> con <strong>6 subfases</strong>, sumando un total de
              <strong>12 actividades</strong> obligatorias por estudiante.
            </p>
          </div>
        </div>

        <!-- Diagrama visual de fases -->
        <div class="grid grid-cols-3 gap-3">
          <div v-for="(f, i) in [
            { num: '1', name: 'Análisis', emoji: '🔍', subs: '2 subfases' },
            { num: '2', name: 'Evaluación', emoji: '⚖️', subs: '2 subfases' },
            { num: '3', name: 'Juicio', emoji: '🎯', subs: '2 subfases' }
          ]" :key="i"
            class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 text-center"
          >
            <span class="block text-2xl mb-1">{{ f.emoji }}</span>
            <span class="block text-xs font-black text-black uppercase">Fase {{ f.num }}</span>
            <span class="block text-[10px] font-bold text-indigo-600 uppercase tracking-wide">{{ f.name }}</span>
            <span class="block text-[9px] text-slate-400 font-bold mt-1">{{ f.subs }}</span>
          </div>
        </div>
      </div>

      <!-- Pregunta de comprensión con estrellas -->
      <div class="bg-indigo-50 border-2 border-indigo-200 rounded-[32px] p-6 mb-8">
        <p class="text-sm font-black text-black uppercase tracking-widest mb-4">
          <span class="text-indigo-600 mr-2">★</span>
          ¿Ya comprendes qué es y cómo funciona SIMECT?
        </p>
        <div class="flex items-center justify-center gap-2">
          <button
            v-for="star in 5" :key="star"
            type="button"
            @click="comprensionSIMECT = star"
            @mouseenter="hoverStar = star"
            @mouseleave="hoverStar = 0"
            class="text-4xl transition-all duration-150 hover:scale-110 focus:outline-none"
          >
            <span :class="star <= (hoverStar || comprensionSIMECT) ? 'text-amber-400' : 'text-slate-200'">★</span>
          </button>
        </div>
        <p v-if="comprensionSIMECT > 0" class="text-center text-xs font-black text-indigo-600 uppercase tracking-widest mt-3">
          {{ ['', 'Nada claro aún', 'Algo entiendo', 'Más o menos', 'Bastante claro', '¡Lo entendí perfectamente!'][comprensionSIMECT] }}
        </p>
      </div>

      <!-- Botones -->
      <div class="flex gap-4">
        <button
          @click="goBack"
          class="flex items-center gap-2 px-8 py-5 rounded-[32px] border-2 border-slate-200 text-sm font-black uppercase tracking-widest text-black hover:border-slate-300 transition-all"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Atrás
        </button>
        <button
          @click="goNext"
          :disabled="!canContinue"
          class="flex-1 inline-flex items-center justify-center gap-4 rounded-[32px] px-10 py-5 text-sm font-black text-white uppercase tracking-[0.3em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :class="canContinue ? 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] shadow-lg shadow-indigo-500/30' : 'bg-slate-300 text-slate-500'"
        >
          Continuar
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ══ PASO 3: EL TEMA ════════════════════════════════════════════ -->
    <div v-else-if="step === 3" class="min-h-screen max-w-3xl mx-auto px-6 py-12 md:py-16 animate-in fade-in slide-in-from-right-4 duration-500">

      <!-- Barra de progreso -->
      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-10">
        <div class="h-full w-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.4)]"></div>
      </div>

      <div class="mb-8">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Contextualización · Paso 2 de 2</span>
        <h2 class="text-3xl md:text-4xl font-black text-black italic uppercase tracking-tight mt-2">¿Cuál es el tema?</h2>
      </div>

      <!-- Tarjeta del tema -->
      <div class="bg-white border-2 border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm mb-6">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">🌊</div>
          <div>
            <h3 class="font-black text-black uppercase tracking-tight text-lg">Inundaciones en Córdoba</h3>
            <p class="text-slate-600 text-sm font-medium leading-relaxed mt-1">
              El tema central de SIMECT será sobre las <strong>inundaciones en Córdoba provocadas por el frente frío</strong>.
              Con el fin de entender más la situación y fortalecer el pensamiento crítico.
            </p>
          </div>
        </div>

        <!-- Imagen de Contexto -->
        <div class="mb-6 rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-sm">
          <img src="/Contexto.png" alt="Inundaciones en Córdoba" class="w-full object-cover h-48 md:h-64 transition-transform hover:scale-105 duration-700" />
        </div>
      </div>

      <!-- Escala de familiaridad 1-5 -->
      <div class="bg-indigo-50 border-2 border-indigo-200 rounded-[32px] p-6 mb-8">
        <p class="text-sm font-black text-black uppercase tracking-widest mb-2">
          <span class="text-indigo-600 mr-2">📊</span>
          ¿Cuánto sabes de este acontecimiento?
        </p>
        <p class="text-xs text-slate-600 font-medium mb-5">
          En una escala de 1 a 5, califica tu nivel de información o familiaridad con respecto a las inundaciones en Córdoba.
        </p>

        <div class="flex items-center gap-2 md:gap-4">
          <span class="text-[10px] font-black uppercase text-slate-500 shrink-0 w-16 text-center">No sé nada</span>
          <div class="flex-1 flex justify-between gap-2">
            <button
              v-for="val in 5" :key="val"
              type="button"
              @click="familiaridadTema = val"
              class="flex-1 h-14 rounded-2xl border-2 transition-all font-black text-lg"
              :class="familiaridadTema === val
                ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'border-slate-200 bg-white text-black hover:border-indigo-300'"
            >
              {{ val }}
            </button>
          </div>
          <span class="text-[10px] font-black uppercase text-slate-500 shrink-0 w-16 text-center">Lo entiendo muy bien</span>
        </div>

        <p v-if="familiaridadTema > 0" class="text-center text-xs font-black text-indigo-600 uppercase tracking-widest mt-4">
          {{ familiaridadLabel }}
        </p>
      </div>

      <!-- Botones -->
      <div class="flex gap-4">
        <button
          @click="goBack"
          class="flex items-center gap-2 px-8 py-5 rounded-[32px] border-2 border-slate-200 text-sm font-black uppercase tracking-widest text-black hover:border-slate-300 transition-all"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Atrás
        </button>
        <button
          @click="goNext"
          :disabled="!canContinue"
          class="flex-1 inline-flex items-center justify-center gap-4 rounded-[32px] px-10 py-5 text-sm font-black text-white uppercase tracking-[0.3em] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :class="canContinue ? 'bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] shadow-lg shadow-emerald-500/30' : 'bg-slate-300 text-slate-500'"
        >
          Continuar a Planeación
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confetti-piece {
  animation: confetti-fall linear forwards;
  border-radius: 2px;
  opacity: 0;
}

@keyframes confetti-fall {
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  80%  { opacity: 0.8; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
</style>
