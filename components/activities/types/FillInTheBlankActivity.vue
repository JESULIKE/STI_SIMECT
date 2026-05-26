<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  contexto?: string
  pregunta: string
  plantilla: string
  opciones: string[]
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished'
}>()

const emit = defineEmits(['update:answer'])

const selectedOption = ref<string | null>(null)

const isReady = computed(() => selectedOption.value !== null)

watch(selectedOption, (val) => {
  emit('update:answer', { text: val || '' })
})
</script>

<template>
  <div class="space-y-8 w-full">
    <!-- Contexto -->
    <div v-if="contexto" class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6">
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contexto</p>
      <p class="text-sm font-medium text-black leading-relaxed italic">"{{ contexto }}"</p>
    </div>

    <!-- Pregunta -->
    <div class="space-y-2">
      <p class="text-[10px] font-black uppercase tracking-widest text-black">Instrucción</p>
      <p class="text-base font-bold text-slate-700 leading-relaxed">{{ pregunta }}</p>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex gap-3">
      <span class="text-lg">💡</span>
      <div>
        <p class="text-[9px] font-black uppercase tracking-widest text-indigo-700">Guía de interacción</p>
        <p class="text-xs font-semibold text-indigo-900 mt-0.5 leading-relaxed">
          Haz clic en el espacio en blanco subrayado (________) del texto y luego selecciona una de las opciones que se activarán abajo para completar la frase. Puedes cambiar tu opción haciendo clic en el espacio en blanco y seleccionando otra diferente.
        </p>
      </div>
    </div>

    <!-- Plantilla con espacio en blanco -->
    <div class="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-8 space-y-6">
      <p class="text-[10px] font-black uppercase tracking-widest text-indigo-400">Completa el enunciado</p>
      
      <p class="text-base font-bold text-black leading-loose tracking-wide">
        {{ plantilla.split('_____')[0] }}
        <span 
          class="inline-block relative mx-1 border-b-4 px-4 py-1 font-black text-base min-w-[120px] text-center transition-all cursor-pointer"
          :class="selectedOption ? 'border-indigo-600 text-indigo-700 bg-indigo-100/50 rounded-t-xl' : 'border-indigo-300 text-indigo-300'"
          @click="state === 'in_progress' ? selectedOption = null : null"
        >
          {{ selectedOption || '________' }}
        </span>
        {{ plantilla.split('_____')[1] }}
      </p>

      <!-- Opciones -->
      <div v-if="state === 'in_progress'" class="pt-6 border-t-2 border-indigo-100/50 flex flex-wrap gap-3">
        <button
          v-for="(opt, index) in opciones" :key="index"
          @click="selectedOption = opt"
          class="px-4 py-2 text-sm font-bold rounded-2xl border-2 transition-all"
          :class="selectedOption === opt 
            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md scale-105' 
            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'"
        >
          {{ opt }}
        </button>
      </div>
    </div>
  </div>
</template>
