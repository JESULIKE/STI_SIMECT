<template>
  <div class="max-w-2xl mx-auto animate-slide-up relative">

    <!-- Barra de Progreso -->
    <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-sm">
      <div
        class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <!-- Header -->
    <div class="mb-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 class="text-3xl font-black tracking-tight uppercase italic text-black">Planeación</h2>
          <p class="text-black text-sm font-black italic mt-1">Primer momento metacognitivo — JOL (Judgments of Learning)</p>
        </div>
        <span class="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-mono font-bold text-sm shrink-0">
          {{ completedCount }}/5 completado
        </span>
      </div>

      <!-- Aviso pedagógico -->
      <div class="flex items-start gap-3 p-5 rounded-[24px] border-2 border-amber-200 bg-amber-50">
        <span class="text-xl shrink-0">🧠</span>
        <p class="text-xs font-bold text-amber-800 leading-relaxed">
          Antes de comenzar, reflexiona honestamente sobre lo que sabes y lo que sientes.
          Estas respuestas ayudan al sistema a adaptar tu experiencia de aprendizaje.
          <strong>No hay respuestas correctas o incorrectas.</strong>
        </p>
      </div>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="handleSubmit" class="space-y-10 pb-12">

      <!-- JOL 1: Seguridad sin ayuda -->
      <div class="space-y-4">
        <label class="block text-sm font-black text-black uppercase tracking-widest">
          <span class="text-indigo-600 mr-2">01</span>
          Desde este primer momento, ¿qué tan seguro te sientes de poder realizar el ejercicio
          <strong>sin pedir ayuda al tutor</strong>?
        </label>
        <div class="flex items-center gap-2 md:gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Nada seguro</span>
          <div class="flex-1 flex justify-between gap-2">
            <button
              v-for="val in 5" :key="val" type="button"
              @click="formData.jol1 = val"
              class="flex-1 h-12 rounded-xl border-2 transition-all font-black text-lg"
              :class="formData.jol1 === val ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white text-black hover:border-indigo-300'"
            >{{ val }}</button>
          </div>
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Muy seguro</span>
        </div>
      </div>

      <!-- JOL 2: Seguridad del tema -->
      <div class="space-y-4" :class="formData.jol1 > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
        <label class="block text-sm font-black text-black uppercase tracking-widest">
          <span class="text-indigo-500 mr-2">02</span>
          ¿Te sientes seguro del <strong>tema</strong> que se va a tratar en SIMECT?
        </label>
        <div class="flex items-center gap-2 md:gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Nada seguro</span>
          <div class="flex-1 flex justify-between gap-2">
            <button
              v-for="val in 5" :key="val" type="button"
              @click="formData.jol2 = val"
              class="flex-1 h-12 rounded-xl border-2 transition-all font-black text-lg"
              :class="formData.jol2 === val ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white text-black hover:border-indigo-300'"
            >{{ val }}</button>
          </div>
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Muy seguro</span>
        </div>
      </div>

      <!-- JOL 3: Tiempo estimado Fase 1 -->
      <div class="space-y-4" :class="formData.jol2 > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
        <label class="block text-sm font-black text-black uppercase tracking-widest">
          <span class="text-indigo-500 mr-2">03</span>
          De acuerdo con la información que sabes hasta el momento, ¿cuánto tiempo crees que podrías
          demorar realizando la <strong>primera fase</strong>?
        </label>

        <!-- Alerta informativa sobre la Fase 1 -->
        <div class="flex items-start gap-3 p-4 rounded-[20px] border-2 border-blue-200 bg-blue-50">
          <span class="text-lg shrink-0">ℹ️</span>
          <div>
            <p class="text-xs font-black text-blue-800 uppercase tracking-wide mb-1">Recuerda: ¿Qué es la Fase 1?</p>
            <p class="text-xs font-medium text-blue-700 leading-relaxed">
              La <strong>Fase 1 — Análisis</strong> consta de <strong>2 subfases</strong> con un total de
              <strong>4 actividades</strong>. Es la primera de 3 fases en SIMECT y se enfoca en identificar
              hechos, datos y propósitos. Estima solo para <em>esta</em> fase, no para todo el sistema.
            </p>
          </div>
        </div>

        <!-- Selector de tiempo -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="opt in tiempoOpciones" :key="opt.value"
            type="button"
            @click="formData.jol3 = opt.value"
            class="p-4 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all text-center"
            :class="formData.jol3 === opt.value
              ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
              : 'border-slate-100 text-black hover:border-indigo-300'"
          >
            <span class="block text-lg font-black mb-1">{{ opt.icon }}</span>
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- JOL 4: Atención a números -->
      <div class="space-y-4" :class="formData.jol3 > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
        <label class="block text-sm font-black text-black uppercase tracking-widest">
          <span class="text-indigo-500 mr-2">04</span>
          ¿Qué tan acostumbrado estás a prestarle atención a los
          <strong>números y unidades de medida exactas</strong>?
        </label>
        <div class="flex items-center gap-2 md:gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Nada</span>
          <div class="flex-1 flex justify-between gap-2">
            <button
              v-for="val in 5" :key="val" type="button"
              @click="formData.jol4 = val"
              class="flex-1 h-12 rounded-xl border-2 transition-all font-black text-lg"
              :class="formData.jol4 === val ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white text-black hover:border-indigo-300'"
            >{{ val }}</button>
          </div>
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Mucho</span>
        </div>
      </div>

      <!-- JOL 5: Separar propuesta del porqué -->
      <div class="space-y-4" :class="formData.jol4 > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'">
        <label class="block text-sm font-black text-black uppercase tracking-widest">
          <span class="text-indigo-500 mr-2">05</span>
          ¿Qué tan bueno eres para separar <strong>lo que una persona propone hacer</strong>
          del <strong>porqué dice que hay que hacerlo</strong>?
        </label>
        <div class="flex items-center gap-2 md:gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5">
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">No soy bueno</span>
          <div class="flex-1 flex justify-between gap-2">
            <button
              v-for="val in 5" :key="val" type="button"
              @click="formData.jol5 = val"
              class="flex-1 h-12 rounded-xl border-2 transition-all font-black text-lg"
              :class="formData.jol5 === val ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white text-black hover:border-indigo-300'"
            >{{ val }}</button>
          </div>
          <span class="text-[10px] font-black uppercase text-black w-12 text-center shrink-0">Muy bueno</span>
        </div>
      </div>

      <!-- Submit -->
      <div class="pt-10 text-center">
        <button
          type="submit"
          class="w-full inline-flex items-center justify-center gap-4 rounded-[40px] px-12 py-7 text-sm font-black text-white uppercase tracking-[0.4em] transition-all shadow-2xl disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed"
          :class="isFormValid ? 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] shadow-indigo-500/40' : 'bg-slate-300 text-black'"
          :disabled="!isFormValid || isSubmitting"
        >
          {{ isSubmitting ? 'Iniciando Sesión...' : 'Comenzar — Ver Historia' }}
          <svg v-if="!isSubmitting" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

