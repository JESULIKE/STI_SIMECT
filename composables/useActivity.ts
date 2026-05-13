import { ref, computed, onUnmounted, isRef, type Ref } from 'vue'

export type ActivityState = 'idle' | 'in_progress' | 'evaluating' | 'finished'

export function useActivity(activityId: string | Ref<string>) {
  const currentId = computed(() => isRef(activityId) ? activityId.value : activityId)
  const state = ref<ActivityState>('idle')
  const timeSpentSeconds = ref(0)
  const priorConfidence = ref<number | null>(null)
  const reflection = ref('')
  
  let timerInterval: number | null = null

  const startTimer = () => {
    if (timerInterval) return
    state.value = 'in_progress'
    timerInterval = window.setInterval(() => {
      timeSpentSeconds.value++
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const stopTimer = () => {
    pauseTimer()
    state.value = 'evaluating'
  }

  const resetTimer = () => {
    pauseTimer()
    timeSpentSeconds.value = 0
    priorConfidence.value = null
    reflection.value = ''
    state.value = 'idle'
  }

  const formattedTime = computed(() => {
    const mins = Math.floor(timeSpentSeconds.value / 60)
    const secs = timeSpentSeconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  onUnmounted(() => {
    pauseTimer()
  })

  const submitActivity = async (studentProfileId: string, respuesta: any) => {
    stopTimer()
    
    try {
      const response = await $fetch(`/api/activities/${currentId.value}/submit`, {
        method: 'POST',
        body: {
          studentProfileId,
          respuesta,
          timeSpentSeconds: timeSpentSeconds.value,
          priorConfidence: priorConfidence.value || 2,
          reflectionLengthChars: reflection.value.length
        }
      })
      
      state.value = 'finished'
      // CORRECCIÓN: Nuxt $fetch devuelve el cuerpo directamente
      return response 
    } catch (error) {
      console.error('Error al enviar la actividad', error)
      state.value = 'in_progress'
      throw error
    }
  }

  return {
    state,
    timeSpentSeconds,
    formattedTime,
    priorConfidence,
    reflection,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    submitActivity
  }
}
