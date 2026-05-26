<template>
  <Transition name="fade">
    <div
      v-if="tourStore.isActive && tourStore.currentStep"
      class="fixed inset-0 z-[9999] overflow-hidden select-none"
    >
      <!-- SVG Spotlight Overlay Backdrop -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <!-- Capa blanca completa (deja pasar el fondo oscuro) -->
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <!-- Recorte negro (hace el hueco transparente en el overlay) -->
            <rect
              v-if="rect"
              :x="rect.x - padding"
              :y="rect.y - padding"
              :width="rect.width + padding * 2"
              :height="rect.height + padding * 2"
              rx="12"
              ry="12"
              fill="black"
              class="transition-all duration-300 ease-out"
            />
          </mask>
        </defs>
        <!-- Overlay oscuro que cubre toda la pantalla usando la máscara -->
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(8, 15, 30, 0.78)"
          mask="url(#spotlight-mask)"
          class="pointer-events-auto cursor-default"
          @click="handleBackdropClick"
        />
      </svg>

      <!-- Resaltador de contorno animado (pulso dorado sobre el elemento enfocado) -->
      <div
        v-if="rect"
        class="absolute border-2 border-amber-400 rounded-xl pointer-events-none shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-300 ease-out animate-pulse-glow"
        :style="{
          left: `${rect.x - padding}px`,
          top: `${rect.y - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`
        }"
      />

      <!-- Globo de Diálogo Flotante -->
      <div
        ref="dialogRef"
        class="absolute transition-all duration-300 ease-out pointer-events-auto"
        :style="dialogStyle"
      >
        <div
          class="relative w-full rounded-2xl bg-slate-900/95 border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md text-white p-5 select-text overflow-hidden"
        >
          <!-- Efecto de luz de fondo del globo -->
          <div class="absolute -right-16 -top-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div class="absolute -left-16 -bottom-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <!-- Cabecera del diálogo -->
          <div class="flex items-start gap-3.5 mb-3">
            <div
              class="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 shadow-inner animate-bounce-subtle"
            >
              <span class="text-2xl">{{ tourStore.currentStep.emoji || '💡' }}</span>
            </div>
            <div class="flex-grow min-w-0 pt-0.5">
              <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                GUÍA DE ENTRENAMIENTO
              </span>
              <h3 class="text-base font-extrabold text-white leading-tight truncate">
                {{ tourStore.currentStep.title }}
              </h3>
            </div>
            <!-- Botón cerrar rápido (x) -->
            <button
              class="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors"
              title="Cerrar guía (Esc)"
              @click="tourStore.endTour()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Descripción -->
          <p class="text-sm text-slate-300 leading-relaxed mb-4">
            {{ tourStore.currentStep.description }}
          </p>

          <!-- Barra de Progreso Interna -->
          <div class="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden border border-slate-700/50">
            <div
              class="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full transition-all duration-300"
              :style="{ width: `${tourStore.progress}%` }"
            />
          </div>

          <!-- Controles de Navegación -->
          <div class="flex items-center justify-between gap-2 mt-2">
            <!-- Paso actual en números -->
            <span class="text-xs font-mono font-bold text-slate-400">
              {{ tourStore.currentIndex + 1 }} / {{ tourStore.steps.length }}
            </span>

            <div class="flex items-center gap-2">
              <!-- Botón omitir (solo si no es el último paso) -->
              <button
                v-if="!tourStore.isLastStep"
                class="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-150"
                @click="tourStore.endTour()"
              >
                Omitir
              </button>

              <!-- Botón Atrás -->
              <button
                v-if="!tourStore.isFirstStep"
                class="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all duration-150 active:scale-95"
                @click="tourStore.prevStep()"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                Atrás
              </button>

              <!-- Botón Siguiente / Finalizar -->
              <button
                class="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border border-amber-500/30 rounded-lg shadow-lg shadow-amber-500/10 transition-all duration-150 active:scale-95 animate-pulse-subtle"
                @click="tourStore.nextStep()"
              >
                <span v-if="tourStore.isLastStep">Comprendido 🚀</span>
                <span v-else class="flex items-center gap-0.5">
                  Siguiente
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useTourStore } from '~/stores/tour'

const tourStore = useTourStore()
const padding = 8

// Referencias y coordenadas
const rect = ref<{ x: number; y: number; width: number; height: number } | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const dialogStyle = ref<Record<string, string>>({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '380px',
  maxWidth: 'calc(100vw - 24px)',
})

// Buscar elemento y actualizar coordenadas
const updateRect = () => {
  if (!tourStore.isActive || !tourStore.currentStep) {
    rect.value = null
    return
  }

  const selector = tourStore.currentStep.target
  if (!selector) {
    rect.value = null
    return
  }

  const el = document.querySelector(selector)
  if (el) {
    // Si no está completamente visible en pantalla, lo desplazamos suavemente
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
    
    // Esperamos un instante a que finalice el scroll antes de capturar el rectángulo
    setTimeout(() => {
      const r = el.getBoundingClientRect()
      rect.value = {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
      }
    }, 150)
  } else {
    // Si el elemento no existe en esta vista, no mostramos spotlight (lo dejamos centrado)
    rect.value = null
  }
}

