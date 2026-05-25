<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentStore } from '~/stores/student'
import { useLearningSession } from '~/composables/useLearningSession'

import FeedbackPanel from '~/components/activity/FeedbackPanel.vue'
import BaseActivity from '~/components/activities/BaseActivity.vue'
import ChecklistInicial from '~/components/metacognition/ChecklistInicial.vue'
import PausaDeConciencia from '~/components/metacognition/PausaDeConciencia.vue'
import ReflexionPostActividad from '~/components/metacognition/ReflexionPostActividad.vue'
import ChapterViewer from '~/components/narrative/ChapterViewer.vue'
import DragAndDropActivity from '~/components/activities/types/DragAndDropActivity.vue'
import ArgumentBuilderActivity from '~/components/activities/types/ArgumentBuilderActivity.vue'
import MultipleChoiceActivity from '~/components/activities/types/MultipleChoiceActivity.vue'
import TextMarkupActivity from '~/components/activities/types/TextMarkupActivity.vue'
import PointsAnimation from '~/components/gamification/PointsAnimation.vue'
import LevelUpCelebration from '~/components/celebrations/LevelUpCelebration.vue'
import BadgeUnlocked from '~/components/celebrations/BadgeUnlocked.vue'
import WelcomeOnboarding from '~/components/onboarding/WelcomeOnboarding.vue'
import LevelAnnouncement from '~/components/onboarding/LevelAnnouncement.vue'

definePageMeta({ layout: 'main' })

const route = useRoute()
const studentStore = useStudentStore()
const { user } = useUserSession()

if (route.params.level && route.params.phase) {
  studentStore.setProgress({
    level: (route.params.level as any).toUpperCase(),
    phase: (route.params.phase as any).toUpperCase(),
    studentProfileId: user.value?.studentProfileId || null
  })
}

const {
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
  advanceFromFeedback,
  finishCelebration,
  finishNarrative,
  completeReflection,
  error
} = useLearningSession()

const studentAnswer = ref<any>({})
const showHint = ref(false)
const activeHint = ref('')

// Cola de insignias para mostrar una por una
const pendingBadges = ref<any[]>([])
const currentBadge = computed(() => pendingBadges.value[0] || null)
const dismissBadge = () => { pendingBadges.value.shift() }

// Escuchar cuando llegan insignias desde el resultado de la sesión
watch(() => lastEvaluation.value, (evaluation) => {
  if (evaluation?.newBadges?.length) {
    pendingBadges.value.push(...evaluation.newBadges)
  }
})

const handleRequestHelp = () => {
  // Tomar la pista del material de apoyo o usar una genérica pedagógica
  const manualHint = currentActivityData.value?.materialApoyo?.pista || 
    "Observa bien las categorías: las causas directas son acciones físicas inmediatas, mientras que las indirectas son factores sociales que ocurren de fondo."
  
  activeHint.value = manualHint
  showHint.value = true
  
  // Registrar el uso de ayuda para el motor pedagógico
  console.log('Ayuda solicitada para la actividad:', currentActivityId.value)
}

// Resetear respuesta al cambiar de actividad
watch(currentActivityData, () => {
  studentAnswer.value = {}
})
</script>

