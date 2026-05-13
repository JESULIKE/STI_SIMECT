<script setup lang="ts">
defineProps<{
  message?: string
}>()

const reloadPage = () => {
  window.location.reload()
}
</script>

<template>
  <div class="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
    <div class="max-w-xl w-full bg-white rounded-[56px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-2 border-slate-100 p-12 md:p-16 text-center space-y-10 relative overflow-hidden">
      
      <!-- Decoración de fondo suave -->
      <div class="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <!-- Iconografía -->
      <div class="relative inline-flex items-center justify-center w-24 h-24 bg-orange-50 rounded-[32px] text-5xl mb-4">
        <span>🍂</span>
        <div class="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-4 border-white animate-ping"></div>
      </div>

      <div class="space-y-4">
        <h2 class="text-3xl font-black text-black uppercase tracking-tighter italic">¡Una pequeña pausa en el camino!</h2>
        <p class="text-black font-medium italic leading-relaxed">
          {{ message || "Parece que se nos ha caído una rama en el sendero, pero no te preocupes: tu progreso y tus puntos están a salvo en nuestra mochila." }}
        </p>
      </div>

      <div class="pt-4 space-y-6">
        <button 
          @click="reloadPage"
          class="w-full py-6 bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-xs rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Retomar el Camino
        </button>
        <p class="text-[9px] font-black uppercase tracking-widest text-black">
          Sugerencia: Intenta recargar la página para limpiar el sendero.
        </p>
      </div>

      <div class="pt-8 border-t border-slate-50">
        <div class="flex items-center justify-center gap-2 text-[10px] font-black text-black uppercase tracking-widest">
          <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Tu progreso ha sido guardado automáticamente
        </div>
      </div>
    </div>
  </div>
</template>
