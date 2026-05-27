<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentStore } from '~/stores/student'
import { useLearningSession } from '~/composables/useLearningSession'
import { useTourStore, type TourStep } from '~/stores/tour'

import FeedbackPanel from '~/components/activity/FeedbackPanel.vue'
import BaseActivity from '~/components/activities/BaseActivity.vue'
import ChecklistInicial from '~/components/metacognition/ChecklistInicial.vue'
import PausaDeConciencia from '~/components/metacognition/PausaDeConciencia.vue'
import ReflexionPostActividad from '~/components/metacognition/ReflexionPostActividad.vue'
import MomentoMonitoreo from '~/components/metacognition/MomentoMonitoreo.vue'
import ChapterViewer from '~/components/narrative/ChapterViewer.vue'
import DragAndDropActivity from '~/components/activities/types/DragAndDropActivity.vue'
import ArgumentBuilderActivity from '~/components/activities/types/ArgumentBuilderActivity.vue'
import MultipleChoiceActivity from '~/components/activities/types/MultipleChoiceActivity.vue'
import TextMarkupActivity from '~/components/activities/types/TextMarkupActivity.vue'
import FillInTheBlankActivity from '~/components/activities/types/FillInTheBlankActivity.vue'
import MatchingActivity from '~/components/activities/types/MatchingActivity.vue'
import ClassificationActivity from '~/components/activities/types/ClassificationActivity.vue'
import TrafficLightActivity from '~/components/activities/types/TrafficLightActivity.vue'
import SequenceOrderActivity from '~/components/activities/types/SequenceOrderActivity.vue'
import ArrowMatchingActivity from '~/components/activities/types/ArrowMatchingActivity.vue'
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
  levelChangedAnnouncement,
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
  completeMonitoring,
  error,
  isSessionComplete
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
  // Leer la pista directamente del contenido de la actividad
  const manualHint = currentActivityData.value?.contenido?.pista || 
    currentActivityData.value?.materialApoyo?.pista || 
    "Observa con atención todos los elementos del texto y busca la información más precisa y específica."
  
  activeHint.value = manualHint
  showHint.value = true
  
  console.log('Ayuda solicitada para la actividad:', currentActivityData.value?.id)
}

// Resetear respuesta al cambiar de actividad
watch(currentActivityData, () => {
  studentAnswer.value = {}
})

const tourStore = useTourStore()

watch(currentState, (newState) => {
  if ((newState === 'ACTIVITY_PRESENTATION' || newState === 'ACTIVITY_IN_PROGRESS') && user.value?.role === 'STUDENT') {
    const learnSteps: TourStep[] = [
      {
        target: null,
        title: '¡Bienvenido a la Sala de Desafíos! 🎮',
        description: 'Aquí resolverás diversos retos interactivos para entrenar tu pensamiento crítico. Veamos qué tiene esta pantalla.',
        emoji: '💡',
        position: 'center'
      },
      {
        target: '#tour-progress-bars',
        title: 'Tu Progreso en Tiempo Real 📈',
        description: 'Estas barras muestran tu avance en la actividad actual, en la fase en la que te encuentras y en tu nivel global.',
        emoji: '📊',
        position: 'bottom'
      },
      {
        target: '#tour-story-btn',
        title: 'Releer la Historia 📖',
        description: 'Si tienes dudas o necesitas recordar el contexto de Mateo y su entorno, puedes presionar este botón para abrir la historia en cualquier momento.',
        emoji: '📚',
        position: 'bottom'
      },
      {
        target: '#tour-workspace',
        title: 'Espacio de Trabajo 🛠️',
        description: 'Esta es la zona de juego principal donde interactúas, seleccionas, clasificas o respondes los retos planteados.',
        emoji: '🧠',
        position: 'top'
      },
      {
        target: '#tour-confidence',
        title: 'Confianza Metacognitiva ⭐',
        description: 'Valora tu seguridad antes de responder: 1 estrella si dudas, 2 si tienes confianza, o 3 si estás totalmente seguro de tu respuesta. ¡Esto ayuda a tu entrenamiento mental!',
        emoji: '🧠',
        position: 'top'
      },
      {
        target: '#tour-submit',
        title: 'Enviar Solución ⚡',
        description: 'Una vez respondido el reto y seleccionada tu confianza, presiona este botón para que nuestro motor analice tu respuesta y te dé feedback inmediato.',
        emoji: '🚀',
        position: 'top'
      },
      {
        target: '#tour-help-btn',
        title: 'Pistas del Tutor ❔',
        description: '¿Te sientes atascado? No te preocupes. Haz clic en este botón de interrogación para pedirle una pista estratégica al tutor.',
        emoji: '🤝',
        position: 'top'
      },
      {
        target: null,
        title: '¡Todo listo! 🌟',
        description: '¡Ahora conoces a la perfección todas las herramientas! Demuestra tu agudeza mental resolviendo los retos.',
        emoji: '🧠',
        position: 'center'
      }
    ]
    
    // Un pequeño timeout para que el DOM de la actividad esté renderizado por completo
    setTimeout(() => {
      tourStore.autoStart('learn', learnSteps)
    }, 800)
  }
}, { immediate: true })
</script>

