<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  chapterData: {
    numero: number
    titulo: string
    contenido: string
  }
}>()

const emit = defineEmits(['complete'])

const { user } = useUserSession()
const isReady = ref(false)

const personalizedContent = computed(() => {
  const name = user.value?.name || 'Estudiante'
  // Reemplazamos tanto [NOMBRE] como cualquier mención residual de Manuel
  return props.chapterData.contenido
    .replace(/\[NOMBRE\]/g, name)
    .replace(/Manuel/g, name)
})

onMounted(() => {
  // Transición suave de fundido de 0.5s según manual 4.3
  setTimeout(() => { isReady.value = true }, 500)
})
</script>

<template>
  <div class="fixed inset-0 z-[150] bg-white overflow-y-auto transition-colors duration-500">
    <div class="min-h-screen flex flex-col max-w-4xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-1000">
      
      <!-- Indicador de Capítulo -->
      <div class="text-center mb-12">
        <span class="text-indigo-600 font-mono tracking-[0.4em] text-xs font-black uppercase">
          Crónica del Bosque — Capítulo {{ chapterData.numero }}
        </span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-black mt-4 italic uppercase tracking-tight">
          {{ chapterData.titulo }}
        </h1>
        <div class="w-24 h-1.5 bg-indigo-500 mx-auto mt-8 rounded-full"></div>
      </div>

      <!-- Área de Ilustración (Sensible al Tema) -->
      <div class="w-full aspect-[16/9] md:aspect-[21/9] bg-slate-50 rounded-[40px] mb-12 flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-2xl relative group">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent z-10"></div>
        
        <!-- Placeholder para la ilustración dinámica -->
        <div class="text-slate-300 flex flex-col items-center">
          <svg class="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-mono text-[10px] uppercase tracking-widest opacity-30 italic">Escena del Capítulo {{ chapterData.numero }}</span>
        </div>
      </div>

      <!-- Texto Narrativo (Personalizado con el nombre del estudiante) -->
      <div class="mx-auto w-full mb-16 text-black">
        <p v-for="(paragraph, index) in personalizedContent.split('\n\n')" 
           :key="index" 
           class="mb-8 text-xl md:text-2xl leading-relaxed font-medium italic first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- Botón de Continuar (Estilo Premium) -->
      <div class="text-center pb-20 transition-all duration-1000" :class="isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <button 
          @click="emit('complete')"
          class="px-16 py-6 bg-slate-950 text-white font-black tracking-[0.4em] uppercase text-xs rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
        >
          Continuar el Viaje
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Estilo de "Novela Visual" para el texto */
p {
  text-wrap: balance;
}
</style>
