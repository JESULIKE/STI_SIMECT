<script setup lang="ts">
import { computed } from 'vue'
import { useStudentStore } from '~/stores/student'

const props = defineProps<{
  title: string
  description?: string
  contexto?: string
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

const studentStore = useStudentStore()

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

const phaseInfo = computed(() => {
  const phase = studentStore.progress.phase
  if (phase === 'ANALYSIS') {
    return {
      label: 'Fase 1: Análisis de Información',
      icon: '🔍',
      color: 'bg-teal-500 border-teal-400 text-white shadow-teal-500/30 hover:bg-teal-400 hover:shadow-teal-400/40',
      glow: 'bg-teal-300'
    }
  } else if (phase === 'EVALUATION') {
    return {
      label: 'Fase 2: Evaluación de Información',
      icon: '⚖️',
      color: 'bg-violet-500 border-violet-400 text-white shadow-violet-500/30 hover:bg-violet-400 hover:shadow-violet-400/40',
      glow: 'bg-violet-300'
    }
  } else if (phase === 'JUDGMENT') {
    return {
      label: 'Fase 3: Formulación de Juicios',
      icon: '📝',
      color: 'bg-rose-500 border-rose-400 text-white shadow-rose-500/30 hover:bg-rose-400 hover:shadow-rose-400/40',
      glow: 'bg-rose-300'
    }
  }
  return {
    label: 'Entrenamiento Crítico',
    icon: '🧠',
    color: 'bg-sky-500 border-sky-400 text-white shadow-sky-500/30 hover:bg-sky-400',
    glow: 'bg-sky-300'
  }
})
</script>


<template>
  <div class="max-w-5xl mx-auto bg-white border-2 border-slate-100 rounded-[48px] shadow-2xl overflow-hidden relative flex flex-col min-h-[650px] transition-all duration-500">
    
    <!-- Barra Superior Educativa (Panel de Progreso) -->
    <header id="tour-progress-bars" v-if="state !== 'idle' && state !== 'checklist' && !isEvaluating" class="p-4 sm:p-5 border-b border-sky-200 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 relative overflow-hidden z-20 shadow-md">
      
      <!-- Destellos de luz suaves en el fondo -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div :class="['w-72 h-72 rounded-full absolute -top-20 -left-20 blur-3xl opacity-30 animate-pulse-slow transition-all duration-1000', phaseInfo.glow]"></div>
        <div :class="['w-72 h-72 rounded-full absolute -bottom-20 -right-20 blur-3xl opacity-30 animate-pulse-slow transition-all duration-1000', phaseInfo.glow]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
      </div>

      <div class="relative z-10 flex flex-col lg:flex-row gap-4 items-center w-full justify-center lg:justify-between flex-wrap px-1">
        
        <!-- Badge de Fase Activa -->
        <div :class="['flex items-center gap-3 px-4 py-2.5 rounded-3xl border-2 font-black uppercase tracking-wider transition-all duration-500 hover:scale-105 shrink-0 w-full lg:w-auto justify-center shadow-lg', phaseInfo.color]">
          <div class="w-9 h-9 rounded-full bg-white border-2 border-white/60 flex items-center justify-center text-xl shadow-sm animate-bounce-subtle shrink-0">
            <span>{{ phaseInfo.icon }}</span>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-[9px] text-white/80 tracking-widest leading-none mb-1 font-black uppercase">MISIÓN ACTIVA</span>
            <span class="text-xs font-black tracking-wider leading-none text-white drop-shadow">{{ phaseInfo.label }}</span>
          </div>
        </div>

        <!-- Los 3 Círculos de Progreso -->
        <div class="flex-grow flex flex-row items-center justify-around gap-3 sm:gap-4 bg-white/40 border border-white/60 rounded-[28px] p-2.5 px-3 sm:px-5 max-w-2xl shadow-inner backdrop-blur-sm w-full lg:w-auto">
          
          <!-- 1. Círculo Actividad -->
          <div class="flex items-center gap-2.5 group transition-transform hover:scale-105">
            <div class="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="19" stroke="#0f172a" stroke-width="4" fill="transparent" />
                <circle cx="24" cy="24" r="19" stroke="#059669" stroke-width="4" fill="transparent"
                        stroke-linecap="round"
                        stroke-dasharray="119.38"
                        :stroke-dashoffset="119.38 - (progress.activity / 100) * 119.38"
                        class="transition-all duration-700 ease-out drop-shadow-[0_0_5px_#059669]" />
              </svg>
              <span class="text-[10px] font-black text-slate-900 font-mono z-10">{{ progress.activity }}%</span>
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-[8px] font-black uppercase tracking-widest text-slate-700 leading-tight mb-0.5">ACTIVIDAD</span>
              <span class="text-[11px] font-black text-slate-900 leading-none">Desafío</span>
            </div>
          </div>

          <!-- 2. Círculo Fase -->
          <div class="flex items-center gap-2.5 group transition-transform hover:scale-105">
            <div class="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="19" stroke="#0f172a" stroke-width="4" fill="transparent" />
                <circle cx="24" cy="24" r="19" stroke="#7C3AED" stroke-width="4" fill="transparent"
                        stroke-linecap="round"
                        stroke-dasharray="119.38"
                        :stroke-dashoffset="119.38 - (progress.phase / 100) * 119.38"
                        class="transition-all duration-700 ease-out drop-shadow-[0_0_5px_#7C3AED]" />
              </svg>
              <span class="text-[10px] font-black text-slate-900 font-mono z-10">{{ progress.phase }}%</span>
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-[8px] font-black uppercase tracking-widest text-slate-700 leading-tight mb-0.5">FASE ACTUAL</span>
              <span class="text-[11px] font-black text-slate-900 leading-none">Ruta</span>
            </div>
          </div>

          <!-- 3. Círculo Nivel -->
          <div class="flex items-center gap-2.5 group transition-transform hover:scale-105">
            <div class="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="19" stroke="#0f172a" stroke-width="4" fill="transparent" />
                <circle cx="24" cy="24" r="19" stroke="#D97706" stroke-width="4" fill="transparent"
                        stroke-linecap="round"
                        stroke-dasharray="119.38"
                        :stroke-dashoffset="119.38 - (progress.level / 100) * 119.38"
                        class="transition-all duration-1000 ease-out drop-shadow-[0_0_5px_#D97706]"
                        :class="levelBarGlow ? 'animate-pulse' : ''" />
              </svg>
              <span class="text-[10px] font-black text-slate-900 font-mono z-10">{{ progress.level }}%</span>
            </div>
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-[8px] font-black uppercase tracking-widest text-slate-700 leading-tight mb-0.5">PROGRESO</span>
              <span class="text-[11px] font-black text-slate-900 leading-none">Nivel</span>
            </div>
          </div>

        </div>

        <!-- Controles (Timer & Rango) -->
        <div class="flex items-center gap-2.5 shrink-0 justify-center">
          <!-- Badge de nivel adaptativo -->
          <div
            v-if="studentLevel"
            class="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 font-black text-[9px] uppercase tracking-widest shadow-sm transition-transform hover:scale-105"
            :class="{
              'bg-white/60 border-white text-teal-800': studentLevel.color === 'emerald',
              'bg-white/60 border-white text-violet-800': studentLevel.color === 'indigo',
              'bg-white/60 border-white text-rose-700': studentLevel.color === 'red',
            }"
          >
            <span class="text-sm animate-bounce-subtle shrink-0">{{ studentLevel.emoji }}</span>
            <span class="truncate max-w-[110px]">Rango: {{ studentLevel.label }}</span>
          </div>
          <!-- Contador de Tiempo -->
          <div class="px-3 py-2 bg-white/50 border-2 border-white/80 rounded-2xl shadow-sm backdrop-blur-sm">
            <span class="text-xs font-mono text-sky-900 font-black tracking-widest">{{ timeFormatted }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Botón de Ayuda Contextual -->
    <button 
      id="tour-help-btn"
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
            {{ description || "Demuestra tu capacidad de análisis para gestionar la emergencia en el río Sinú." }}
          </p>
        </div>
        <button @click="$emit('start')" class="px-20 py-6 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-sm rounded-3xl transition-all shadow-2xl hover:scale-105 active:scale-95">
          Comenzar Reto
        </button>
      </div>

      <!-- Pantalla: Actividad en Curso -->
      <div v-if="state === 'in_progress'" class="p-8 md:p-12">
        
        <!-- ENUNCIADO / CONTEXTO -->
        <div v-if="contexto" class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 shadow-sm text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contexto del Evento</p>
          <p class="text-lg font-medium text-black leading-relaxed italic">"{{ contexto }}"</p>
        </div>

        <div id="tour-workspace" class="min-h-[40vh] mb-12">
          <slot />
        </div>
        
        <!-- Monitoreo de Confianza -->
        <div class="border-t-2 border-slate-50 pt-12 flex flex-col items-center space-y-10">
          <div id="tour-confidence" class="text-center space-y-4">
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
            id="tour-submit"
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

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 12px rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.45); border-color: rgba(99, 102, 241, 0.8); }
}
.animate-pulse-glow {
  animation: pulse-glow 3s infinite ease-in-out;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(1.1); }
}
.animate-pulse-slow {
  animation: pulse-slow 5s infinite ease-in-out;
}
</style>
