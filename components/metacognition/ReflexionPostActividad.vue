<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

const emit = defineEmits(['continuar'])

const reflection = reactive({
  clarity: 0,         // ¿Qué tan claro es para ti qué pasó en Montería?
  factsOpinions: 0,   // ¿Distinguiste bien hechos de opiniones?
  concreteData: 0,    // ¿Tus hechos incluyen datos concretos (cifras, fechas)?
  followedStrategy: 0, // ¿Seguiste la estrategia que planeaste?
  selfEval: 0,        // Autoevaluación general 1-5
  transfer: '',       // ¿Usar fuera del aula? Sí/Tal vez/No
  difficult: '',      // ¿Qué fue lo más difícil?
  differentNext: ''   // ¿Qué harías diferente?
})

const isSubmitting = ref(false)

const isReflectionValid = computed(() => {
  return (
    reflection.clarity > 0 &&
    reflection.factsOpinions > 0 &&
    reflection.concreteData > 0 &&
    reflection.followedStrategy > 0 &&
    reflection.transfer !== ''
  )
})

const enviarReflexion = async () => {
  if (!isReflectionValid.value) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1000))
  emit('continuar', { ...reflection })
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
    <!-- Header -->
    <div class="text-center space-y-4">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 block">Meta-Reflexión Final</span>
      <h3 class="text-4xl font-black text-black italic uppercase tracking-tight">¿Cómo fue tu proceso hoy?</h3>
      <p class="max-w-2xl mx-auto text-slate-700 font-medium italic text-sm leading-relaxed">
        "Detenerte a pensar sobre lo que aprendiste duplica tu capacidad de éxito." <br>
        <span class="text-[10px] not-italic font-black text-slate-400 uppercase tracking-widest">— Modelo de Flavell</span>
      </p>
    </div>

    <!-- Panel de Autoevaluación (Reemplaza pregunta 01) -->
    <div class="bg-white/50 border-2 border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm space-y-8">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/20">
          📊
        </div>
        <div>
          <h4 class="text-lg font-black text-black leading-none uppercase italic tracking-tight">¿Cómo va tu comprensión?</h4>
          <p class="text-xs text-slate-500 font-bold mt-1">Evalúa tu desempeño para que el sistema se adapte a ti.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pregunta 1 -->
        <div class="bg-white border-2 border-slate-50 rounded-3xl p-6 transition-all hover:border-indigo-100 group">
          <p class="text-sm font-bold text-black mb-4 leading-tight">¿Qué tan claro es para ti qué pasó en Montería?</p>
          <div class="flex gap-2">
            <button v-for="s in 5" :key="s" @click="reflection.clarity = s" class="text-2xl transition-transform hover:scale-125" :class="reflection.clarity >= s ? 'grayscale-0' : 'grayscale opacity-20'">
              ⭐
            </button>
          </div>
        </div>

        <!-- Pregunta 2 -->
        <div class="bg-white border-2 border-slate-50 rounded-3xl p-6 transition-all hover:border-indigo-100 group">
          <p class="text-sm font-bold text-black mb-4 leading-tight">¿Distinguiste bien hechos de opiniones?</p>
          <div class="flex gap-2">
            <button v-for="s in 5" :key="s" @click="reflection.factsOpinions = s" class="text-2xl transition-transform hover:scale-125" :class="reflection.factsOpinions >= s ? 'grayscale-0' : 'grayscale opacity-20'">
              ⭐
            </button>
          </div>
        </div>

        <!-- Pregunta 3 -->
        <div class="bg-white border-2 border-slate-50 rounded-3xl p-6 transition-all hover:border-indigo-100 group">
          <p class="text-sm font-bold text-black mb-4 leading-tight">¿Tus hechos incluyen datos concretos (cifras, fechas)?</p>
          <div class="flex gap-2">
            <button v-for="s in 5" :key="s" @click="reflection.concreteData = s" class="text-2xl transition-transform hover:scale-125" :class="reflection.concreteData >= s ? 'grayscale-0' : 'grayscale opacity-20'">
              ⭐
            </button>
          </div>
        </div>

        <!-- Pregunta 4 -->
        <div class="bg-white border-2 border-slate-50 rounded-3xl p-6 transition-all hover:border-indigo-100 group">
          <p class="text-sm font-bold text-black mb-4 leading-tight">¿Seguiste la estrategia que planeaste?</p>
          <div class="flex gap-2">
            <button v-for="s in 5" :key="s" @click="reflection.followedStrategy = s" class="text-2xl transition-transform hover:scale-125" :class="reflection.followedStrategy >= s ? 'grayscale-0' : 'grayscale opacity-20'">
              ⭐
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Otras Preguntas -->
    <div class="space-y-12">
      
      <!-- Transferencia -->
      <div class="space-y-5">
        <label class="block text-xs font-black text-black uppercase tracking-[0.2em] px-2">
          ¿Crees que podrías usar esto fuera del aula?
        </label>
        <div class="grid grid-cols-3 gap-4">
          <button 
            v-for="opt in ['Sí', 'Tal vez', 'No']" :key="opt"
            @click="reflection.transfer = opt"
            class="py-5 rounded-3xl border-2 font-black uppercase tracking-widest text-xs transition-all shadow-sm"
            :class="reflection.transfer === opt ? 'border-indigo-600 bg-indigo-600 text-white shadow-indigo-600/20 shadow-lg' : 'border-slate-100 bg-white text-black hover:border-slate-200'"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- Dificultad y Mejora -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <label class="block text-[10px] font-black text-black uppercase tracking-widest px-2">
            ¿Qué fue lo más difícil?
          </label>
          <input
            v-model="reflection.difficult"
            type="text"
            class="w-full rounded-3xl border-2 border-slate-100 bg-white p-6 text-sm text-black placeholder:text-slate-300 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
            placeholder="Ej: Clasificar las causas..."
          />
        </div>
        <div class="space-y-4">
          <label class="block text-[10px] font-black text-black uppercase tracking-widest px-2">
            ¿Qué harías diferente?
          </label>
          <input
            v-model="reflection.differentNext"
            type="text"
            class="w-full rounded-3xl border-2 border-slate-100 bg-white p-6 text-sm text-black placeholder:text-slate-300 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
            placeholder="Ej: Leer más despacio..."
          />
        </div>
      </div>

      <!-- Submit -->
      <div class="pt-8 text-center">
        <button
          @click="enviarReflexion"
          :disabled="!isReflectionValid || isSubmitting"
          class="w-full py-7 bg-slate-900 text-white font-black uppercase tracking-[0.5em] text-xs rounded-[32px] transition-all shadow-2xl disabled:opacity-20 hover:scale-[1.01] active:scale-95"
        >
          {{ isSubmitting ? 'Guardando Reflexión...' : 'Finalizar Actividad y Guardar Progreso' }}
        </button>
        <p class="mt-5 text-[10px] font-bold text-black uppercase tracking-widest opacity-40">
          Esta reflexión es obligatoria para tu puntaje de metacognición.
        </p>
      </div>
    </div>
  </div>
</template>
