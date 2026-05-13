<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  contenido: {
    texto: string
  },
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const answer = ref(props.modelValue?.text || '')

watch(answer, (newVal) => {
  emit('update:modelValue', { text: newVal })
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

    <!-- Campo de respuesta -->
    <div class="space-y-4">
      <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-black px-4">Escribe tu hallazgo aquí</label>
      <div class="relative">
        <input 
          v-model="answer"
          type="text" 
          placeholder="Escribe la respuesta exacta..."
          class="w-full px-8 py-6 bg-white border-2 border-slate-100 rounded-[32px] text-xl text-black placeholder:text-slate-300 focus:border-indigo-500 focus:outline-none transition-all shadow-xl shadow-slate-200/50"
        >
        <div class="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500 opacity-50">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </div>
      </div>
    </div>
  </div>
</template>
