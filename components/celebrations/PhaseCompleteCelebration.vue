<script setup lang="ts">
const props = defineProps<{ phaseName: string }>()
const emit = defineEmits(['continue'])
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-500">
    <div class="max-w-md w-full bg-white rounded-3xl p-10 text-center shadow-2xl border border-emerald-500/30 animate-in zoom-in-95 duration-500">
      
      <div class="w-24 h-24 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>

      <h2 class="text-3xl font-bold text-slate-800 mb-2">
        ¡Fase Completada!
      </h2>
      
      <p class="text-black mb-8">
        Has dominado la fase de <strong class="text-emerald-600">{{ phaseName }}</strong>. Un nuevo capítulo de la historia te espera.
      </p>

      <button 
        @click="emit('continue')"
        class="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-colors"
      >
        Leer Siguiente Capítulo
      </button>

    </div>
  </div>
</template>
