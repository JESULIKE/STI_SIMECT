<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  decision: any
}>()

const emit = defineEmits(['continue'])

const showContinueButton = ref(false)

// Categorización por colores (Sección 9.5)
const feedbackType = computed(() => {
  if (!props.decision || !props.decision.scoreDetails) return 'good'
  const score = props.decision.scoreDetails.basePoints
  if (score >= 90) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 25) return 'improvement'
  return 'difficulties'
})

const config = computed(() => {
  const types = {
    excellent: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500',
      text: 'text-emerald-600',
      wave: 'bg-emerald-500/20',
      icon: '✅',
      label: '¡EXCELENTE!',
      showConfetti: true
    },
    good: {
      bg: 'bg-green-500/5',
      border: 'border-green-500/30',
      text: 'text-green-600',
      wave: 'bg-green-500/10',
      icon: '👍',
      label: '¡MUY BIEN!'
    },
    improvement: {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/30',
      text: 'text-amber-600',
      wave: 'bg-amber-500/10',
      icon: '⭐',
      label: 'SIGUE INTENTANDO'
    },
    difficulties: {
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/30',
      text: 'text-orange-600',
      wave: 'bg-orange-500/10',
      icon: '⬆️',
      label: 'VAMOS A REFORZAR'
    }
  }
  return types[feedbackType.value]
})

// Desglose ítem a ítem
const itemBreakdown = computed(() => props.decision?.itemBreakdown || [])
const hasBreakdown = computed(() => itemBreakdown.value.length > 0)
const correctCount = computed(() => itemBreakdown.value.filter((i: any) => i.isCorrect).length)
const totalCount = computed(() => itemBreakdown.value.length)

onMounted(() => {
  if (config.value.showConfetti) {
    console.log('¡Disparando confeti pedagógico!')
  }
  // Retraso de 3 segundos para garantizar lectura (Sección 10.1 Pantalla 7)
  setTimeout(() => {
    showContinueButton.value = true
  }, 3000)
})
</script>

<template>
  <div v-if="decision" 
       class="relative overflow-hidden rounded-[40px] border-4 transition-all duration-700 animate-in zoom-in-95"
       :class="[config.bg, config.border]">
    
    <!-- Señal Visual Inmediata: OLA (Sección 9.5) -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <div class="absolute -inset-[100%] animate-wave opacity-30" :class="config.wave"></div>
    </div>

    <!-- Contenido del Feedback -->
    <div class="relative z-10 p-8 md:p-12">
      <div class="flex flex-col items-center text-center space-y-8">
        
        <!-- Ícono y Label -->
        <div class="space-y-4">
          <div class="text-6xl animate-bounce-slow">{{ config.icon }}</div>
          <h2 class="text-4xl font-black italic uppercase tracking-widest" :class="config.text">{{ config.label }}</h2>
        </div>

        <!-- Puntos Ganados -->
        <div class="relative py-6 px-10 bg-white rounded-[32px] shadow-2xl border-2 border-slate-100 animate-scale-in">
          <div class="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl font-black text-indigo-600 animate-float-up">
            +{{ decision.scoreDetails.totalGained }}
          </div>
          <div class="grid grid-cols-2 gap-8 text-left">
            <div>
              <span class="block text-[10px] font-black text-black uppercase tracking-widest">Base</span>
              <span class="text-2xl font-black text-black">{{ decision.scoreDetails.basePoints }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-black text-black uppercase tracking-widest">Bonos</span>
              <span class="text-2xl font-black text-indigo-500">+{{ decision.scoreDetails.speedBonus + decision.scoreDetails.metacognitiveBonus }}</span>
            </div>
          </div>
          <div v-if="decision.scoreDetails.streakMultiplier > 1" class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span class="text-[10px] font-black text-orange-500 uppercase">Multiplicador Racha</span>
            <span class="text-lg font-black text-orange-500">x{{ decision.scoreDetails.streakMultiplier }}</span>
          </div>
        </div>

        <!-- ══ DESGLOSE POR ÍTEM (solo actividades multi-ítem) ══ -->
        <div v-if="hasBreakdown" class="w-full max-w-lg space-y-3">
          <div class="flex items-center justify-between px-2">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Revisión de tu respuesta</p>
            <span class="text-[10px] font-black px-3 py-1 rounded-full"
              :class="correctCount === totalCount ? 'bg-emerald-100 text-emerald-700' : correctCount >= totalCount / 2 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'">
              {{ correctCount }}/{{ totalCount }} correctas
            </span>
          </div>

          <div v-for="item in itemBreakdown" :key="item.itemId"
            class="flex items-start gap-3 p-4 rounded-2xl border-2 text-left"
            :class="item.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'"
          >
            <span class="text-xl mt-0.5 flex-shrink-0">{{ item.isCorrect ? '✅' : '❌' }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-black text-slate-600 truncate">{{ item.label }}</p>
              <p class="text-sm font-bold mt-1" :class="item.isCorrect ? 'text-emerald-700' : 'text-red-700'">
                Tu respuesta: <span class="font-medium">{{ item.studentAnswer }}</span>
              </p>
              <p v-if="!item.isCorrect" class="text-sm font-bold text-slate-600 mt-0.5">
                Correcta: <span class="font-medium text-emerald-700">{{ item.correctAnswer }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Mensaje Explicativo Contextualizado -->
        <div class="max-w-xl">
          <p class="text-lg md:text-xl font-medium text-black leading-relaxed italic">
            "{{ decision.message }}"
          </p>
        </div>

        <!-- Acción Siguiente (Retrasada 3s) -->
        <div class="pt-4 h-24 flex items-center justify-center">
          <button v-if="showContinueButton"
                  @click="emit('continue')" 
                  class="px-20 py-6 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-xs rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl animate-in fade-in zoom-in duration-500">
            {{ decision.action === 'REINFORCEMENT' ? 'Ir al Refuerzo' : 'Siguiente Desafío' }}
          </button>
          <div v-else class="text-[10px] font-black uppercase tracking-[0.3em] text-black animate-pulse">
            Procesando aprendizaje...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-wave {
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  animation: wave 4s infinite ease-in-out;
}

@keyframes wave {
  0% { transform: scale(1) translate(-20%, -20%); opacity: 0.1; }
  50% { transform: scale(1.5) translate(20%, 20%); opacity: 0.3; }
  100% { transform: scale(1) translate(-20%, -20%); opacity: 0.1; }
}

.animate-float-up {
  animation: float-up 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes float-up {
  0% { transform: translate(-50%, 0); opacity: 0; }
  20% { transform: translate(-50%, -20px); opacity: 1; }
  100% { transform: translate(-50%, -100px); opacity: 0; }
}

.animate-bounce-slow { animation: bounce 3s infinite; }
@keyframes bounce {
  0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}

.animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes scale-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
