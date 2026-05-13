export const useMetacognition = () => {
  const studentStore = useStudentStore()

  // Estado para capturar datos temporalmente en la UI
  const currentConfidenceBefore = ref<number | null>(null)
  const currentConfidenceAfter = ref<number | null>(null)
  const currentReflectionText = ref<string>('')

  // 1. Enviar Checklist Inicial
  const submitChecklist = async (data: Record<string, number | string>) => {
    // Aquí se enviaría a la API: POST /api/metacognition/checklist
    console.log('Enviando Checklist Inicial:', data)
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 500))
    studentStore.completeChecklist()
  }

  // 2. Establecer Confianza Pre-Actividad
  const setConfidenceBefore = (value: number) => {
    currentConfidenceBefore.value = value
  }

  // 3. Enviar Reflexión Post-Actividad (con confianza final)
  const submitReflection = async (afterConfidence: number, text: string) => {
    currentConfidenceAfter.value = afterConfidence
    currentReflectionText.value = text

    console.log('Enviando Reflexión Post-Actividad:', {
      before: currentConfidenceBefore.value,
      after: currentConfidenceAfter.value,
      text: currentReflectionText.value
    })

    // Limpiar para la próxima actividad
    currentConfidenceBefore.value = null
    currentConfidenceAfter.value = null
    currentReflectionText.value = ''

    // Tras completar la actividad y reflexionar, incrementamos el contador
    // El store decidirá si se debe abrir la Pausa de Conciencia
    studentStore.incrementActivityCount()
  }

  // 4. Completar Pausa de Conciencia
  const submitConsciousPause = async (feeling: string) => {
    console.log('Pausa completada con estado:', feeling)
    await new Promise(resolve => setTimeout(resolve, 600))
    studentStore.completeConsciousPause()
  }

  return {
    isPausePending: computed(() => studentStore.isPausePending),
    isChecklistPending: computed(() => studentStore.isChecklistPending),
    currentConfidenceBefore: readonly(currentConfidenceBefore),
    setConfidenceBefore,
    submitChecklist,
    submitReflection,
    submitConsciousPause
  }
}
