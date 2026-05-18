import { ref, computed } from 'vue'
import { useStudentStore } from '../stores/student'
import { useActivity } from './useActivity'
import { useGamification } from './useGamification'

export type SessionState = 
  | 'CHECKLIST_PENDING' 
  | 'ACTIVITY_PRESENTATION' 
  | 'ACTIVITY_IN_PROGRESS' 
  | 'EVALUATING' 
  | 'FEEDBACK' 
  | 'REFLECTION_PENDING' 
  | 'CELEBRATING'
  | 'READING_NARRATIVE'
  | 'DECISION_ROUTING'

export function useLearningSession() {
  const studentStore = useStudentStore()
  const gamification = useGamification()
  
  const currentState = ref<SessionState>(
    studentStore.isChecklistPending ? 'CHECKLIST_PENDING' : 'ACTIVITY_PRESENTATION'
  )
  
  const currentActivityData = ref<any>(null)
  const currentActivityId = computed(() => currentActivityData.value?.id || '')
  const lastEvaluation = ref<any>(null)
  const narrativeChapterData = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activityManager = useActivity(currentActivityId)

  const loadNextActivity = async () => {
    console.log('Buscando próxima actividad para:', studentStore.progress.level, studentStore.progress.phase)
    isLoading.value = true
    error.value = null
    
    // Controlador para timeout de 15 segundos (más margen para DB)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const level = (studentStore.progress.level || 'BASIC').toUpperCase()
      const phase = (studentStore.progress.phase || 'ANALYSIS').toUpperCase()
      
      console.log(`[Session] Cargando: ${level} / ${phase}`)
      console.log(`[Session] Perfil ID: ${studentStore.progress.subPhase}`) // subPhase suele guardar el ID en algunos logs
      
      const response: any = await $fetch('/api/activities/available', {
        query: { level, phase },
        signal: controller.signal
      })
      
      if (response.success === false) {
        error.value = response.message
        return
      }

      const list = response.data || []
      console.log(`Respuesta del servidor: ${list.length} actividades encontradas.`)

      if (response.progressBars) {
        studentStore.updateProgressBars(response.progressBars)
      }
      
      if (response.firstActivity) {
        console.log('Actividad cargada desde metadata:', response.firstActivity.id)
        currentActivityData.value = response.firstActivity
        activityManager.resetTimer()
        console.log('Actividad lista:', currentActivityData.value.titulo)
      } else {
        console.info('El usuario ha completado todas las actividades disponibles para este nivel/fase.')
        error.value = "¡Felicidades! Has completado todos los desafíos de esta etapa. Pronto desbloquearemos nuevas misiones."
      }
    } catch (e: any) {
      console.error("Fallo crítico cargando sesión:", e)
      if (e.name === 'AbortError') {
        error.value = "La conexión con el servidor tardó demasiado. Por favor, recarga la página."
      } else {
        error.value = "Error al conectar con el servidor de actividades: " + (e.statusMessage || e.message)
      }
    } finally {
      clearTimeout(timeoutId)
      isLoading.value = false
    }
  }

  const onChecklistCompleted = async (data: any) => {
    console.log('Evento de checklist completado recibido. Guardando y actualizando estado...')
    try {
      // 1. Guardar en DB (metacognición)
      await $fetch('/api/student/metacognition/checklist', {
        method: 'POST',
        body: data
      })
      
      // 2. Actualizar estado local en el store
      studentStore.completeChecklist()
      
      // 3. Cargar próxima actividad
      await loadNextActivity()
      
      // 4. Cambiar estado visual
      currentState.value = 'ACTIVITY_PRESENTATION'
    } catch (e) {
      console.error('Error al guardar planificación:', e)
      // Fallback para no bloquear al estudiante si falla la red/DB
      studentStore.completeChecklist()
      await loadNextActivity()
      currentState.value = 'ACTIVITY_PRESENTATION'
    }
  }

  const startCurrentActivity = () => {
    currentState.value = 'ACTIVITY_IN_PROGRESS'
    activityManager.state.value = 'in_progress'
    activityManager.startTimer()
  }

  const currentAttemptId = ref<string | null>(null)

  const submitCurrentActivity = async (studentAnswer: any, priorConfidence: number) => {
    currentState.value = 'EVALUATING'
    
    try {
      const payload = {
        activityId: currentActivityId.value,
        respuesta: studentAnswer,
        confianzaPrevia: priorConfidence,
        tiempoSegundos: activityManager.timeSpentSeconds.value
      }
      
      console.log('[Session] Enviando respuesta:', payload)

      const result: any = await $fetch('/api/activities/submit', {
        method: 'POST',
        body: payload
      })

      if (!result.success) throw new Error('Fallo en evaluación')

      currentAttemptId.value = result.decision.attemptId || null
      lastEvaluation.value = result.decision
      
      studentStore.addPoints(result.decision.scoreDetails?.totalGained || 0)
      
      // Actualizar barras de progreso dinámicas desde el servidor
      if (result.decision.progressBars) {
        studentStore.updateProgressBars(result.decision.progressBars)
      }

      activityManager.state.value = 'finished'

      if (result.decision.action === 'METACOGNITIVE_ALERT') {
        currentState.value = 'REFLECTION_PENDING'
      } else {
        currentState.value = 'FEEDBACK'
      }
      
      studentStore.incrementActivityCount()
    } catch (e) {
      console.error('Error en sesión:', e)
      currentState.value = 'ACTIVITY_IN_PROGRESS'
    }
  }

  const completeReflection = async (data: any) => {
    try {
      await $fetch('/api/student/metacognition/reflection', {
        method: 'POST',
        body: {
          ...data,
          activityAttemptId: currentAttemptId.value
        }
      })
    } catch (error) {
      console.error('Error al guardar reflexión:', error)
    }

    const action = lastEvaluation.value?.action
    if (action === 'CHALLENGE_UNLOCK' || lastEvaluation.value?.unlockChapter) {
      gamification.processLevelUp()
      currentState.value = 'CELEBRATING'
      return
    }

    currentState.value = 'ACTIVITY_PRESENTATION'
    loadNextActivity()
  }

  const advanceFromFeedback = async () => {
    const action = lastEvaluation.value?.action
    if (action === 'REINFORCEMENT') {
      currentState.value = 'ACTIVITY_PRESENTATION'
      activityManager.resetTimer()
      return
    }
    currentState.value = 'REFLECTION_PENDING'
  }

  const finishCelebration = async () => {
    // Buscar si hay capítulo narrativo para mostrar
    try {
      const response = await $fetch('/api/narrative/chapter', {
        query: {
          level: studentStore.progress.level,
          phase: studentStore.progress.phase,
          chapter: lastEvaluation.value?.unlockChapter
        }
      })
      narrativeChapterData.value = (response as any).data
      currentState.value = 'READING_NARRATIVE'
    } catch (error) {
      // Si falla, pasamos directo a la siguiente actividad
      currentState.value = 'ACTIVITY_PRESENTATION'
      loadNextActivity()
    }
  }

  const finishNarrative = () => {
    // Si subió de nivel en la lógica, actualizar store (Ej: 'ADVANCED')
    // studentStore.setProgress({ level: 'ADVANCED' })
    
    currentState.value = 'ACTIVITY_PRESENTATION'
    loadNextActivity()
  }

  // Init
  if (currentState.value === 'ACTIVITY_PRESENTATION') {
    loadNextActivity()
  }

  return {
    currentState,
    currentActivityData,
    lastEvaluation,
    narrativeChapterData,
    activityManager,
    loadNextActivity,
    onChecklistCompleted,
    startCurrentActivity,
    submitCurrentActivity,
    completeReflection,
    advanceFromFeedback,
    finishCelebration,
    finishNarrative,
    error
  }
}
