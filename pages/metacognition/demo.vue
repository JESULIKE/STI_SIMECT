<template>
  <div class="mx-auto max-w-4xl py-8 space-y-12">
    
    <div class="text-center space-y-2 mb-8">
      <h1 class="text-3xl font-bold text-surface-900">Demostración Metacognitiva</h1>
      <p class="text-surface-600">
        Prueba el flujo de calibración y pausas conscientes del Motor Pedagógico.
      </p>
    </div>

    <!-- Panel de Control Demo -->
    <div class="flex flex-wrap gap-4 rounded-2xl bg-surface-100 p-4">
      <button @click="resetDemo" class="rounded-lg bg-surface-200 px-4 py-2 text-sm font-medium hover:bg-surface-300">
        🔄 Reiniciar Todo
      </button>
      <button @click="studentStore.incrementActivityCount()" class="rounded-lg bg-primary-100 text-primary-800 px-4 py-2 text-sm font-medium hover:bg-primary-200">
        ➕ Simular 1 Actividad completada (Llevas: {{ studentStore.progress.activitiesSinceLastPause }}/3)
      </button>
      <button @click="studentStore.requestChecklist('Demostración')" class="rounded-lg bg-warning-100 text-warning-800 px-4 py-2 text-sm font-medium hover:bg-warning-200">
        📋 Forzar Checklist Inicial
      </button>
    </div>

    <!-- 1. CHECKLIST INICIAL (Condicional) -->
    <div v-if="meta.isChecklistPending.value" class="animate-fade-in">
      <div class="mb-4 flex items-center gap-2 text-warning-600">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="font-bold">El Motor Pedagógico solicitó un Checklist de Planificación</span>
      </div>
      <MetacognitionChecklistInicial @submit="meta.submitChecklist" />
    </div>

    <!-- Flujo de Actividad Normal -->
    <div v-else class="space-y-8 animate-fade-in">
      
      <!-- 2. PRE-ACTIVIDAD -->
      <div v-if="!isActivityStarted && !isActivityDone">
        <MetacognitionConfianzaPreActividad v-model="confidenceBefore" />
        <div class="mt-6 text-center">
          <button
            class="rounded-xl bg-primary-700 px-8 py-3 font-bold text-white shadow-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-all"
            :disabled="confidenceBefore === 0"
            @click="startActivity"
          >
            Iniciar Actividad
          </button>
          <p v-if="confidenceBefore === 0" class="mt-2 text-sm text-surface-500">Debes calificar tu confianza primero.</p>
        </div>
      </div>

      <!-- 3. LA ACTIVIDAD EN SÍ (Simulada) -->
      <div v-if="isActivityStarted && !isActivityDone" class="rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50 p-12 text-center animate-slide-up">
        <h2 class="text-2xl font-bold text-primary-900 mb-4">Resolviendo Actividad...</h2>
        <p class="text-primary-700 mb-8">
          Aquí iría el ejercicio matemático o de lectura.
        </p>
        <button
          class="rounded-xl bg-accent-500 px-8 py-3 font-bold text-white shadow-md hover:bg-accent-600 transition-all"
          @click="finishActivity"
        >
          ¡He Terminado!
        </button>
      </div>

      <!-- 4. POST-ACTIVIDAD -->
      <div v-if="isActivityDone" class="animate-slide-up">
        <MetacognitionReflexionPostActividad @submit="handlePostSubmit" />
      </div>

    </div>

    <!-- 5. MODAL DE PAUSA (Condicional global) -->
    <MetacognitionPausaDeConciencia
      :is-open="meta.isPausePending.value"
      @complete="meta.submitConsciousPause"
    />

  </div>
</template>

<script setup lang="ts">
const studentStore = useStudentStore()
const meta = useMetacognition()

const confidenceBefore = ref(0)
const isActivityStarted = ref(false)
const isActivityDone = ref(false)

const startActivity = () => {
  meta.setConfidenceBefore(confidenceBefore.value)
  isActivityStarted.value = true
}

const finishActivity = () => {
  isActivityDone.value = true
}

const handlePostSubmit = (data: { confidence: number, text: string }) => {
  meta.submitReflection(data.confidence, data.text)
  // Reset for next demo activity
  resetDemo()
}

const resetDemo = () => {
  confidenceBefore.value = 0
  isActivityStarted.value = false
  isActivityDone.value = false
  studentStore.completeChecklist()
}
</script>
