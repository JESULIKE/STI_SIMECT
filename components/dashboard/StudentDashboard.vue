<script setup lang="ts">
import { useStudentStore } from '~/stores/student'

const props = defineProps<{
  user: any
}>()

const studentStore = useStudentStore()

// Datos reales para la narrativa basados en el Modelo de Dominio
const nextChapter = {
  title: 'Inundaciones en Córdoba',
  description: 'Los informes satelitales confirman una tendencia alarmante en la región Caribe. Descubre los datos detrás de la pérdida de biodiversidad.',
  isNew: true,
  image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=600&auto=format&fit=crop'
}

const phases = [
  { id: 'ANALYSIS', label: 'Análisis', icon: '🔍', color: 'from-blue-500 to-indigo-600' },
  { id: 'SYNTHESIS', label: 'Síntesis', icon: '🧬', color: 'from-emerald-400 to-teal-600' },
  { id: 'EVALUATION', label: 'Evaluación', icon: '⚖️', color: 'from-amber-400 to-orange-600' }
]

const currentPhaseIndex = computed(() => {
  return phases.findIndex(p => p.id === studentStore.progress.phase)
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-10 py-4 animate-fade-in">

    <!-- 1. Top Stats Bar (Estilo Videojuego) -->
    <div class="grid grid-cols-3 gap-4 sm:gap-6">
      <!-- Puntos -->
      <div
        class="bg-white rounded-2xl p-4 border-b-4 border-slate-200 flex flex-col items-center justify-center shadow-sm transition-transform hover:scale-105">
        <span class="text-2xl mb-1">⭐</span>
        <span class="text-xs font-black text-black uppercase tracking-widest">Puntos</span>
        <span class="text-2xl font-black text-indigo-600">{{ studentStore.progress.totalPoints
          }}</span>
      </div>

      <!-- Nivel -->
      <div
        class="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4 border-b-4 border-indigo-900 flex flex-col items-center justify-center shadow-lg shadow-indigo-600/20 transition-transform hover:scale-105 scale-110 z-10">
        <span class="text-2xl mb-1">🏆</span>
        <span class="text-xs font-black text-indigo-200 uppercase tracking-widest">Nivel</span>
        <span class="text-2xl font-black text-white">{{ studentStore.currentLevelLabel }}</span>
      </div>

      <!-- Racha -->
      <div
        class="bg-white rounded-2xl p-4 border-b-4 border-slate-200 flex flex-col items-center justify-center shadow-sm transition-transform hover:scale-105">
        <span class="text-2xl mb-1">🔥</span>
        <span class="text-xs font-black text-black uppercase tracking-widest">Racha</span>
        <span class="text-2xl font-black text-orange-500">{{ studentStore.progress.currentStreak }} días</span>
      </div>
    </div>

    <!-- 2. Visual Progress (Phases) -->
    <div
      class="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
      <h2 class="text-center text-sm font-bold text-slate-800 uppercase tracking-[0.2em] mb-8">
        Progreso de la Etapa</h2>
      <div class="relative flex items-center justify-between px-4 sm:px-10">
        <!-- Línea de fondo -->
        <div class="absolute left-10 right-10 h-1 bg-slate-200 top-1/2 -translate-y-1/2"></div>
        <!-- Línea activa -->
        <div class="absolute left-10 h-1 bg-indigo-500 top-1/2 -translate-y-1/2 transition-all duration-1000"
          :style="{ width: `calc(${(currentPhaseIndex / (phases.length - 1)) * 100}% - 0px)` }"></div>

        <!-- Nodos de Fase -->
        <div v-for="(phase, index) in phases" :key="phase.id" class="relative z-10 flex flex-col items-center">
          <div :class="[
            'w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-all duration-500 border-4',
            index <= currentPhaseIndex
              ? 'bg-gradient-to-br border-white ' + phase.color
              : 'bg-slate-200 border-transparent text-black'
          ]">
            {{ phase.icon }}
          </div>
          <span :class="[
            'absolute -bottom-8 whitespace-nowrap text-xs font-bold uppercase tracking-wider',
            index === currentPhaseIndex ? 'text-indigo-600 scale-110' : 'text-black'
          ]">
            {{ phase.label }}
          </span>
        </div>
      </div>
      <div class="mt-16 text-center">
        <p class="text-slate-800 text-sm">
          Estás en la fase de <span class="font-bold text-indigo-600">{{
            studentStore.progress.phase }}</span>.
          ¡Faltan pocas actividades para completar el nivel!
        </p>
      </div>
    </div>

    <!-- 3. Narrative Chapter Highlight -->
    <div v-if="nextChapter.isNew"
      class="group relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl transition-all hover:shadow-indigo-500/20 animate-slide-up">
      <div class="flex flex-col md:flex-row h-full">
        <!-- Imagen -->
        <div class="md:w-1/3 h-48 md:h-auto overflow-hidden">
          <img :src="nextChapter.image"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Capítulo Narrativo" />
          <div
            class="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent md:block hidden">
          </div>
        </div>
        <!-- Contenido -->
        <div class="flex-1 p-8 flex flex-col justify-center">
          <div class="inline-flex items-center gap-2 text-indigo-400 mb-2">
            <span class="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span class="text-xs font-black uppercase tracking-widest">Nuevo Capítulo Disponible</span>
          </div>
          <h3 class="text-2xl font-serif mb-3 tracking-tight">{{ nextChapter.title }}</h3>
          <p class="text-black text-sm leading-relaxed line-clamp-2 mb-6">
            {{ nextChapter.description }}
          </p>
          <div>
             <NuxtLink to="/narrative/1" class="text-indigo-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-indigo-300 transition-colors">
               Explorar Narrativa
               <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Main CTA (Large Green Button) -->
    <div class="flex flex-col items-center pt-6 pb-12">
      <div v-if="studentStore.isChecklistPending" class="flex flex-col items-center animate-bounce">
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-3 mb-4 text-amber-500 text-sm font-bold flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Debes completar tu checklist antes de continuar
        </div>
      </div>

      <NuxtLink 
        :to="studentStore.isChecklistPending ? '/learn/checklist' : `/learn/${studentStore.progress.level}/${studentStore.progress.phase}`"
        class="group relative inline-flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        <!-- Brillo de fondo -->
        <div v-if="!studentStore.isChecklistPending" class="absolute -inset-4 bg-emerald-500 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
        <div v-else class="absolute -inset-4 bg-amber-500 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
        
        <!-- Botón Principal -->
        <div 
          :class="[
            'relative px-12 py-6 rounded-2xl border-b-8 flex items-center gap-4 transition-colors',
            studentStore.isChecklistPending 
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-800' 
              : 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-800'
          ]"
        >
          <span class="text-4xl">{{ studentStore.isChecklistPending ? '📝' : '🚀' }}</span>
          <div class="flex flex-col items-start text-left">
            <span class="text-xs font-black uppercase tracking-[0.2em] leading-none mb-1" :class="studentStore.isChecklistPending ? 'text-amber-100' : 'text-emerald-100'">
              {{ studentStore.isChecklistPending ? 'Pendiente' : 'Continuar Aventura' }}
            </span>
            <span class="text-3xl font-black text-white leading-none">
              {{ studentStore.isChecklistPending ? 'HACER CHECKLIST' : 'CONTINUAR' }}
            </span>
          </div>
          <svg class="w-8 h-8 text-white/50 group-hover:text-white transition-colors ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </NuxtLink>
      
      <p class="mt-8 text-xs font-bold text-black uppercase tracking-widest">
        Siguiente objetivo: Completar fase de {{ phases[currentPhaseIndex]?.label }}
      </p>
    </div>

  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
