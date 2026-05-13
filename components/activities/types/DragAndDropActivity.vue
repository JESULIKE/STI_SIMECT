<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

const props = defineProps<{
  contenido: {
    items: Array<{ id: string, texto: string }>
    categories: Array<{ id: string, nombre: string, description?: string }>
  }
  modelValue: Record<string, string[]> // Mapping categoryId -> itemIds[]
}>()

const emit = defineEmits(['update:modelValue'])

// Estado local para los grupos de arrastre
const groups = ref<Record<string, any[]>>({
  unassigned: [...props.contenido.items]
})

// Inicializar categorías en el objeto groups
props.contenido.categories.forEach(cat => {
  groups.value[cat.id] = []
})

// Si ya hay un modelValue (ej: al reanudar), poblar los grupos
onMounted(() => {
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    // Implementar si es necesario persistir el estado a mitad de actividad
  }
})

const handleChange = () => {
  const result: Record<string, string[]> = {}
  props.contenido.categories.forEach(cat => {
    result[cat.id] = groups.value[cat.id].map(item => item.id)
  })
  emit('update:modelValue', result)
}
</script>

<template>
  <div class="space-y-8">
    
    <!-- Zona de Items sin asignar -->
    <div class="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
      <h4 class="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Elementos a clasificar</h4>
      <draggable 
        class="flex flex-wrap gap-3 min-h-[60px]" 
        :list="groups.unassigned" 
        group="items"
        @change="handleChange"
      >
        <div 
          v-for="item in groups.unassigned" 
          :key="item.id"
          class="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm cursor-move hover:border-indigo-400 transition-colors"
        >
          {{ item.texto }}
        </div>
      </draggable>
      <div v-if="groups.unassigned.length === 0" class="text-center py-2 text-black text-sm">
        Todos los elementos han sido clasificados ✨
      </div>
    </div>

    <!-- Categorías (Destinos) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="cat in contenido.categories" 
        :key="cat.id"
        class="flex flex-col h-full bg-white border-2 rounded-3xl transition-all duration-300"
        :class="groups[cat.id].length > 0 ? 'border-indigo-100 ring-4 ring-indigo-50' : 'border-slate-100'"
      >
        <div class="p-5 border-b border-slate-100">
          <h5 class="font-black text-slate-800">{{ cat.nombre }}</h5>
          <p v-if="cat.description" class="text-xs text-slate-800 mt-1 leading-tight">{{ cat.description }}</p>
        </div>
        
        <draggable 
          class="flex-1 p-4 space-y-3 min-h-[150px]" 
          :list="groups[cat.id]" 
          group="items"
          @change="handleChange"
        >
          <div 
            v-for="item in groups[cat.id]" 
            :key="item.id"
            class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-sm font-medium text-indigo-900 shadow-sm animate-in zoom-in-95 duration-200"
          >
            {{ item.texto }}
          </div>
        </draggable>
        
        <div v-if="groups[cat.id].length === 0" class="p-4 text-center text-xs text-black italic">
          Arrastra elementos aquí
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.cursor-move {
  cursor: grab;
}
.cursor-move:active {
  cursor: grabbing;
}
</style>
