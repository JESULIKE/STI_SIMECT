<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  contenido: {
    opciones: Array<{ id: string, texto: string }>
  },
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const selectedOption = ref<string | null>(props.modelValue?.selectedId || null)

watch(() => props.contenido, () => {
  selectedOption.value = null
}, { deep: true })

watch(selectedOption, (newVal) => {
  emit('update:modelValue', { selectedId: newVal })
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Contexto / Texto del Reporte -->
    <div v-if="contenido.texto" class="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 italic text-black text-lg leading-relaxed shadow-inner">
      {{ contenido.texto }}
    </div>

    <!-- Pregunta -->
    <div v-if="contenido.pregunta" class="px-2">
      <h4 class="text-xl font-black text-black uppercase tracking-tight italic">{{ contenido.pregunta }}</h4>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex gap-3">
      <span class="text-lg">💡</span>
      <div>
        <p class="text-[9px] font-black uppercase tracking-widest text-indigo-700">Guía de interacción</p>
        <p class="text-xs font-semibold text-indigo-900 mt-0.5 leading-relaxed">
          Selecciona una única opción de la lista haciendo clic sobre ella. Tu elección se marcará en verde y podrás cambiarla seleccionando otra en cualquier momento.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <button 
        v-for="opt in contenido.opciones" 
        :key="opt.id"
        @click="selectedOption = opt.id"
        class="flex items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 text-left group"
        :class="selectedOption === opt.id 
          ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
          : 'border-slate-100 hover:border-indigo-500/30 hover:bg-slate-50'"
      >
        <div 
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="selectedOption === opt.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'"
        >
          <div v-if="selectedOption === opt.id" class="w-2 h-2 rounded-full bg-white animate-in zoom-in"></div>
        </div>
        <span 
          class="text-lg font-medium transition-colors"
          :class="selectedOption === opt.id ? 'text-emerald-700' : 'text-black'"
        >
          {{ opt.texto }}
        </span>
      </button>
    </div>
  </div>
</template>
