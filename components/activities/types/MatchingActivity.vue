<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  contexto?: string
  pregunta: string
  pares: Array<{ izquierda: string; derecha: string; id: string }>
  opcionesDerechas: string[]
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished'
}>()

const emit = defineEmits(['update:answer'])

// { [id]: string } -> qué opción derecha emparejó el usuario a cada ítem izquierdo
const selections = ref<Record<string, string>>({})

// Opciones del lado derecho mezcladas al inicio
const shuffledDerecha = ref<string[]>([])
const arr = props.pares.map(p => p.derecha)
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
shuffledDerecha.value = arr

const isReady = computed(() =>
  props.pares.every(p => selections.value[p.id])
)

watch(selections, (val) => {
  emit('update:answer', { matching: { ...val } })
}, { deep: true })
</script>

<template>
  <div class="space-y-8 w-full">
    <!-- Contexto -->
    <div v-if="contexto" class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6">
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contexto</p>
      <p class="text-sm font-medium text-black leading-relaxed italic">"{{ contexto }}"</p>
    </div>

    <!-- Instrucción de la pregunta -->
    <div>
      <p class="text-[10px] font-black uppercase tracking-widest text-black mb-2">Instrucción</p>
      <p class="text-base font-bold text-slate-700 leading-relaxed">{{ pregunta }}</p>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-amber-100 border-2 border-amber-300 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
      <span class="text-3xl animate-bounce">💡</span>
      <div>
        <p class="text-sm font-black uppercase tracking-widest text-amber-900">Guía de interacción</p>
        <p class="text-base font-bold text-amber-800 mt-1 leading-relaxed">
          Para cada concepto de la izquierda, abre su menú desplegable de la derecha y selecciona la definición o característica que consideres correcta. Puedes corregir tus elecciones abriendo el menú y cambiando tu opción en cualquier momento.
        </p>
      </div>
    </div>

    <!-- Lista de emparejamiento con selectores desplegables -->
    <div class="space-y-4">
      <div
        v-for="par in pares" :key="par.id"
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-slate-100 rounded-3xl p-5 transition-all hover:border-indigo-100"
      >
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full shrink-0">{{ par.id }}</span>
          <span class="text-sm font-bold text-black leading-tight">{{ par.izquierda }}</span>
        </div>

        <!-- Selección desplegable -->
        <div class="relative min-w-[240px] w-full md:w-auto">
          <select
            v-model="selections[par.id]"
            :disabled="state !== 'in_progress'"
            class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-xs font-black text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer disabled:opacity-60"
          >
            <option value="" disabled selected>Selecciona una opción...</option>
            <option
              v-for="opcion in shuffledDerecha"
              :key="opcion"
              :value="opcion"
            >
              {{ opcion }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
