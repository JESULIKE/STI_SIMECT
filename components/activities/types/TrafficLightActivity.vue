<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  contexto?: string
  pregunta: string
  fuentes: Array<{ id: string; nombre: string }>
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished'
}>()

const emit = defineEmits(['update:answer'])

// { [fuenteId]: 'red' | 'yellow' | 'green' }
const ratings = ref<Record<string, string>>({})

const isReady = computed(() =>
  props.fuentes.every(f => ratings.value[f.id])
)

watch(ratings, (val) => {
  emit('update:answer', { trafficLight: { ...val } })
}, { deep: true })

const setRating = (fuenteId: string, color: string) => {
  if (props.state !== 'in_progress') return
  ratings.value[fuenteId] = color
}

const colorConfig = {
  red: { label: '🔴 Poco confiable', bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-700' },
  yellow: { label: '🟡 Confiable con reservas', bg: 'bg-amber-400', border: 'border-amber-400', text: 'text-amber-700' },
  green: { label: '🟢 Muy confiable', bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-700' },
}
</script>

<template>
  <div class="space-y-8 w-full">
    <div v-if="contexto" class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6">
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contexto</p>
      <p class="text-sm font-medium text-black leading-relaxed italic">"{{ contexto }}"</p>
    </div>

    <div>
      <p class="text-[10px] font-black uppercase tracking-widest text-black mb-2">Instrucción</p>
      <p class="text-base font-bold text-slate-700 leading-relaxed">{{ pregunta }}</p>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex gap-3">
      <span class="text-lg">💡</span>
      <div>
        <p class="text-[9px] font-black uppercase tracking-widest text-indigo-700">Guía de interacción</p>
        <p class="text-xs font-semibold text-indigo-900 mt-0.5 leading-relaxed">
          Para cada fuente o afirmación de la lista, haz clic en el botón del semáforo que mejor califique su confiabilidad (Rojo: Poco confiable, Amarillo: Confiable con reservas, Verde: Muy confiable). Puedes cambiar de opinión haciendo clic en un color diferente en cualquier momento.
        </p>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="flex flex-wrap gap-3">
      <div v-for="(config, key) in colorConfig" :key="key"
        class="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200">
        <span>{{ config.label }}</span>
      </div>
    </div>

    <!-- Lista de fuentes con semáforo -->
    <div class="space-y-4">
      <div
        v-for="fuente in fuentes" :key="fuente.id"
        class="bg-white border-2 rounded-3xl p-6 transition-all"
        :class="ratings[fuente.id] ? `border-${ratings[fuente.id] === 'red' ? 'red' : ratings[fuente.id] === 'yellow' ? 'amber' : 'emerald'}-200` : 'border-slate-100'"
      >
        <p class="text-sm font-bold text-black mb-4">{{ fuente.nombre }}</p>
        <div class="flex gap-3">
          <button
            v-for="(config, colorKey) in colorConfig" :key="colorKey"
            @click="setRating(fuente.id, colorKey)"
            :disabled="state !== 'in_progress'"
            class="flex-1 py-3 text-xs font-black rounded-2xl border-2 transition-all"
            :class="ratings[fuente.id] === colorKey
              ? `${config.bg} text-white border-transparent shadow-lg`
              : `bg-white ${config.border} ${config.text} opacity-50 hover:opacity-100`"
          >
            {{ colorKey === 'red' ? '🔴' : colorKey === 'yellow' ? '🟡' : '🟢' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
