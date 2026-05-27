<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  contexto?: string
  pregunta: string
  items: Array<{ id: string; texto: string }>
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished'
}>()

const emit = defineEmits(['update:answer'])

// Lista de ids en el orden actual del usuario — mezclada al inicio
const shuffled = [...props.items]
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
}
const orderedItems = ref(shuffled)

// Emitir el orden inicial en cuanto el componente carga
onMounted(() => {
  emit('update:answer', { sequence: orderedItems.value.map(i => i.id) })
})

watch(orderedItems, (val) => {
  emit('update:answer', { sequence: val.map(i => i.id) })
}, { deep: true })

const moveUp = (index: number) => {
  if (props.state !== 'in_progress' || index === 0) return
  const arr = [...orderedItems.value]
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  orderedItems.value = arr
}

const moveDown = (index: number) => {
  if (props.state !== 'in_progress' || index === orderedItems.value.length - 1) return
  const arr = [...orderedItems.value]
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  orderedItems.value = arr
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
    <div class="bg-amber-100 border-2 border-amber-300 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
      <span class="text-3xl animate-bounce">💡</span>
      <div>
        <p class="text-sm font-black uppercase tracking-widest text-amber-900">Guía de interacción</p>
        <p class="text-base font-bold text-amber-800 mt-1 leading-relaxed">
          Usa los botones ▲ y ▼ ubicados a la derecha de cada elemento para desplazarlos hacia arriba o hacia abajo en la lista hasta lograr el orden lógico correcto de 1 a {{ orderedItems.length }}.
        </p>
      </div>
    </div>

    <!-- Lista ordenable -->
    <div class="space-y-3">
      <div
        v-for="(item, index) in orderedItems" :key="item.id"
        class="flex items-center gap-4 bg-white border-2 border-slate-100 rounded-2xl p-4 transition-all hover:border-indigo-100"
      >
        <span class="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
          {{ index + 1 }}
        </span>
        <span class="flex-1 text-sm font-bold text-black">{{ item.texto }}</span>
        <div class="flex flex-col gap-1">
          <button
            @click="moveUp(index)"
            :disabled="index === 0 || state !== 'in_progress'"
            class="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-20 transition-all"
          >▲</button>
          <button
            @click="moveDown(index)"
            :disabled="index === orderedItems.length - 1 || state !== 'in_progress'"
            class="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-20 transition-all"
          >▼</button>
        </div>
      </div>
    </div>

  </div>
</template>
