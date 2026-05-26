<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  contexto?: string
  pregunta: string
  izquierda: Array<{ id: string; texto: string }>
  derecha: Array<{ id: string; texto: string }>
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished'
}>()

const emit = defineEmits(['update:answer'])

// [{ from: izqId, to: derId }]
const connections = ref<Array<{ from: string; to: string }>>([])
const selectedLeft = ref<string | null>(null)

// Mezclar el lado derecho al cargar para que no queden alineados con sus respuestas correctas
const shuffledDerecha = ref<Array<{ id: string; texto: string }>>([])
const arr = [...props.derecha]
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
shuffledDerecha.value = arr

watch(connections, (val) => {
  emit('update:answer', { arrows: val.map(c => ({ from: c.from, to: c.to })) })
}, { deep: true })

const selectLeft = (id: string) => {
  if (props.state !== 'in_progress') return
  selectedLeft.value = selectedLeft.value === id ? null : id
}

const selectRight = (rightId: string) => {
  if (props.state !== 'in_progress' || !selectedLeft.value) return
  const leftId = selectedLeft.value
  // Eliminar conexión existente del mismo nodo izquierdo
  connections.value = connections.value.filter(c => c.from !== leftId)
  // Eliminar conexión existente al mismo nodo derecho
  connections.value = connections.value.filter(c => c.to !== rightId)
  connections.value.push({ from: leftId, to: rightId })
  selectedLeft.value = null
}

const getConnectedRight = (leftId: string) =>
  connections.value.find(c => c.from === leftId)?.to

const getConnectedLeft = (rightId: string) =>
  connections.value.find(c => c.to === rightId)?.from

const removeConnection = (leftId: string) => {
  if (props.state !== 'in_progress') return
  connections.value = connections.value.filter(c => c.from !== leftId)
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
          Haz clic en cualquier elemento de la columna izquierda (se marcará en morado) y luego haz clic en el elemento correspondiente de la columna derecha para unirlos. Puedes cambiar una conexión en cualquier momento repitiendo el proceso.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-8 items-start">
      <!-- Izquierda -->
      <div class="space-y-3">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Causa / Elemento</p>
        <button
          v-for="item in izquierda" :key="item.id"
          @click="selectedLeft === item.id ? (selectedLeft = null) : selectLeft(item.id)"
          :disabled="state !== 'in_progress'"
          class="w-full text-left px-4 py-3 text-xs font-bold rounded-2xl border-2 transition-all"
          :class="{
            'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md': selectedLeft === item.id,
            'border-emerald-400 bg-emerald-50 text-emerald-800': getConnectedRight(item.id),
            'border-slate-100 bg-white text-slate-700 hover:border-indigo-200': !selectedLeft && !getConnectedRight(item.id)
          }"
        >
          {{ item.texto }}
          <span v-if="getConnectedRight(item.id)" class="block text-[9px] text-emerald-500 font-black mt-1 uppercase tracking-widest">
            ✓ conectado · clic para cambiar
          </span>
        </button>
      </div>

      <!-- Derecha -->
      <div class="space-y-3">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Efecto / Consecuencia</p>
        <button
          v-for="item in shuffledDerecha" :key="item.id"
          @click="selectRight(item.id)"
          :disabled="state !== 'in_progress' || !selectedLeft"
          class="w-full text-left px-4 py-3 text-xs font-bold rounded-2xl border-2 transition-all"
          :class="{
            'border-emerald-400 bg-emerald-50 text-emerald-800': getConnectedLeft(item.id),
            'border-slate-100 bg-white text-slate-700 hover:border-indigo-200': !getConnectedLeft(item.id) && selectedLeft,
            'border-slate-100 bg-slate-50 text-slate-400': !selectedLeft
          }"
        >
          {{ item.texto }}
        </button>
      </div>
    </div>

  </div>
</template>
