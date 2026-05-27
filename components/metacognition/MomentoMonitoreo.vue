<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
    <!-- Header -->
    <div class="text-center space-y-4">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 block">Monitoreo Metacognitivo</span>
      <h3 class="text-3xl font-black text-black italic uppercase tracking-tight">¿Cómo vas con tu aprendizaje?</h3>
      <p class="max-w-xl mx-auto text-slate-700 font-medium italic text-sm leading-relaxed">
        "Detenerse a evaluar nuestro propio esfuerzo y enfoque durante la tarea mejora el rendimiento real." <br>
        <span class="text-[10px] not-italic font-black text-indigo-400 uppercase tracking-widest">— Monitoreo Activo</span>
      </p>
    </div>

    <!-- Barra de Progreso del Stepper -->
    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner flex">
      <div 
        v-for="step in 3" 
        :key="step"
        class="h-full flex-1 transition-all duration-500"
        :class="[
          step < currentStep ? 'bg-indigo-600 border-r border-indigo-700' : 
          step === currentStep ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 animate-pulse' : 
          'bg-slate-100'
        ]"
      ></div>
    </div>

    <div class="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
      <span>Evaluando tu proceso</span>
      <span>Pregunta {{ currentStep }} de 3</span>
    </div>

    <!-- Contenedor de la Pregunta Activa -->
    <div class="bg-white border-2 border-slate-100 rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
      <div class="absolute -top-16 -right-16 w-36 h-36 bg-indigo-50 rounded-full -z-10 blur-xl"></div>
      
      <!-- Icono & Título de Pregunta -->
      <div class="flex items-start gap-4 mb-6">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
          <span>{{ activeQuestionData.emoji }}</span>
        </div>
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">Dimensión: {{ activeQuestionData.dimension }}</span>
          <h4 class="text-base md:text-lg font-black text-black leading-tight mt-1">{{ activeQuestionData.question }}</h4>
        </div>
      </div>

      <!-- Grid de Opciones de la Escala 1 a 5 -->
      <div class="space-y-3">
        <button
          v-for="opt in activeQuestionData.options"
          :key="opt.value"
          type="button"
          @click="selectOption(opt.value)"
          class="w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all flex items-start gap-4 hover:scale-[1.01] duration-200"
          :class="[
            answers[activeQuestionKey] === opt.value
              ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-600/5'
              : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50/30'
          ]"
        >
          <!-- Círculo indicador con número -->
          <div 
            class="w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 border-2 transition-all text-sm"
            :class="[
              answers[activeQuestionKey] === opt.value
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-indigo-400'
            ]"
          >
            {{ opt.value }}
          </div>
          <div class="space-y-0.5">
            <span class="text-xs font-black uppercase tracking-wider block" :class="answers[activeQuestionKey] === opt.value ? 'text-indigo-700' : 'text-slate-500'">
              {{ opt.label }}
            </span>
            <p class="text-sm font-medium text-slate-700 leading-snug">
              {{ opt.desc }}
            </p>
          </div>
        </button>
      </div>

      <!-- Navegación del Stepper -->
      <div class="mt-8 flex justify-between gap-4 pt-6 border-t border-slate-100">
        <button
          v-if="currentStep > 1"
          type="button"
          @click="prevStep"
          class="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all"
        >
          Atrás
        </button>
        <div v-else></div>

        <button
          v-if="currentStep < 3"
          type="button"
          @click="nextStep"
          :disabled="!answers[activeQuestionKey]"
          class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-20 disabled:cursor-not-allowed ml-auto"
        >
          Siguiente
        </button>
        <button
          v-else
          type="button"
          @click="handleComplete"
          :disabled="!answers[activeQuestionKey] || isSubmitting"
          class="px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[24px] transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed ml-auto flex items-center gap-3"
        >
          <span v-if="!isSubmitting">Guardar y Continuar</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useStudentStore } from '~/stores/student'

const emit = defineEmits(['continuar'])
const studentStore = useStudentStore()

const currentStep = ref(1)
const isSubmitting = ref(false)

const answers = reactive<Record<string, number>>({
  monitoreo1: 0,
  monitoreo2: 0,
  monitoreo3: 0
})

const questionsList = computed(() => {
  const isPhase2 = studentStore.progress.phase === 'EVALUATION'
  
  return [
    {
      key: 'monitoreo1',
      dimension: 'Autonomía',
      emoji: '🙋‍♂️',
      question: 'Hasta este momento, ¿Has solicitado ayuda al tutor? ¿Cuántas veces?',
      options: [
        { value: 1, label: 'Muchas veces', desc: 'He pedido ayuda en casi todos los desafíos.' },
        { value: 2, label: 'Varias veces', desc: 'He usado las pistas entre 3 y 4 veces.' },
        { value: 3, label: 'Algunas veces', desc: 'He usado la ayuda 1 o 2 veces.' },
        { value: 4, label: 'Solo una vez', desc: 'Pedí ayuda en un desafío que me costó.' },
        { value: 5, label: 'Ninguna', desc: 'No he necesitado pedir ayuda hasta ahora.' }
      ]
    },
    {
      key: 'monitoreo2',
      dimension: 'Interés',
      emoji: '⭐',
      question: isPhase2 
        ? 'En una escala del 1 al 5 ¿Qué tan interesante has sentido el texto?' 
        : 'En una escala del 1 al 5 ¿Qué tan interesante has sentido el tema a tratar en SIMECT?',
      options: [
        { value: 1, label: 'Nada interesante', desc: 'Siento aburrimiento al leer la información.' },
        { value: 2, label: 'Poco interesante', desc: 'Me cuesta mantener el interés.' },
        { value: 3, label: 'Interesante', desc: 'Está bien, aunque hay partes que me aburren un poco.' },
        { value: 4, label: 'Muy interesante', desc: 'Me llama la atención la situación y los datos.' },
        { value: 5, label: 'Fascinante', desc: 'Siento mucha curiosidad por saber qué pasa y resolverlo.' }
      ]
    },
    {
      key: 'monitoreo3',
      dimension: 'Gestión del tiempo',
      emoji: '⏳',
      question: '¿Estas cumpliendo con el tiempo que planteaste en la fase de planeación?',
      options: [
        { value: 1, label: 'Para nada', desc: 'Me estoy demorando muchísimo más de lo que pensé.' },
        { value: 2, label: 'Lento', desc: 'Voy más lento de lo que planeé originalmente.' },
        { value: 3, label: 'Regular', desc: 'Voy un poco atrasado, pero puedo recuperarme.' },
        { value: 4, label: 'A buen ritmo', desc: 'Voy de acuerdo a lo que planeé, casi perfecto.' },
        { value: 5, label: 'Totalmente', desc: 'Voy muy bien, incluso más rápido de lo esperado.' }
      ]
    }
  ]
})

const activeQuestionData = computed(() => questionsList.value[currentStep.value - 1])
const activeQuestionKey = computed(() => activeQuestionData.value.key)

const selectOption = (val: number) => {
  answers[activeQuestionKey.value] = val
  if (currentStep.value < 3) {
    setTimeout(() => {
      nextStep()
    }, 250)
  }
}

const nextStep = () => {
  if (currentStep.value < 3 && answers[activeQuestionKey.value] > 0) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleComplete = async () => {
  if (Object.values(answers).some(val => val === 0)) return
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 800))
  emit('continuar', { ...answers })
  isSubmitting.value = false
}
</script>