<template>
  <div class="font-sans">
    
    <!-- Onboarding de Primer Ingreso (bienvenida + contextualización) -->
    <WelcomeOnboarding
      v-if="currentState === 'ONBOARDING'"
      @complete="onOnboardingCompleted"
    />

    <!-- Momento Monitoreo Intermedio (Fase 1) -->
    <MomentoMonitoreo
      v-if="currentState === 'MONITORING_PENDING'"
      @continuar="completeMonitoring"
    />

    <!-- Anuncio de Nivel asignado por JOL o cambio dinámico -->
    <LevelAnnouncement
      v-if="currentState === 'LEVEL_ANNOUNCEMENT' && studentStore.progress.assignedLevel"
      :nivel="studentStore.progress.assignedLevel"
      :changeType="levelChangedAnnouncement || undefined"
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
        id="tour-story-btn"
        v-if="lastChapterData && (currentState === 'ACTIVITY_PRESENTATION' || currentState === 'ACTIVITY_IN_PROGRESS')"
        @click="reopenNarrative"
        class="fixed bottom-28 left-8 z-[90] flex items-center gap-2 bg-white border-2 border-slate-200 text-black font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-2xl shadow-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
      >
        <span class="text-base">📖</span>
        Ver Historia
      </button>
    </Transition>

    <!-- Contenedor Principal Unificado -->
    <main class="max-w-5xl mx-auto px-4 py-8 md:py-12 relative" v-show="currentState !== 'CELEBRATING' && currentState !== 'READING_NARRATIVE' && currentState !== 'ONBOARDING' && currentState !== 'LEVEL_ANNOUNCEMENT' && currentState !== 'MONITORING_PENDING'">
      
      <!-- Cargando Activity Data / Finalización -->
      <div v-if="!currentActivityData && currentState !== 'CHECKLIST_PENDING' && currentState !== 'REFLECTION_PENDING'" class="flex flex-col items-center justify-center py-12 text-center space-y-6">
        
        <!-- Tarjeta Premium de Felicitaciones -->
        <div v-if="isSessionComplete" class="max-w-xl w-full bg-white rounded-[48px] border-2 border-slate-100 p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden shadow-2xl shadow-indigo-600/5">
          <div class="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div class="relative inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-[28px] text-4xl mb-2">
            <span>🏆</span>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-ping"></div>
          </div>

          <div class="space-y-3">
            <h2 class="text-2xl font-black text-black uppercase tracking-tight italic">¡Felicitaciones, Explorador!</h2>
            <p class="text-sm font-semibold text-slate-700 leading-relaxed italic">
              Has completado con éxito todos los desafíos de esta etapa del Tutor SIMECT. Tu constancia y esfuerzo demuestran un excelente desarrollo de tu pensamiento crítico, metacognición y toma de decisiones éticas y responsables.
            </p>
          </div>

          <div class="pt-4">
            <NuxtLink 
              to="/dashboard"
              class="inline-block w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-slate-900/10"
            >
              Volver al Tablero Principal
            </NuxtLink>
          </div>
        </div>

        <template v-else>
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
            @click="loadNextActivity"
            class="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all"
          >
            {{ error ? 'Reintentar' : 'Cargar Manualmente' }}
          </button>
        </template>
      </div>

      <!-- La Actividad (Maneja todos los estados internos) -->
      <div v-else class="animate-in fade-in zoom-in-95 duration-500">
        <BaseActivity
          :title="currentActivityData?.titulo || 'Punto de Control'"
          :description="currentActivityData?.descripcion"
          :contexto="currentActivityData?.contenido?.contexto"
          :material-apoyo="currentActivityData?.materialApoyo"
          :state="currentState === 'CHECKLIST_PENDING' ? 'checklist' : (currentState === 'REFLECTION_PENDING' ? 'finished' : activityManager.state.value)"
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
              :key="currentActivityData.id"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <ArgumentBuilderActivity 
              v-else-if="currentActivityData?.tipo === 'ARGUMENT_BUILDER'"
              :key="currentActivityData.id"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <MultipleChoiceActivity 
              v-else-if="currentActivityData?.tipo === 'MULTIPLE_CHOICE_REASONED'"
              :key="currentActivityData.id"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <TextMarkupActivity 
              v-else-if="currentActivityData?.tipo === 'TEXT_MARKUP'"
              :key="currentActivityData.id"
              :contenido="currentActivityData.contenido"
              v-model="studentAnswer"
            />
            <FillInTheBlankActivity
              v-else-if="currentActivityData?.tipo === 'FILL_IN_THE_BLANK'"
              :key="currentActivityData.id"
              :contexto="currentActivityData.contenido?.contexto"
              :pregunta="currentActivityData.contenido?.pregunta"
              :plantilla="currentActivityData.contenido?.plantilla"
              :opciones="currentActivityData.contenido?.opciones || []"
              :state="activityManager.state.value"
              @update:answer="(v) => studentAnswer = v"
            />
            <MatchingActivity
              v-else-if="currentActivityData?.tipo === 'MATCHING'"
              :key="currentActivityData.id"
              :contexto="currentActivityData.contenido?.contexto"
              :pregunta="currentActivityData.contenido?.pregunta"
              :pares="currentActivityData.contenido?.pares || []"
              :opciones-derechas="currentActivityData.contenido?.opcionesDerechas || []"
              :pista="currentActivityData.contenido?.pista"
              :state="activityManager.state.value"
              @update:answer="(v) => studentAnswer = v"
            />
            <ClassificationActivity
              v-else-if="currentActivityData?.tipo === 'CLASSIFICATION'"
              :key="currentActivityData.id"
              :contexto="currentActivityData.contenido?.contexto"
              :pregunta="currentActivityData.contenido?.pregunta"
              :columnas="currentActivityData.contenido?.columnas || []"
              :items="currentActivityData.contenido?.items || []"
              :pista="currentActivityData.contenido?.pista"
              :state="activityManager.state.value"
              @update:answer="(v) => studentAnswer = v"
            />
            <TrafficLightActivity
              v-else-if="currentActivityData?.tipo === 'TRAFFIC_LIGHT'"
              :key="currentActivityData.id"
              :contexto="currentActivityData.contenido?.contexto"
              :pregunta="currentActivityData.contenido?.pregunta"
              :fuentes="currentActivityData.contenido?.fuentes || []"
              :pista="currentActivityData.contenido?.pista"
              :state="activityManager.state.value"
              @update:answer="(v) => studentAnswer = v"
            />
            <SequenceOrderActivity
              v-else-if="currentActivityData?.tipo === 'SEQUENCE_ORDER'"
              :key="currentActivityData.id"
              :contexto="currentActivityData.contenido?.contexto"
              :pregunta="currentActivityData.contenido?.pregunta"
              :items="currentActivityData.contenido?.items || []"
              :pista="currentActivityData.contenido?.pista"
              :state="activityManager.state.value"
              @update:answer="(v) => studentAnswer = v"
            />
            <ArrowMatchingActivity
              v-else-if="currentActivityData?.tipo === 'ARROW_MATCHING'"
              :key="currentActivityData.id"
              :contexto="currentActivityData.contenido?.contexto"
              :pregunta="currentActivityData.contenido?.pregunta"
              :izquierda="currentActivityData.contenido?.izquierda || []"
              :derecha="currentActivityData.contenido?.derecha || []"
              :pista="currentActivityData.contenido?.pista"
              :state="activityManager.state.value"
              @update:answer="(v) => studentAnswer = v"
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
