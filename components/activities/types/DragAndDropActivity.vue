<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{
  contenido: {
    items: Array<{ id: string; texto: string; categoriaCorrecta?: string }>
    // La DB guarda como 'categorias' (español), pero por compatibilidad aceptamos ambos
    categorias?: Array<{ id: string; label: string }>
    categories?: Array<{ id: string; nombre?: string; label?: string; description?: string }>
  }
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

// Normalizar categorías sin importar si vienen como 'categorias' o 'categories'
const categorias = computed(() => {
  if (props.contenido.categorias?.length) {
    return props.contenido.categorias.map(c => ({ id: c.id, label: c.label }))
  }
  if (props.contenido.categories?.length) {
    return props.contenido.categories.map(c => ({ id: c.id, label: c.nombre || c.label || c.id }))
  }
  return []
})

// Mapa: categoriaId → items asignados
const assigned = ref<Record<string, Array<{ id: string; texto: string }>>>({})
const unassigned = ref<Array<{ id: string; texto: string }>>([])

onMounted(() => {
  // Inicializar columnas vacías
  for (const cat of categorias.value) {
    assigned.value[cat.id] = []
  }
  // Todos los items van a sin asignar al inicio
  unassigned.value = [...props.contenido.items]
  emitAnswer()
})

const emitAnswer = () => {
  // Formato: { mapping: { itemId: catId } }
  const mapping: Record<string, string> = {}
  for (const [catId, items] of Object.entries(assigned.value)) {
    for (const item of items) {
      mapping[item.id] = catId
    }
  }
  emit('update:modelValue', { mapping })
}

const assignItem = (item: { id: string; texto: string }, catId: string) => {
  // Quitar de donde estaba
  unassigned.value = unassigned.value.filter(i => i.id !== item.id)
  for (const cat of categorias.value) {
    assigned.value[cat.id] = assigned.value[cat.id].filter(i => i.id !== item.id)
  }
  // Asignar a la nueva categoría
  assigned.value[catId] = [...(assigned.value[catId] || []), item]
  emitAnswer()
}

const unassignItem = (item: { id: string; texto: string }) => {
  for (const cat of categorias.value) {
    assigned.value[cat.id] = assigned.value[cat.id].filter(i => i.id !== item.id)
  }
  if (!unassigned.value.find(i => i.id === item.id)) {
    unassigned.value = [...unassigned.value, item]
  }
  emitAnswer()
}
</script>

<template>
  <div class="space-y-6 w-full">
    <!-- Pregunta -->
    <div v-if="contenido.pregunta || contenido.items">
      <p class="text-[10px] font-black uppercase tracking-widest text-black mb-2">Instrucción</p>
      <p class="text-base font-bold text-slate-700 leading-relaxed">{{ contenido.pregunta }}</p>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-amber-100 border-2 border-amber-300 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
      <span class="text-3xl animate-bounce">💡</span>
      <div>
        <p class="text-sm font-black uppercase tracking-widest text-amber-900">Guía de interacción</p>
        <p class="text-base font-bold text-amber-800 mt-1 leading-relaxed">
          Haz clic en los botones "+" ubicados bajo cada categoría de destino para asignar los elementos disponibles del banco. Puedes reasignar un elemento haciendo clic en la "✕" al lado de su nombre para devolverlo al banco.
        </p>
      </div>
    </div>

    <!-- Items sin asignar (banco) -->
    <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-5">
      <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Elementos disponibles</p>
      <div v-if="unassigned.length === 0" class="text-center py-3 text-slate-400 text-sm italic">
        ✨ Todos los elementos han sido clasificados
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in unassigned" :key="item.id"
          class="px-4 py-2 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer"
          @click="() => {}"
        >
          {{ item.texto }}
          <span class="ml-2 text-slate-400 text-xs">↓ asignar abajo</span>
        </button>
      </div>
    </div>

    <!-- Categorías destino -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="cat in categorias" :key="cat.id"
        class="bg-white border-2 rounded-3xl overflow-hidden transition-all"
        :class="assigned[cat.id]?.length > 0 ? 'border-indigo-200' : 'border-slate-100'"
      >
        <!-- Cabecera categoría -->
        <div class="p-4 bg-slate-50 border-b border-slate-100">
          <p class="text-xs font-black uppercase tracking-widest text-slate-700">{{ cat.label }}</p>
        </div>

        <!-- Items asignados -->
        <div class="p-4 space-y-2 min-h-[80px]">
          <div
            v-for="item in assigned[cat.id]" :key="item.id"
            class="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-2xl"
          >
            <span class="text-sm font-bold text-indigo-900">{{ item.texto }}</span>
            <button
              @click="unassignItem(item)"
              class="ml-3 text-indigo-400 hover:text-red-500 text-lg leading-none transition-all"
              title="Quitar"
            >×</button>
          </div>
          <div v-if="!assigned[cat.id]?.length" class="text-center py-2 text-slate-300 text-xs italic">
            Sin elementos aún
          </div>
        </div>

        <!-- Botones para asignar desde el banco -->
        <div v-if="unassigned.length > 0" class="px-4 pb-4 space-y-1">
          <p class="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-2">Agregar a esta categoría:</p>
          <button
            v-for="item in unassigned" :key="`btn-${item.id}`"
            @click="assignItem(item, cat.id)"
            class="w-full text-left px-3 py-2 text-xs font-bold rounded-xl border border-dashed border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-all"
          >
            + {{ item.texto }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
