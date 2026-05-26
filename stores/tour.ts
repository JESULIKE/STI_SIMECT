import { defineStore } from 'pinia'

export interface TourStep {
  /** Selector CSS del elemento a resaltar. Si es null, el foco aparece centrado (pantalla completa). */
  target: string | null
  title: string
  description: string
  emoji?: string
  /** Posición preferida del diálogo: 'top' | 'bottom' | 'left' | 'right' | 'center' */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export const useTourStore = defineStore('tour', () => {
  const isActive = ref(false)
  const steps = ref<TourStep[]>([])
  const currentIndex = ref(0)
  const tourId = ref<string>('')   // Identifica qué tour está activo (ej. 'dashboard', 'learn')

  const currentStep = computed(() => steps.value[currentIndex.value] ?? null)
  const isFirstStep = computed(() => currentIndex.value === 0)
  const isLastStep = computed(() => currentIndex.value === steps.value.length - 1)
  const progress = computed(() =>
    steps.value.length ? Math.round(((currentIndex.value + 1) / steps.value.length) * 100) : 0
  )

  function startTour(id: string, tourSteps: TourStep[]) {
    tourId.value = id
    steps.value = tourSteps
    currentIndex.value = 0
    isActive.value = true
  }

  function nextStep() {
    if (currentIndex.value < steps.value.length - 1) {
      currentIndex.value++
    } else {
      endTour()
    }
  }

  function prevStep() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  function endTour() {
    // Marcar como completado en localStorage para no mostrarlo automáticamente de nuevo
    if (tourId.value && typeof window !== 'undefined') {
      localStorage.setItem(`simect_tour_done_${tourId.value}`, '1')
    }
    isActive.value = false
    steps.value = []
    currentIndex.value = 0
  }

  /** Verifica si el tour ya fue visto por el usuario */
  function wasTourSeen(id: string): boolean {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(`simect_tour_done_${id}`) === '1'
  }

  /** Inicia el tour solo si no fue visto antes (para autodisparo) */
  function autoStart(id: string, tourSteps: TourStep[]) {
    if (!wasTourSeen(id)) {
      startTour(id, tourSteps)
    }
  }

  return {
    isActive,
    steps,
    currentIndex,
    tourId,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    startTour,
    nextStep,
    prevStep,
    endTour,
    wasTourSeen,
    autoStart,
  }
})
