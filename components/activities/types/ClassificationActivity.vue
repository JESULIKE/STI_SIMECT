<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  contexto?: string
  pregunta: string
  columnas: Array<{ id: string; label: string; color: string }>
  items: Array<{ id: string; texto: string }>
  state: 'idle' | 'in_progress' | 'evaluating' | 'finished'
}>()

const emit = defineEmits(['update:answer'])

// { [itemId]: columnaId }
const classification = ref<Record<string, string>>({})

// Mezclar los elementos a clasificar al inicio
const shuffledItems = ref<Array<{ id: string; texto: string }>>([])
const arr = [...props.items]
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
shuffledItems.value = arr

const isReady = computed(() =>
  shuffledItems.value.every(item => classification.value[item.id])
)

watch(classification, (val) => {
  emit('update:answer', { classification: { ...val } })
}, { deep: true })

const assignItem = (itemId: string, columnaId: string) => {
  if (props.state !== 'in_progress') return
  if (classification.value[itemId] === columnaId) {
    delete classification.value[itemId]
  } else {
    classification.value[itemId] = columnaId
  }
}

const itemsInColumn = (columnaId: string) =>
  shuffledItems.value.filter(i => classification.value[i.id] === columnaId)

const unassignedItems = computed(() =>
  shuffledItems.value.filter(i => !classification.value[i.id])
)

const colBg: Record<string, string> = {
  'blue': 'bg-blue-50 border-blue-200',
  'orange': 'bg-orange-50 border-orange-200',
  'green': 'bg-emerald-50 border-emerald-200',
  'red': 'bg-red-50 border-red-200',
  'purple': 'bg-purple-50 border-purple-200',
}
const colText: Record<string, string> = {
  'blue': 'text-blue-700',
  'orange': 'text-orange-700',
  'green': 'text-emerald-700',
  'red': 'text-red-700',
  'purple': 'text-purple-700',
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
          Haz clic en los botones "+" dentro de las columnas de abajo para asignar los elementos del banco "Elementos a clasificar". Puedes reasignar un elemento haciendo clic en la "✕" de su tarjeta para devolverlo al banco.
        </p>
      </div>
    </div>

    <!-- Ítems sin clasificar -->
    <div v-if="unassignedItems.length > 0">
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Elementos a clasificar</p>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="item in unassignedItems" :key="item.id"
          class="px-4 py-2 text-xs font-black bg-slate-900 text-white rounded-2xl shadow cursor-default"
        >
          {{ item.texto }}
        </button>
      </div>
    </div>

    <!-- Columnas de clasificación -->
    <div class="grid gap-4" :class="`grid-cols-${columnas.length}`">
      <div
        v-for="col in columnas" :key="col.id"
        class="rounded-3xl border-2 p-4 min-h-[140px] space-y-2 transition-all"
        :class="colBg[col.color] || 'bg-slate-50 border-slate-200'"
      >
        <p class="text-[9px] font-black uppercase tracking-widest mb-3" :class="colText[col.color] || 'text-slate-600'">
          {{ col.label }}
        </p>
        <!-- Drop zone: clic en ítems sin asignar los mueve aquí -->
        <div class="space-y-2">
          <div
            v-for="item in itemsInColumn(col.id)" :key="item.id"
            @click="assignItem(item.id, col.id)"
            class="px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all text-white shadow"
            :class="colText[col.color]?.replace('text-', 'bg-').replace('-700', '-500') || 'bg-slate-500'"
          >
            {{ item.texto }} ✕
          </div>
          <!-- Zona receptora -->
          <button
            v-for="item in unassignedItems" :key="`zone-${item.id}-${col.id}`"
            v-show="unassignedItems.length > 0"
            @click="assignItem(item.id, col.id)"
            class="hidden"
          />
        </div>
        <!-- Call-to-action para asignar -->
        <button
          v-for="item in unassignedItems" :key="`add-${item.id}-${col.id}`"
          @click="assignItem(item.id, col.id)"
          :disabled="state !== 'in_progress'"
          class="w-full text-left px-3 py-2 text-xs font-medium rounded-xl border border-dashed opacity-40 hover:opacity-80 transition-all"
          :class="`border-current ${colText[col.color] || 'text-slate-400'}`"
        >
          + {{ item.texto }}
        </button>
      </div>
    </div>

  </div>
</template>
