<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const { id } = route.params

// Datos reales del capítulo ambiental basados en el Modelo de Dominio
const chapter = {
  title: 'Alerta Temprana en el Río Sinú',
  content: `
    A inicios de febrero de 2026, un frente frío persistente hizo que el río Sinú creciera peligrosamente en Córdoba. Mateo, un joven estudiante con rol de líder, se encontraba en el centro de mando local analizando boletines meteorológicos para entender la situación real.

    El nivel del río en Montería alcanzó los 7.5 metros esa mañana y el reporte del IDEAM indicaba lluvias intensas de 40mm/h. Al notar que el suelo tenía una saturación del 90%, comprendió que había un riesgo inminente de inundación en zonas ribereñas.
    
    Tu misión en este nivel es analizar profundamente los datos. El conocimiento y la objetividad son las primeras herramientas para gestionar la emergencia.
  `,
  audioUrl: '#',
}

const isPlaying = ref(false)

const toggleAudio = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    setTimeout(() => isPlaying.value = false, 5000)
  }
}

const continueToActivity = async () => {
  await navigateTo('/learn/BASIC/ANALYSIS')
}
</script>

<template>
  <div class="min-h-screen bg-[#05070a] text-slate-200 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative">
    
    <!-- Fondo Atmosférico -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-950/20 to-black"></div>
      <div class="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[150px] animate-pulse"></div>
      <div class="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[150px] animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <div class="max-w-5xl w-full space-y-16 relative z-10">
      
      <!-- Ilustración de Recompensa (Ambiental) -->
      <div class="w-full h-[40vh] md:h-[50vh] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative group animate-fade-in">
        <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2000&auto=format&fit=crop" 
          alt="Ecosistema Caribe" 
          class="w-full h-full object-cover transform transition-transform duration-[10s] group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent"></div>
        
        <!-- Badge de Capítulo -->
        <div class="absolute bottom-8 left-8 flex items-center gap-4">
          <div class="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl">
            🌿
          </div>
          <div>
            <span class="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-1">Capítulo Actual</span>
            <h1 class="text-3xl md:text-4xl font-black text-white tracking-tighter italic uppercase">
              {{ chapter.title }}
            </h1>
          </div>
        </div>
      </div>

      <!-- Texto Narrativo -->
      <div class="max-w-3xl mx-auto space-y-12 animate-slide-up text-center">
        <div class="prose prose-invert prose-2xl max-w-none">
          <p class="text-2xl md:text-3xl text-slate-300 leading-[1.8] font-light tracking-tight italic">
            "{{ chapter.content }}"
          </p>
        </div>

        <div class="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto"></div>

        <!-- Acciones -->
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
          <button 
            @click="toggleAudio"
            class="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div class="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40 group-hover:scale-110 transition-transform">
              <svg v-if="!isPlaying" class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
            </div>
            <div class="text-left">
              <span class="block text-[10px] font-black uppercase tracking-widest text-slate-500">Narración</span>
              <span class="text-sm font-bold text-white">{{ isPlaying ? 'Reproduciendo...' : 'Escuchar Audio' }}</span>
            </div>
          </button>

          <button 
            @click="continueToActivity"
            class="w-full md:w-auto px-12 py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
          >
            Continuar a la misión
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Escaper -->
    <NuxtLink 
      to="/dashboard"
      class="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all z-20"
      title="Volver al inicio"
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
    </NuxtLink>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 2s ease-out;
}
.animate-slide-up {
  animation: slide-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.prose p {
  line-height: 1.8;
  letter-spacing: -0.01em;
}
</style>
