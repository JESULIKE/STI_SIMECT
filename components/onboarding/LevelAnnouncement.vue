<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  nivel: {
    code: string
    label: string
    emoji: string
    color: string
    description: string
  }
}>()

const emit = defineEmits(['continue'])
const visible = ref(false)

const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string; btn: string }> = {
  emerald: {
    bg: 'from-emerald-50 to-white',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-500',
    btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
  },
  indigo: {
    bg: 'from-indigo-50 to-white',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-500',
    btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
  },
  red: {
    bg: 'from-red-50 to-white',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-500',
    btn: 'bg-red-600 hover:bg-red-500 shadow-red-500/30'
  }
}

const colors = colorClasses[props.nivel.color] || colorClasses.emerald

onMounted(() => {
  setTimeout(() => { visible.value = true }, 100)
})
</script>

<template>
  <div class="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md overflow-y-auto flex items-center justify-center px-6 py-12">
    <div
      class="max-w-xl w-full mx-auto text-center transition-all duration-700"
      :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <!-- Ícono grande animado -->
      <div class="mb-8 relative inline-block">
        <div
          class="w-32 h-32 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl mx-auto"
          :class="colors.badge"
        >
          {{ nivel.emoji }}
        </div>
        <!-- Anillos de pulso -->
        <div class="absolute inset-0 rounded-[40px] animate-ping opacity-20" :class="colors.badge"></div>
      </div>

      <!-- Etiqueta de paso -->
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">
        Nivel Asignado por tu Planeación
      </p>

      <!-- Título del nivel -->
      <h1
        class="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-4"
        :class="colors.text"
      >
        Nivel {{ nivel.label }}
      </h1>

      <!-- Tarjeta informativa -->
      <div
        class="rounded-[40px] p-8 border-2 bg-gradient-to-b mb-8 text-left"
        :class="[colors.bg, colors.border]"
      >
        <p class="text-slate-700 text-base font-medium leading-relaxed">
          {{ nivel.description }}
        </p>

        <!-- Reglas adaptativas -->
        <div class="mt-6 space-y-3">
          <div class="flex items-center gap-3 bg-white/70 rounded-2xl px-4 py-3">
            <span class="text-lg">✅</span>
            <p class="text-xs font-bold text-slate-700">
              2 respuestas correctas seguidas → <strong>sube de nivel automáticamente</strong>
            </p>
          </div>
          <div class="flex items-center gap-3 bg-white/70 rounded-2xl px-4 py-3">
            <span class="text-lg">❌</span>
            <p class="text-xs font-bold text-slate-700">
              Una respuesta incorrecta → <strong>baja de nivel inmediatamente</strong>
            </p>
          </div>
        </div>
      </div>

      <!-- Botón continuar -->
      <button
        @click="emit('continue')"
        class="w-full inline-flex items-center justify-center gap-4 rounded-[40px] px-12 py-7 text-sm font-black text-white uppercase tracking-[0.4em] transition-all shadow-2xl hover:scale-[1.02]"
        :class="colors.btn"
      >
        ¡Comenzar — Nivel {{ nivel.label }}!
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </div>
</template>