// Calcular la posición óptima del globo de diálogo sin desbordarse de la pantalla
const calculateDialogPosition = () => {
  if (!tourStore.isActive) return

  // Si no hay target, centramos el diálogo
  if (!rect.value) {
    dialogStyle.value = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '380px',
      maxWidth: 'calc(100vw - 24px)',
    }
    return
  }

  const r = rect.value
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const dialogWidth = dialogRef.value?.offsetWidth || 380
  const dialogHeight = dialogRef.value?.offsetHeight || 220
  const gap = 16

  let top = 0
  let left = 0
  let transform = ''

  const preferredPosition = tourStore.currentStep?.position || 'bottom'

  if (preferredPosition === 'bottom') {
    top = r.y + r.height + gap
    left = r.x + r.width / 2
    transform = 'translateX(-50%)'

    // Si se sale por abajo de la pantalla, invertimos a arriba
    if (top + dialogHeight > viewportHeight - 16) {
      top = r.y - dialogHeight - gap
    }
  } else if (preferredPosition === 'top') {
    top = r.y - dialogHeight - gap
    left = r.x + r.width / 2
    transform = 'translateX(-50%)'

    // Si se sale por arriba de la pantalla, invertimos a abajo
    if (top < 16) {
      top = r.y + r.height + gap
    }
  } else if (preferredPosition === 'left') {
    top = r.y + r.height / 2 - dialogHeight / 2
    left = r.x - dialogWidth - gap

    // Si se sale por la izquierda de la pantalla, invertimos a la derecha
    if (left < 16) {
      left = r.x + r.width + gap
    }
  } else if (preferredPosition === 'right') {
    top = r.y + r.height / 2 - dialogHeight / 2
    left = r.x + r.width + gap

    // Si se sale por la derecha de la pantalla, invertimos a la izquierda
    if (left + dialogWidth > viewportWidth - 16) {
      left = r.x - dialogWidth - gap
    }
  } else {
    // Center fallback
    top = viewportHeight / 2 - dialogHeight / 2
    left = viewportWidth / 2 - dialogWidth / 2
  }

  // Límites estrictos para no desbordar ningún borde
  if (left < 12) {
    left = 12
    transform = ''
  }
  if (left + dialogWidth > viewportWidth - 12) {
    left = viewportWidth - dialogWidth - 12
    transform = ''
  }
  if (top < 12) {
    top = 12
  }
  if (top + dialogHeight > viewportHeight - 12) {
    top = viewportHeight - dialogHeight - 12
  }

  dialogStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    transform,
    width: `${dialogWidth}px`,
    maxWidth: 'calc(100vw - 24px)',
  }
}

// Clic fuera para terminar o avanzar el paso
const handleBackdropClick = () => {
  // Opcional: Avanzar el paso o no hacer nada. 
  // No hacer nada evita saltar el tour por error, pero dejemos que no cierre para obligar a usar botones
}

// Teclas físicas de navegación
const handleKeyDown = (e: KeyboardEvent) => {
  if (!tourStore.isActive) return
  if (e.key === 'Escape') {
    tourStore.endTour()
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    e.preventDefault()
    tourStore.nextStep()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    tourStore.prevStep()
  }
}

// Escuchar cambios de paso e iniciar recalculo
watch(
  () => [tourStore.isActive, tourStore.currentIndex],
  () => {
    updateRect()
    nextTick(() => {
      // Retraso para esperar renderizado del globo y transiciones del DOM
      setTimeout(calculateDialogPosition, 200)
    })
  },
  { immediate: true, deep: true }
)

// Monitorear eventos de resize y scroll para reajustar foco y diálogo
onMounted(() => {
  window.addEventListener('resize', () => {
    updateRect()
    calculateDialogPosition()
  })
  window.addEventListener('scroll', () => {
    updateRect()
    calculateDialogPosition()
  }, { passive: true })
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateRect)
  window.removeEventListener('scroll', updateRect)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* Transición suave de entrada y salida */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animación de pulso con brillo para el spotlight bordado */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.9;
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.6), inset 0 0 8px rgba(251, 191, 36, 0.3);
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.3), inset 0 0 2px rgba(251, 191, 36, 0.1);
  }
}
.animate-pulse-glow {
  animation: pulse-glow 2s infinite ease-in-out;
}

/* Animaciones sutiles para elementos premium */
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2.5s infinite ease-in-out;
}

@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
.animate-pulse-subtle {
  animation: pulse-subtle 1.8s infinite ease-in-out;
}
</style>
