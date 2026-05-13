<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop blur -->
    <div class="absolute inset-0 bg-surface-900/60 backdrop-blur-sm transition-opacity" />

    <!-- Modal -->
    <div class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-slide-up ring-1 ring-surface-200">
      
      <!-- Cabecera decorativa -->
      <div class="bg-primary-50 px-6 py-8 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-3xl">
          🧘
        </div>
        <h2 class="text-2xl font-bold tracking-tight text-primary-900">
          Pausa de Conciencia
        </h2>
        <p class="mt-2 text-sm text-primary-700">
          Has completado 3 actividades. Es un buen momento para un respiro mental.
        </p>
      </div>

      <!-- Contenido interactivo -->
      <div class="p-6">
        <p class="mb-4 text-center text-sm font-medium text-surface-700">
          ¿Cómo está tu nivel de energía ahora mismo?
        </p>
        
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="opt in energyOptions"
            :key="opt.value"
            type="button"
            class="flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all"
            :class="[
              selectedEnergy === opt.value 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-surface-100 hover:border-surface-300 hover:bg-surface-50'
            ]"
            @click="selectedEnergy = opt.value"
          >
            <span class="text-2xl">{{ opt.emoji }}</span>
            <span class="text-xs font-semibold text-surface-700">{{ opt.label }}</span>
          </button>
        </div>

        <!-- Ejercicio de respiración (Opcional visual) -->
        <div class="mt-6 rounded-xl bg-surface-50 p-4 text-center">
          <p class="text-sm text-surface-600">
            Toma una inhalación profunda... y exhala lentamente.
          </p>
        </div>

        <button
          class="mt-6 w-full rounded-xl bg-primary-700 py-3.5 text-sm font-bold text-white shadow-primary transition-all hover:bg-primary-600 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!selectedEnergy || isSubmitting"
          @click="handleComplete"
        >
          <span v-if="!isSubmitting">Continuar Aprendiendo</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Guardando...
          </span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', energyLevel: string): void
}>()

const selectedEnergy = ref<string | null>(null)
const isSubmitting = ref(false)

const energyOptions = [
  { value: 'low', label: 'Baja', emoji: '🔋' },
  { value: 'ok', label: 'Bien', emoji: '⚡' },
  { value: 'high', label: 'Alta', emoji: '🔥' },
]

const handleComplete = async () => {
  if (!selectedEnergy.value) return
  isSubmitting.value = true
  
  // En la vida real aquí se puede guardar métricas
  await new Promise(r => setTimeout(r, 600))
  
  emit('complete', selectedEnergy.value)
  
  // Reset
  isSubmitting.value = false
  selectedEnergy.value = null
}
</script>
