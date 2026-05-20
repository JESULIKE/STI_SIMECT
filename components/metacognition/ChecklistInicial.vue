<template>
  <div class="max-w-2xl mx-auto animate-slide-up relative">
    
    <!-- Barra de Progreso del Checklist -->
    <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-sm">
      <div 
        class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <!-- Header -->
    <div class="mb-10 text-center md:text-left">
      <div class="flex flex-col md:flex-row justify-between items-center mb-2 gap-4">
        <h2 class="text-3xl font-black tracking-tight uppercase italic text-black">Planificación de Sesión</h2>
        <span class="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-mono font-bold text-sm">Paso {{ completedCount }}/5</span>
      </div>
      <p class="text-black text-sm font-black italic">
        Modelo de Flavell: Activa tu mente antes de comenzar.
      </p>
    </div>

    <!-- Formulario Metacognitivo -->
    <div class="space-y-8">
      <form @submit.prevent="handleSubmit" class="space-y-12 pb-12">
        
        <!-- 1. Plan de resolución -->
        <div class="space-y-4">
          <label class="block text-sm font-black text-black uppercase tracking-widest">
            <span class="text-indigo-600 mr-2">01</span> ¿Cómo planeas resolver este desafío?
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              v-for="opt in ['Analizando cada detalle', 'Comparando opciones', 'Buscando pistas clave', 'Siguiendo el paso a paso']" :key="opt"
              type="button"
              @click="formData.q1 = opt"
              class="p-5 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all text-left flex items-center gap-3"
              :class="formData.q1 === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-black'"
            >
              <div class="w-2 h-2 rounded-full" :class="formData.q1 === opt ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200'"></div>
              {{ opt }}
            </button>
          </div>
        </div>

        <!-- 2. ¿Qué espero aprender? -->
        <div class="space-y-4" :class="formData.q1 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
          <label class="block text-sm font-black text-black uppercase tracking-widest">
            <span class="text-indigo-500 mr-2">02</span> ¿Qué espero aprender en esta sesión?
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              v-for="opt in ['Identificar datos precisos', 'Diferenciar hechos', 'Reconocer errores', 'Mejorar mi comprensión']" :key="opt"
              type="button"
              @click="formData.q2 = opt"
              class="p-5 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all text-left flex items-center gap-3"
              :class="formData.q2 === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-black'"
            >
              <div class="w-2 h-2 rounded-full" :class="formData.q2 === opt ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200'"></div>
              {{ opt }}
            </button>
          </div>
        </div>

        <!-- 3. Confianza Inicial (1-5) -->
        <div class="space-y-4" :class="formData.q2 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
          <label class="block text-sm font-black text-black uppercase tracking-widest">
            <span class="text-indigo-500 mr-2">03</span> ¿Qué tan seguro(a) me siento sobre este tema?
          </label>
          <div class="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
            <span class="text-[10px] font-black uppercase text-black">Nada</span>
            <div class="flex-1 flex justify-between px-4">
              <button
                v-for="val in 5" :key="val" type="button"
                @click="formData.q3 = val"
                class="flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all font-black text-lg"
                :class="formData.q3 === val ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white text-black'"
              >
                {{ val }}
              </button>
            </div>
            <span class="text-[10px] font-black uppercase text-black">Mucho</span>
          </div>
        </div>

        <!-- 4. Estrategias -->
        <div class="space-y-4" :class="formData.q3 > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
          <label class="block text-sm font-black text-black uppercase tracking-widest">
            <span class="text-indigo-500 mr-2">04</span> ¿Qué estrategias usaré para aprender mejor?
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              v-for="opt in ['Tomar notas', 'Leer despacio', 'Releer lo difícil', 'Relacionar ideas']" :key="opt"
              type="button"
              @click="formData.q4 = opt"
              class="p-5 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all text-left flex items-center gap-3"
              :class="formData.q4 === opt ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-black'"
            >
              <div class="w-2 h-2 rounded-full" :class="formData.q4 === opt ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-200'"></div>
              {{ opt }}
            </button>
          </div>
        </div>

        <!-- 5. Entorno sin distracciones -->
        <div class="pt-4" :class="formData.q4 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
          <label class="relative flex items-center gap-4 p-6 rounded-[32px] border-2 border-slate-100 bg-white cursor-pointer group hover:border-indigo-500/50 transition-all shadow-sm">
            <input 
              type="checkbox" 
              v-model="formData.q5" 
              class="w-6 h-6 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
            >
            <span class="text-xs font-bold text-black uppercase tracking-[0.1em]">
              Confirmo que estoy en un entorno sin distracciones
            </span>
          </label>
        </div>

        <!-- Submit -->
        <div class="pt-10 text-center">
          <button
            type="submit"
            class="w-full inline-flex items-center justify-center gap-4 rounded-[40px] px-12 py-7 text-sm font-black text-white uppercase tracking-[0.4em] transition-all shadow-2xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
            :class="isFormValid ? 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] shadow-indigo-500/40' : 'bg-slate-300 text-black'"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'Iniciando Sesión...' : 'Comenzar Aprendizaje' }}
            <svg v-if="!isSubmitting" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

const emit = defineEmits(['submit'])

const formData = reactive({
  q1: '', // Plan de resolución
  q2: '', // Expectativa de aprendizaje
  q3: 0,  // Confianza inicial 1-5
  q4: '', // Estrategia
  q5: false // Entorno sin distracciones (antes q6)
})

const isSubmitting = ref(false)

const completedCount = computed(() => {
  let count = 0
  if (formData.q1) count++
  if (formData.q2) count++
  if (formData.q3 > 0) count++
  if (formData.q4) count++
  if (formData.q5) count++
  return count
})

const progressPercent = computed(() => (completedCount.value / 5) * 100)
const isFormValid = computed(() => completedCount.value === 5)

const handleSubmit = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1200))
  emit('submit', { 
    ...formData,
    timestamp: new Date().toISOString()
  })
  isSubmitting.value = false
}
</script>

<style scoped>
.animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
