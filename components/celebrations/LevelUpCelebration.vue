<script setup lang="ts">
const emit = defineEmits(['continue'])
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-700">
    <div class="max-w-xl w-full mx-4 text-center animate-in zoom-in-50 slide-in-from-bottom-12 duration-1000 delay-150">
      
      <div class="relative inline-block mb-8">
        <div class="absolute inset-0 bg-yellow-400 blur-[60px] opacity-40 rounded-full animate-pulse"></div>
        <div class="text-9xl drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-bounce" style="animation-duration: 2s;">🏆</div>
      </div>
      
      <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-600 mb-4 drop-shadow-sm">
        ¡Nivel Superado!
      </h1>
      
      <p class="text-xl text-slate-200 font-medium mb-12 max-w-md mx-auto">
        Tu dedicación y esfuerzo han dado frutos. Estás listo para enfrentar desafíos mayores.
      </p>

      <button 
        @click="emit('continue')"
        class="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(252,211,77,0.6)] hover:-translate-y-1 transition-all"
      >
        Continuar mi viaje
      </button>
    </div>
  </div>
</template>
