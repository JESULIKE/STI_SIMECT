<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  contenido: {
    texto: string
    opciones?: string[]
  },
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const selectedOption = ref<string | null>(props.modelValue?.text || null)

watch(selectedOption, (newVal) => {
  emit('update:modelValue', { text: newVal || '' })
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Texto base del estímulo -->
    <div class="p-8 bg-slate-50 rounded-[40px] border-2 border-slate-100 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
      <p class="text-xl leading-relaxed text-slate-800 font-medium italic">
        "{{ contenido.texto }}"
      </p>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex gap-3">
      <span class="text-lg">💡</span>
      <div>
        <p class="text-[9px] font-black uppercase tracking-widest text-indigo-700">Guía de interacción</p>
        <p class="text-xs font-semibold text-indigo-900 mt-0.5 leading-relaxed">
          Lee el fragmento de arriba de forma reflexiva y haz clic en la opción correcta de abajo que represente el extracto o hecho clave según lo solicitado. Puedes cambiar tu opción haciendo clic en otra tarjeta en cualquier momento.
        </p>
      </div>
    </div>

    <!-- Opciones de selección -->
    <div class="space-y-4">
      <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-black px-4">Selecciona el fragmento correcto</label>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="(opt, index) in (contenido.opciones || [])" :key="index"
          @click="selectedOption = opt"
          class="px-5 py-4 text-base font-bold rounded-2xl border-2 transition-all text-left"
          :class="selectedOption === opt 
            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md scale-[1.02]' 
            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'"
        >
          {{ opt }}
        </button>
      </div>
    </div>
  </div>
</template>
