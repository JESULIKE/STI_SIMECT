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
        v-for="step in 5" 
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
      <span>Pregunta {{ currentStep }} de 5</span>
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
          v-if="currentStep < 5"
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

const emit = defineEmits(['continuar'])

const currentStep = ref(1)
const isSubmitting = ref(false)

const answers = reactive<Record<string, number>>({
  atencionDetalle: 0,
  filtroInformacion: 0,
  conexionPlaneacion: 0,
  esfuerzoCognitivo: 0,
  confianzaActual: 0
})

const questionsList = [
  {
    key: 'atencionDetalle',
    dimension: 'Atención al detalle',
    emoji: '🔍',
    question: 'Mientras avanzabas en la historia y veías los datos del río (7.5 metros) o la saturación del suelo (90%), ¿qué tan concentrado estuviste en los números exactos o te dejaste llevar solo por la narración?',
    options: [
      { value: 1, label: 'Distracción total', desc: 'Me distraje por completo; no recuerdo ninguna cifra.' },
      { value: 2, label: 'Atención superficial', desc: 'Vi los números, pero no les presté atención real.' },
      { value: 3, label: 'Lectura cuidadosa', desc: 'Los leí con cuidado, pero tuve que devolverme a mirar el texto.' },
      { value: 4, label: 'Enfoque técnico alto', desc: 'Estuve atento y retuve la mayoría de los datos técnicos.' },
      { value: 5, label: 'Enfoque absoluto', desc: 'Estuve 100% enfocado; capté cada dato y unidad de medida a la primera.' }
    ]
  },
  {
    key: 'filtroInformacion',
    dimension: 'Detección de trampas',
    emoji: '🛑',
    question: 'Cuando aparecieron el audio de WhatsApp y el discurso del político, ¿qué tan rápido dudaste de ellos antes de que Mateo mostrara la solución?',
    options: [
      { value: 1, label: 'Confianza ciega', desc: 'Si yo hubiera estado ahí, le habría creído de inmediato al WhatsApp.' },
      { value: 2, label: 'Casi engañado', desc: 'Me parecieron creíbles al principio; casi caigo en la trampa.' },
      { value: 3, label: 'Duda razonable', desc: 'Dudé un poco de las fuentes, pero esperé a ver qué hacía Mateo.' },
      { value: 4, label: 'Detección rápida', desc: 'Identifiqué rápido que eran fuentes dudosas o con intereses ocultos.' },
      { value: 5, label: 'Alerta instantánea', desc: 'Lo supe de inmediato; mi mente activó las alertas contra la desinformación al instante.' }
    ]
  },
  {
    key: 'conexionPlaneacion',
    dimension: 'Alineación Estratégica',
    emoji: '🧠',
    question: 'Al inicio del sistema respondiste sobre qué tan bueno eras separando "ideas" de "razones". ¿Sentiste que mantuviste esa estrategia activa durante la lectura?',
    options: [
      { value: 1, label: 'Piloto automático', desc: 'Para nada, me olvidé de lo que planeé al principio y leí en piloto automático.' },
      { value: 2, label: 'Recordatorio leve', desc: 'Me acordé un par de veces, pero me costó aplicarlo.' },
      { value: 3, label: 'Aplicación reactiva', desc: 'Apliqué la estrategia solo cuando la lectura se puso difícil.' },
      { value: 4, label: 'Aplicación proactiva', desc: 'Sí, intenté separar las propuestas de sus motivos en casi todo el texto.' },
      { value: 5, label: 'Dominio completo', desc: 'Totalmente; usé la estrategia de inicio a fin para evaluar cada solución del desenlace.' }
    ]
  },
  {
    key: 'esfuerzoCognitivo',
    dimension: 'Esfuerzo Mental',
    emoji: '⚡',
    question: '¿Qué tanto esfuerzo mental te está costando procesar la información técnica y los dilemas lógicos que plantea este sistema hasta el momento?',
    options: [
      { value: 1, label: 'Esfuerzo extremo', desc: 'Demasiado esfuerzo; me siento muy confundido con el nivel de las preguntas.' },
      { value: 2, label: 'Esfuerzo alto', desc: 'Un esfuerzo alto; me cuesta conectar los datos climáticos con las decisiones.' },
      { value: 3, label: 'Esfuerzo moderado', desc: 'Esfuerzo moderado; el sistema me hace pensar, pero voy entendiendo.' },
      { value: 4, label: 'Esfuerzo bajo', desc: 'Esfuerzo bajo; me resulta cómodo analizar los argumentos planteados.' },
      { value: 5, label: 'Sin esfuerzo', desc: 'Muy fácil; mi mente procesa la lógica y la validez de los textos sin problemas.' }
    ]
  },
  {
    key: 'confianzaActual',
    dimension: 'Comprensión del problema',
    emoji: '🪞',
    question: 'Pensando en la escala del 1 al 5 que respondiste al puro inicio sobre "qué tanto sabías del tema", ¿cómo sientes tu nivel de comprensión sobre lo que ocurrió en Montería en este momento?',
    options: [
      { value: 1, label: 'Confusión continua', desc: 'Me siento igual o más confundido que antes.' },
      { value: 2, label: 'Sin cambios', desc: 'Siento que sé lo mismo, no he descubierto nada nuevo.' },
      { value: 3, label: 'Aclaración de dudas', desc: 'He aclarado un par de dudas sobre el comportamiento del río y las fuentes.' },
      { value: 4, label: 'Comprensión avanzada', desc: 'Siento que ahora comprendo mucho mejor las causas y dinámicas del problema.' },
      { value: 5, label: 'Analista experto', desc: 'Mi comprensión ha dado un giro total; ahora veo el problema con ojos de analista crítico.' }
    ]
  }
]

const activeQuestionData = computed(() => questionsList[currentStep.value - 1])
const activeQuestionKey = computed(() => activeQuestionData.value.key)

const selectOption = (val: number) => {
  answers[activeQuestionKey.value] = val
  // Auto-avanzar si no es la última pregunta (opcional, da un feeling ágil, pero mantenemos navegación para que revisen)
  if (currentStep.value < 5) {
    setTimeout(() => {
      nextStep()
    }, 250)
  }
}

const nextStep = () => {
  if (currentStep.value < 5 && answers[activeQuestionKey.value] > 0) {
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
  // Retraso de guardado visual de 800ms
  await new Promise(r => setTimeout(r, 800))
  emit('continuar', { ...answers })
  isSubmitting.value = false
}
</script>