<template>
  <div class="font-sans">
    
    <!-- Onboarding de Primer Ingreso (bienvenida + contextualización) -->
    <WelcomeOnboarding
      v-if="currentState === 'ONBOARDING'"
      @complete="onOnboardingCompleted"
    />

    <!-- Anuncio de Nivel asignado por JOL -->
    <LevelAnnouncement
      v-if="currentState === 'LEVEL_ANNOUNCEMENT' && studentStore.progress.assignedLevel"
      :nivel="studentStore.progress.assignedLevel"
      @continue="dismissLevelAnnouncement"
    />

    <!-- Pantalla de Error Amigable -->
    <UiFriendlyError v-if="!!error" :message="error" />

    <!-- Superposiciones de Celebración y Narrativa -->
    <LevelUpCelebration
      v-if="currentState === 'CELEBRATING'"
      @continue="finishCelebration"
    />

    <ChapterViewer
      v-if="currentState === 'READING_NARRATIVE' && narrativeChapterData"
      :chapterData="narrativeChapterData"
      @complete="finishNarrative"
    />

    <!-- Modal de Nueva Insignia -->
    <BadgeUnlocked
      v-if="currentBadge"
      :badge="currentBadge"
      @close="dismissBadge"
    />

    <!-- Animación de puntos -->
    <PointsAnimation
      :points="lastEvaluation?.scoreDetails?.totalGained || 0"
      :show="currentState === 'FEEDBACK' || currentState === 'REFLECTION_PENDING'"
    />

    <!-- Botón flotante Ver Historia (siempre visible durante la actividad) -->
    <Transition name="slide-fade">
      <button
        v-if="lastChapterData && (currentState === 'ACTIVITY_PRESENTATION' || currentState === 'ACTIVITY_IN_PROGRESS')"
        @click="reopenNarrative"
        class="fixed bottom-28 left-8 z-[90] flex items-center gap-2 bg-white border-2 border-slate-200 text-black font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-2xl shadow-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
      >
        <span class="text-base">📖</span>
        Ver Historia
      </button>
    </Transition>

    <!-- Contenedor Principal Unificado -->
    <main class="max-w-5xl mx-auto px-4 py-8 md:py-12 relative" v-show="currentState !== 'CELEBRATING' && currentState !== 'READING_NARRATIVE' && currentState !== 'ONBOARDING' && currentState !== 'LEVEL_ANNOUNCEMENT'">
      
      <!-- Cargando Activity Data -->
      <div v-if="!currentActivityData && currentState !== 'CHECKLIST_PENDING'" class="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div v-if="!error" class="h-16 w-16 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
        <div v-else class="text-4xl">⚠️</div>
        
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-black">
            {{ error || 'Cargando desafío...' }}
          </h3>
          <p v-if="error" class="text-sm text-black/70 max-w-xs mx-auto">
            Hubo un problema al conectar con el sendero. ¿Quieres intentar de nuevo?
          </p>
        </div>

        <button 
          v-if="error || !currentActivityData" 
          @click="loadNextActivity"
          class="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all"
        >
          {{ error ? 'Reintentar' : 'Cargar Manualmente' }}
        </button>
      </div>

      <!-- La Actividad (Maneja todos los estados internos) -->
      <div v-else class="animate-in fade-in zoom-in-95 duration-500">
        <BaseActivity
          :title="currentActivityData?.titulo || 'Planificación Inicial'"
          :description="currentActivityData?.descripcion"
          :material-apoyo="currentActivityData?.materialApoyo"
          :state="currentState === 'CHECKLIST_PENDING' ? 'checklist' : activityManager.state.value"
          :time-formatted="activityManager.formattedTime.value"
          :progress="{ 
            activity: studentStore.progress.currentActivityProgress, 
            phase: studentStore.progress.currentPhaseProgress, 
            level: studentStore.progress.currentLevelProgress 
          }"
          :total-points="studentStore.progress.totalPoints"
          :max-score="currentActivityData?.puntajeMaximo"
          :student-level="studentStore.progress.assignedLevel"
          v-model:priorConfidence="activityManager.priorConfidence.value"
          @start="startCurrentActivity"
          @submit="submitCurrentActivity(studentAnswer, activityManager.priorConfidence.value)"
          @pauseMetacognitiva="studentStore.requestChecklist('He tenido dificultades con esta actividad')"
          @request-help="handleRequestHelp"
        >
          <!-- Slot 0: Checklist JOL -->
          <template #checklist>
            <ChecklistInicial
              :onboarding-data="onboardingData"
              @submit="onChecklistCompleted"
            />
          </template>

          <!-- Slot 1: El Ejercicio (Dinámico según el tipo) -->
          <div v-if="activityManager.state.value !== 'idle' && activityManager.state.value !== 'finished' && currentState !== 'CHECKLIST_PENDING'" class="w-full">
            <DragAndDropActivity 
              v-if="currentActivityData?.tipo === 'DRAG_AND_DROP'"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <ArgumentBuilderActivity 
              v-else-if="currentActivityData?.tipo === 'ARGUMENT_BUILDER'"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <MultipleChoiceActivity 
              v-else-if="currentActivityData?.tipo === 'MULTIPLE_CHOICE_REASONED'"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <TextMarkupActivity 
              v-else-if="currentActivityData?.tipo === 'TEXT_MARKUP'"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <div v-else class="p-12 text-center text-black font-bold">
              Tipo de actividad no soportado: {{ currentActivityData?.tipo }}
            </div>
          </div>

          <!-- Slot 2: Los Resultados / Reflexión -->
          <template #results>
            <div v-if="currentState === 'REFLECTION_PENDING'" class="animate-in slide-in-from-bottom-8 duration-700">
               <ReflexionPostActividad @continuar="completeReflection" />
            </div>
            <FeedbackPanel 
              v-else
              :decision="lastEvaluation" 
              @continue="advanceFromFeedback" 
            />
          </template>
        </BaseActivity>
      </div>

    </main>

    <!-- PISTA ESTRATÉGICA (Sección 5.3.1) -->
    <Transition name="slide-fade">
      <div v-if="showHint" class="fixed bottom-24 right-8 z-[100] max-w-sm">
        <div class="bg-indigo-600 text-white p-6 rounded-[32px] shadow-2xl relative overflow-hidden ring-4 ring-white dark:ring-slate-900">
          <div class="absolute top-0 right-0 p-2">
            <button @click="showHint = false" class="hover:bg-white/20 rounded-full p-1 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <span class="text-xl">💡</span>
            </div>
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest opacity-70 block mb-1">Pista del Tutor</span>
              <p class="text-sm font-medium leading-relaxed italic">"{{ activeHint }}"</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-fade-leave-active { transition: all 0.3s cubic-bezier(0.7, 0, 0.84, 0); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(20px) scale(0.9); opacity: 0; }
</style>