const props = defineProps<{
  onboardingData?: { comprensionSIMECT: number; familiaridadTema: number } | null
}>()

const emit = defineEmits(['submit'])

const tiempoOpciones = [
  { value: 15,  label: 'Menos de 15 min', icon: '⚡' },
  { value: 30,  label: '15 a 30 min',     icon: '🕐' },
  { value: 60,  label: '30 a 60 min',     icon: '🕑' },
  { value: 90,  label: 'Más de 1 hora',   icon: '⏳' }
]

const formData = reactive({
  jol1: 0,   // Seguridad sin ayuda
  jol2: 0,   // Seguridad del tema
  jol3: 0,   // Tiempo estimado Fase 1 (minutos)
  jol4: 0,   // Atención a números
  jol5: 0    // Separar propuesta del porqué
})

const isSubmitting = ref(false)

const completedCount = computed(() => {
  let count = 0
  if (formData.jol1 > 0) count++
  if (formData.jol2 > 0) count++
  if (formData.jol3 > 0) count++
  if (formData.jol4 > 0) count++
  if (formData.jol5 > 0) count++
  return count
})

const progressPercent = computed(() => (completedCount.value / 5) * 100)
const isFormValid = computed(() => completedCount.value === 5)

const handleSubmit = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1000))
  emit('submit', {
    // JOL nuevas
    seguridadSinAyuda:    formData.jol1,
    seguridadTema:        formData.jol2,
    tiempoEstimadoFase1:  formData.jol3,
    atencionNumeros:      formData.jol4,
    separacionArgumentos: formData.jol5,
    // Datos del onboarding (pasados como prop)
    comprensionSIMECT:   props.onboardingData?.comprensionSIMECT ?? null,
    familiaridadTema:    props.onboardingData?.familiaridadTema ?? null,
    timestamp: new Date().toISOString()
  })
  isSubmitting.value = false
}
</script>

<style scoped>
.animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
</style>
