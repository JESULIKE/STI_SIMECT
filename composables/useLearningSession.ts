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
  
  const currentState = ref<SessionState>(
    studentStore.isChecklistPending ? 'CHECKLIST_PENDING' : 'ACTIVITY_PRESENTATION'
  )
  
  const currentActivityData = ref<any>(null)
  const currentActivityId = computed(() => currentActivityData.value?.id || '')
  const lastEvaluation = ref<any>(null)
  const narrativeChapterData = ref<any>(null)
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
    console.log(`[Session] tryShowSubPhaseContext para subfase: ${subPhase}. Vistas en esta sesión:`, [...seen])
    if (seen.has(subPhase)) {
      console.log(`[Session] La subfase ${subPhase} ya fue vista en esta sesión, omitiendo contexto.`)
      return false
    }

    try {
      console.log(`[Session] Cargando contexto narrativo para subfase ${subPhase} desde el servidor...`)
      const response: any = await $fetch('/api/narrative/chapter', {
        query: { subPhase }
      })
      if (response.success && response.isContext && response.data) {
        console.log(`[Session] Contexto obtenido con éxito para ${subPhase}:`, response.data)
        narrativeChapterData.value = response.data
        markSubPhaseSeen(subPhase)
        currentState.value = 'READING_NARRATIVE'
        console.log(`[Session] Estado cambiado a READING_NARRATIVE`)
        return true
      } else {
        console.warn(`[Session] Respuesta del servidor no válida para contexto de ${subPhase}:`, response)
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
        console.log('Actividad cargada desde metadata:', response.firstActivity.id)
        currentActivityData.value = response.firstActivity
        activityManager.resetTimer()
        console.log('Actividad lista:', currentActivityData.value.titulo)

        // ── Detectar si entramos a una subfase nueva y mostrar su contexto ────
        const newSubPhase = response.activeSubPhase as string | null
        console.log(`[Session] Comparando subfases. Nueva activa: ${newSubPhase}, Anterior activa registrada: ${currentActiveSubPhase.value}`)
        if (newSubPhase && newSubPhase !== currentActiveSubPhase.value) {
          console.log(`[Session] ¡Nueva subfase detectada! ${newSubPhase} (anterior: ${currentActiveSubPhase.value || 'ninguna'})`)
          currentActiveSubPhase.value = newSubPhase
          // tryShowSubPhaseContext cambiará el estado a READING_NARRATIVE si corresponde.
          // Si devuelve false (ya visto), el llamador pondrá ACTIVITY_PRESENTATION.
          const showed = await tryShowSubPhaseContext(newSubPhase)
          console.log(`[Session] tryShowSubPhaseContext de ${newSubPhase} devolvió:`, showed)
          if (showed) return // el flujo continúa desde finishNarrative
        }
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
      
      // 3. Cargar próxima actividad (puede cambiar a READING_NARRATIVE si es subfase nueva)
      await loadNextActivity()
      
      // 4. Cambiar estado visual solo si loadNextActivity no puso otro estado
      if (currentState.value === 'CHECKLIST_PENDING') {
        currentState.value = 'ACTIVITY_PRESENTATION'
      }
    } catch (e) {
      console.error('Error al guardar planificación:', e)
      // Fallback para no bloquear al estudiante si falla la red/DB
      studentStore.completeChecklist()
      await loadNextActivity()
      if (currentState.value === 'CHECKLIST_PENDING') {
        currentState.value = 'ACTIVITY_PRESENTATION'
      }
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
  if (currentState.value === 'CHECKLIST_PENDING') {
    console.log('[Session] Planificación inicial pendiente. Limpiando subfases vistas de sessionStorage para reiniciar el flujo.')
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
