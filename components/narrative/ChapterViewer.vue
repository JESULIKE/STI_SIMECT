<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  chapterData: {
    titulo: string
    subtitulo: string
    contenido: string
    subPhase: string
  }
}>()

const emit = defineEmits(['complete'])

const { user } = useUserSession()
const isReady = ref(false)

const personalizedContent = computed(() => {
  const name = user.value?.name || 'Estudiante'
  return props.chapterData.contenido
    .replace(/\[NOMBRE\]/g, name)
    .replace(/Manuel/g, name)
})

const paragraphs = computed(() =>
  personalizedContent.value.split('\n\n').filter(p => p.trim().length > 0)
)

// Mapa de etiqueta de subfase y emoji temático
const subPhaseConfig = computed(() => {
  const map: Record<string, { label: string; emoji: string; color: string }> = {
    '1.1': { label: 'Subfase 1.1 — Identificación de Datos',      emoji: '📊', color: 'text-indigo-600' },
    '1.2': { label: 'Subfase 1.2 — Propósitos y Acciones',        emoji: '🎯', color: 'text-indigo-600' },
    '2.1': { label: 'Subfase 2.1 — Credibilidad de Fuentes',      emoji: '🔍', color: 'text-indigo-600' },
    '2.2': { label: 'Subfase 2.2 — Validez de Argumentos',        emoji: '⚖️', color: 'text-indigo-600' },
    '3.1': { label: 'Subfase 3.1 — Toma de Decisiones',           emoji: '🧭', color: 'text-indigo-600' },
    '3.2': { label: 'Subfase 3.2 — Soluciones Definitivas',       emoji: '🌱', color: 'text-indigo-600' },
  }
  return map[props.chapterData.subPhase || ''] ?? { label: 'Contexto de la Actividad', emoji: '📖', color: 'text-indigo-600' }
})

onMounted(() => {
  setTimeout(() => { isReady.value = true }, 400)
})
</script>

<template>
  <div class="fixed inset-0 z-[150] bg-white overflow-y-auto">
    <div class="min-h-screen max-w-3xl mx-auto px-6 py-12 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <!-- Barra superior de progreso decorativa -->
      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-10 shadow-sm">
        <div class="h-full w-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"></div>
      </div>

      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
          <h2 class="text-3xl font-black tracking-tight uppercase italic text-black">
            {{ chapterData.titulo }}
          </h2>
          <span class="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-mono font-bold text-sm shrink-0">
            {{ subPhaseConfig.emoji }} {{ chapterData.subtitulo }}
          </span>
        </div>
        <p class="text-black text-sm font-black italic">
          {{ subPhaseConfig.label }}
        </p>
      </div>

      <!-- Aviso educativo (misma estética que checklist) -->
      <div class="flex items-center gap-4 p-5 rounded-[32px] border-2 border-indigo-500/20 bg-indigo-50 mb-8">
        <div class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0"></div>
        <p class="text-xs font-bold text-indigo-700 uppercase tracking-widest">
          Lee este contexto con atención — las actividades que siguen están basadas en esta historia
        </p>
      </div>

      <!-- Texto narrativo en tarjeta blanca con borde slate -->
      <div class="bg-white border-2 border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-6 mb-10">
        <p
          v-for="(paragraph, index) in paragraphs"
          :key="index"
          class="text-black text-lg leading-relaxed font-medium"
          :class="index === 0
            ? 'first-letter:text-4xl first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-indigo-600 first-letter:leading-none'
            : ''"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- Datos clave destacados (cifras mencionadas en el texto) -->
      <div v-if="chapterData.subPhase === '1.2'" class="grid grid-cols-2 gap-4 mb-10">
        <div class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 flex items-center gap-4">
          <span class="text-3xl">🏃</span>
          <div>
            <span class="block text-sm font-black text-black uppercase">Acción propuesta</span>
            <span class="block text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Evacuación preventiva</span>
          </div>
        </div>
        <div class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 flex items-center gap-4">
          <span class="text-3xl">👨‍👩‍👧</span>
          <div>
            <span class="block text-sm font-black text-black uppercase">Población prioritaria</span>
            <span class="block text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Niños y ancianos</span>
          </div>
        </div>
      </div>

      <div v-else-if="chapterData.subPhase === '2.1'" class="grid grid-cols-2 gap-4 mb-10">
        <div class="bg-orange-50 border-2 border-orange-200 rounded-3xl p-5 text-center">
          <span class="block text-2xl mb-1">⚠️</span>
          <span class="text-[10px] font-black uppercase tracking-widest text-orange-700">Audio WhatsApp anónimo</span>
          <span class="block text-xs font-bold text-orange-600 mt-1">Sin respaldo institucional</span>
        </div>
        <div class="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-5 text-center">
          <span class="block text-2xl mb-1">✅</span>
          <span class="text-[10px] font-black uppercase tracking-widest text-indigo-700">Boletín oficial Alcaldía</span>
          <span class="block text-xs font-bold text-indigo-600 mt-1">Fuente institucional</span>
        </div>
      </div>

      <div v-else-if="chapterData.subPhase === '2.2'" class="grid grid-cols-1 gap-4 mb-10">
        <div class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 flex items-start gap-4">
          <span class="text-2xl shrink-0">❌</span>
          <div>
            <span class="block text-sm font-black text-black uppercase tracking-tight">Falacia detectada por Mateo</span>
            <p class="text-xs text-black font-medium mt-1 italic">"En 2010 no se inundó, esta vez tampoco pasará nada."</p>
            <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">El pasado no garantiza el futuro</p>
          </div>
        </div>
      </div>

      <!-- Botón de continuar -->
      <div class="pt-4 pb-16 text-center transition-all duration-700" :class="isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'">
        <button
          @click="emit('complete')"
          class="w-full inline-flex items-center justify-center gap-4 rounded-[40px] px-12 py-7 text-sm font-black text-white uppercase tracking-[0.4em] bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] transition-all shadow-2xl shadow-indigo-500/30"
        >
          Comenzar Actividades
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
p { text-wrap: balance; }
</style>
