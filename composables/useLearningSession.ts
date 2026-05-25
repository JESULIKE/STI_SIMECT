import { ref, computed } from 'vue'
import { useStudentStore } from '../stores/student'
import { useActivity } from './useActivity'
import { useGamification } from './useGamification'

export type SessionState = 
  | 'ONBOARDING'          // Primera vez: bienvenida + contextualización
  | 'CHECKLIST_PENDING'   // Planeación metacognitiva JOL
  | 'LEVEL_ANNOUNCEMENT'  // Muestra el nivel asignado por JOL
  | 'ACTIVITY_PRESENTATION' 
  | 'ACTIVITY_IN_PROGRESS' 
  | 'EVALUATING' 
  | 'FEEDBACK' 
  | 'REFLECTION_PENDING' 
  | 'CELEBRATING'
  | 'READING_NARRATIVE'
  | 'DECISION_ROUTING'

/**
 * Obtiene el Set de subfases cuyo contexto ya fue mostrado en esta sesión de navegador.
 * Se persiste en sessionStorage para que no se repita si el estudiante recarga la página
 * dentro de la misma sesión del navegador.
 */
function getSeenSubPhases(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem('simect_seen_subphases')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function markSubPhaseSeen(sp: string) {
  if (typeof window === 'undefined') return
  try {
    const seen = getSeenSubPhases()
    seen.add(sp)
    sessionStorage.setItem('simect_seen_subphases', JSON.stringify([...seen]))
  } catch {}
}

export function useLearningSession() {
  const studentStore = useStudentStore()
  const gamification = useGamification()

  /**
   * Determina el estado inicial:
   * - Si el checklist está pendiente Y es el primer ingreso (0 actividades completadas)
   *   → ONBOARDING (bienvenida + contextualización)
   * - Si el checklist está pendiente pero ya hay actividades previas
   *   → CHECKLIST_PENDING (planeación de sesión)
   * - De lo contrario → ACTIVITY_PRESENTATION
   */
  const isFirstTimeStudent = studentStore.isChecklistPending && studentStore.progress.activitiesCompleted === 0

  const currentState = ref<SessionState>(
    isFirstTimeStudent
      ? 'ONBOARDING'
      : studentStore.isChecklistPending
        ? 'CHECKLIST_PENDING'
        : 'ACTIVITY_PRESENTATION'
  )
  
  // Datos del onboarding (se pasan al checklist para guardarse juntos en la BD)
  const onboardingData = ref<{ comprensionSIMECT: number; familiaridadTema: number } | null>(null)

  const currentActivityData = ref<any>(null)
  const currentActivityId = computed(() => currentActivityData.value?.id || '')
  const lastEvaluation = ref<any>(null)
  const narrativeChapterData = ref<any>(null)
  // Guarda el último capítulo leído para poder reabrirlo
  const lastChapterData = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Rastrea la subfase activa para detectar transiciones
  const currentActiveSubPhase = ref<string | null>(null)

  const activityManager = useActivity(currentActivityId)

  /**
   * Intenta obtener el contexto narrativo para una subfase.
   * Si existe y no fue mostrado aún en esta sesión, cambia el estado a READING_NARRATIVE.
   * Devuelve true si se mostró el contexto, false si se saltó (ya visto).
   */
  const tryShowSubPhaseContext = async (subPhase: string): Promise<boolean> => {
    const seen = getSeenSubPhases()
    if (seen.has(subPhase)) return false

    try {
      const response: any = await $fetch('/api/narrative/chapter', { query: { subPhase } })
      if (response.success && response.isContext && response.data) {
        narrativeChapterData.value = response.data
        lastChapterData.value = response.data  // Guardar para poder reabrir
        markSubPhaseSeen(subPhase)
        currentState.value = 'READING_NARRATIVE'
        return true
      }
    } catch (e) {
      console.warn('[Session] No se pudo cargar el contexto narrativo para subfase', subPhase, e)
    }
    return false
  }

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
        currentActivityData.value = response.firstActivity
        activityManager.resetTimer()

        // Sincronizar nivel adaptativo si viene en la respuesta
        if (response.studentLevel) {
          studentStore.setAssignedLevel(response.studentLevel)
        }

        const newSubPhase = response.activeSubPhase as string | null
        if (newSubPhase && newSubPhase !== currentActiveSubPhase.value) {
          currentActiveSubPhase.value = newSubPhase
          const showed = await tryShowSubPhaseContext(newSubPhase)
          if (showed) return
        }
      } else {
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

  /**
   * Llamado cuando el wizard de Onboarding termina.
   * Guarda los datos del onboarding y transiciona al Checklist JOL.
   */
  const onOnboardingCompleted = (data: { comprensionSIMECT: number; familiaridadTema: number }) => {
    console.log('[Session] Onboarding completado. Datos:', data)
    onboardingData.value = data
    currentState.value = 'CHECKLIST_PENDING'
  }

  const onChecklistCompleted = async (data: any) => {
    try {
      // Guardar en DB: JOL + datos de onboarding. El endpoint ahora devuelve el nivel.
      const result: any = await $fetch('/api/student/metacognition/checklist', {
        method: 'POST',
        body: {
          ...data,
          comprensionSIMECT: data.comprensionSIMECT ?? onboardingData.value?.comprensionSIMECT ?? null,
          familiaridadTema:  data.familiaridadTema  ?? onboardingData.value?.familiaridadTema  ?? null,
        }
      })
      
      studentStore.completeChecklist()

      // Si la API devuelve nivel, mostramos el anuncio de nivel
      if (result?.nivel) {
        studentStore.setAssignedLevel(result.nivel)
        currentState.value = 'LEVEL_ANNOUNCEMENT'
      } else {
        // Fallback sin nivel
        await loadNextActivity()
        if (currentState.value === 'CHECKLIST_PENDING') currentState.value = 'ACTIVITY_PRESENTATION'
      }
    } catch (e) {
      console.error('Error al guardar planificación:', e)
      studentStore.completeChecklist()
      await loadNextActivity()
      if (currentState.value === 'CHECKLIST_PENDING') currentState.value = 'ACTIVITY_PRESENTATION'
    }
  }

  /**
   * El estudiante dismiss el anuncio de nivel → cargar primera actividad (con historia).
   */
  const dismissLevelAnnouncement = async () => {
    await loadNextActivity()
    if (currentState.value === 'LEVEL_ANNOUNCEMENT') {
      currentState.value = 'ACTIVITY_PRESENTATION'
    }
  }

  /**
   * Reabre el contexto narrativo de la subfase actual para que el estudiante pueda releerlo.
   */
  const reopenNarrative = () => {
    if (lastChapterData.value) {
      narrativeChapterData.value = lastChapterData.value
      currentState.value = 'READING_NARRATIVE'
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
      
      if (result.decision.progressBars) {
        studentStore.updateProgressBars(result.decision.progressBars)
      }

      // Sincronizar nivel adaptativo si cambió
      if (result.decision.currentLevel) {
        studentStore.setAssignedLevel(result.decision.currentLevel)
      }

      activityManager.state.value = 'finished'

      currentState.value = 'FEEDBACK'
      
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

    // Después de la reflexión, cargamos la siguiente subfase
    // loadNextActivity mostrará el contexto si es una subfase nueva
    await loadNextActivity()
    if (currentState.value === 'REFLECTION_PENDING') {
      currentState.value = 'ACTIVITY_PRESENTATION'
    }
  }

  const advanceFromFeedback = async () => {
    const action = lastEvaluation.value?.action
    if (action === 'REINFORCEMENT') {
      currentState.value = 'ACTIVITY_PRESENTATION'
      activityManager.resetTimer()
      return
    }
    
    if (lastEvaluation.value?.isSubPhaseComplete) {
      // Subfase completada → primero la reflexión metacognitiva
      currentState.value = 'REFLECTION_PENDING'
    } else {
      if (action === 'CHALLENGE_UNLOCK' || lastEvaluation.value?.unlockChapter) {
        gamification.processLevelUp()
        currentState.value = 'CELEBRATING'
        return
      }
      // Actividad normal completada → siguiente actividad (misma subfase)
      currentState.value = 'ACTIVITY_PRESENTATION'
      loadNextActivity()
    }
  }

  const finishCelebration = async () => {
    // Eliminado el capítulo de celebración narrativo de "Crónica del Bosque" por completo a petición del usuario.
    // Avanzamos directamente a la presentación de la siguiente actividad o subfase.
    console.log('[Session] Celebración terminada. Avanzando directo a la siguiente actividad.')
    currentState.value = 'ACTIVITY_PRESENTATION'
    await loadNextActivity()
  }

  const finishNarrative = async () => {
    // Después de leer un contexto o capítulo de celebración, continuamos a la actividad
    currentState.value = 'ACTIVITY_PRESENTATION'
    // Si ya tenemos la actividad cargada (contexto previo a subfase), no recargamos
    if (!currentActivityData.value) {
      await loadNextActivity()
    }
  }

  // Init
  if (currentState.value === 'ONBOARDING' || currentState.value === 'CHECKLIST_PENDING') {
    console.log('[Session] Primer ingreso o sesión nueva. Limpiando subfases vistas de sessionStorage.')
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('simect_seen_subphases')
        console.log('[Session] sessionStorage "simect_seen_subphases" limpio con éxito.')
      } catch (e) {
        console.warn('[Session] No se pudo limpiar sessionStorage:', e)
      }
    }
  } else if (currentState.value === 'ACTIVITY_PRESENTATION') {
    loadNextActivity()
  }

  return {
    currentState,
    currentActivityData,
    lastEvaluation,
    narrativeChapterData,
    lastChapterData,
    onboardingData,
    activityManager,
    loadNextActivity,
    onOnboardingCompleted,
    onChecklistCompleted,
    dismissLevelAnnouncement,
    reopenNarrative,
    startCurrentActivity,
    submitCurrentActivity,
    completeReflection,
    advanceFromFeedback,
    finishCelebration,
    finishNarrative,
    error
  }
}
