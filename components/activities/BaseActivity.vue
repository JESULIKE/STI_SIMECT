<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  description?: string
  timeFormatted: string
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished' | 'checklist'
  maxScore?: number
  priorConfidence: number | null
  progress: {
    activity: number
    phase: number
    level: number
  }
  totalPoints: number
  // Nivel adaptativo del estudiante (para badge en header)
  studentLevel?: {
    code: string
    label: string
    emoji: string
    color: string
  } | null
}>()

const emit = defineEmits(['start', 'submit', 'pauseMetacognitiva', 'update:priorConfidence', 'requestHelp'])

const isEvaluating = computed(() => props.state === 'evaluating')
const localConfidence = computed({
  get: () => props.priorConfidence || 0,
  set: (val) => emit('update:priorConfidence', val)
})

const canSubmit = computed(() => {
  return props.state === 'in_progress' && localConfidence.value > 0
})

// Efecto de brillo al 90% (Sección 9.4)
const levelBarGlow = computed(() => props.progress.level >= 90)
</script>

<template>
  <div class="max-w-5xl mx-auto bg-white border-2 border-slate-100 rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col min-h-[650px] transition-all duration-500">
    
    <!-- Barra Superior con 3 Barras de Progreso (Sección 9.4) -->
    <header v-if="state !== 'idle' && state !== 'checklist' && !isEvaluating" class="p-6 border-b border-slate-100 bg-white/50 backdrop-blur-md z-20">
      <div class="flex flex-col md:flex-row gap-6 items-center">
        
        <!-- Puntos Totales (Sección 9.2) -->
        <div class="flex items-center gap-3 bg-slate-900 px-5 py-2 rounded-2xl shadow-lg transition-transform hover:scale-105 group">
          <span class="text-amber-400 text-lg">⭐</span>
          <span class="text-white font-black font-mono tracking-tighter text-xl">{{ totalPoints }}</span>
          <span class="text-[10px] text-white/50 font-bold uppercase tracking-widest hidden lg:block">Puntos</span>
        </div>

        <!-- Las 3 Barras -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <!-- 1. Barra de Actividad Actual -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-black">
              <span>Actividad</span><span>{{ progress.activity }}%</span>
            </div>
            <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 transition-all duration-700" :style="{ width: `${progress.activity}%` }"></div>
            </div>
          </div>

          <!-- 2. Barra de Fase Actual -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-indigo-500">
              <span>Fase Actual</span><span>{{ progress.phase }}%</span>
            </div>
            <div class="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 transition-all duration-700" :style="{ width: `${progress.phase}%` }"></div>
            </div>
          </div>

          <!-- 3. Barra de Nivel Completo -->
          <div class="space-y-1.5 relative">
            <div class="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">
              <span>Progreso Nivel</span><span>{{ progress.level }}%</span>
            </div>
            <div class="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-amber-500 transition-all duration-1000 relative" 
                :class="levelBarGlow ? 'animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]' : ''"
                :style="{ width: `${progress.level}%` }"
              >
                <div v-if="levelBarGlow" class="absolute inset-0 bg-white/30 animate-flash"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timer + Badge de Nivel -->
        <div class="hidden lg:flex items-center gap-3">
          <!-- Badge de nivel adaptativo -->
          <div
            v-if="studentLevel"
            class="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 font-black text-xs uppercase tracking-widest"
            :class="{
              'bg-emerald-50 border-emerald-200 text-emerald-700': studentLevel.color === 'emerald',
              'bg-indigo-50 border-indigo-200 text-indigo-700': studentLevel.color === 'indigo',
              'bg-red-50 border-red-200 text-red-700': studentLevel.color === 'red',
            }"
          >
            <span>{{ studentLevel.emoji }}</span>
            <span>Nivel {{ studentLevel.label }}</span>
          </div>
          <div class="px-4 py-2 bg-slate-50 rounded-2xl border-2 border-slate-100">
            <span class="text-xs font-mono text-slate-800 font-bold tracking-tighter">{{ timeFormatted }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Botón de Ayuda Contextual -->
    <button 
      v-if="state === 'in_progress'"
      @click="emit('requestHelp')"
      class="absolute bottom-8 right-8 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
    >
      <span class="text-2xl font-black group-hover:hidden">?</span>
      <svg class="w-6 h-6 hidden group-hover:block animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <div class="flex-1 relative overflow-y-auto custom-scrollbar">
      <!-- Pantallas: Checklist, Evaluación, Resultados -->
      <div v-if="state === 'checklist'" class="p-8 md:p-12 animate-in slide-in-from-bottom-8 duration-700">
        <slot name="checklist" />
      </div>

      <div v-if="isEvaluating" class="absolute inset-0 bg-white/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center animate-fade-in">
        <div class="w-20 h-20 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="mt-8 text-xl font-black text-black italic uppercase tracking-[0.3em] animate-pulse">Analizando Razonamiento...</p>
      </div>

      <div v-if="state === 'finished'" class="p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700">
        <slot name="results" />
      </div>

      <!-- Pantalla: Instrucciones -->
      <div v-if="state === 'idle'" class="p-8 md:p-16 flex flex-col items-center max-w-4xl mx-auto space-y-12 animate-fade-in text-center">
        <div class="space-y-4">
          <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Misión del Nivel</span>
          <h3 class="text-4xl md:text-5xl font-black text-black italic uppercase tracking-tight">{{ title }}</h3>
          <p class="text-slate-800 text-lg max-w-2xl mx-auto font-medium leading-relaxed italic">
            {{ description || "Demuestra tu capacidad de análisis para proteger el bosque seco tropical." }}
          </p>
        </div>
        <button @click="$emit('start')" class="px-20 py-6 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-sm rounded-3xl transition-all shadow-2xl hover:scale-105 active:scale-95">
          Comenzar Reto
        </button>
      </div>

      <!-- Pantalla: Actividad en Curso -->
      <div v-if="state === 'in_progress'" class="p-8 md:p-12">
        <div class="min-h-[40vh] mb-12">
          <slot />
        </div>
        
        <!-- Monitoreo de Confianza -->
        <div class="border-t-2 border-slate-50 pt-12 flex flex-col items-center space-y-10">
          <div class="text-center space-y-4">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-black block">¿Qué tan seguro(a) estás de esta respuesta?</span>
            <div class="flex gap-4">
              <button 
                v-for="star in 3" :key="star"
                @click="localConfidence = star"
                class="w-16 h-16 rounded-2xl border-2 transition-all duration-300 text-2xl flex items-center justify-center"
                :class="localConfidence >= star 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500 scale-110 shadow-lg shadow-amber-500/10' 
                  : 'border-slate-100 text-slate-200 hover:border-amber-200'"
              >
                ⭐
              </button>
            </div>
          </div>

          <button 
            :disabled="!canSubmit"
            @click="emit('submit')"
            class="px-24 py-6 font-black uppercase tracking-[0.5em] text-xs rounded-3xl transition-all shadow-2xl disabled:opacity-20 disabled:grayscale group"
            :class="canSubmit ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105' : 'bg-slate-300 text-slate-800'"
          >
            <span class="flex flex-col">
              <span>Enviar Respuesta</span>
              <span v-if="canSubmit" class="text-[8px] opacity-60 mt-1">¿Estás seguro(a) de tu lógica?</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.2); border-radius: 10px; }

@keyframes flash {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
.animate-flash { animation: flash 2s infinite linear; }
</style>
