<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['continuar'])

const isSubmitting = ref(false)

const enviarControl = async () => {
  isSubmitting.value = true
  await new Promise(r => setTimeout(r, 1000))
  emit('continuar', { 
    clarity: 5, factsOpinions: 5, concreteData: 5, followedStrategy: 5, 
    selfEval: 5, transfer: 'Sí', difficult: 'Ninguna', differentNext: 'Nada' 
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 text-center">
    <!-- Header -->
    <div class="text-center space-y-4">
      <span class="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 block">Punto de Control</span>
      <h3 class="text-4xl font-black text-black italic uppercase tracking-tight">¡Fase Completada con Éxito!</h3>
      <p class="max-w-2xl mx-auto text-slate-700 font-medium italic text-sm leading-relaxed">
        Has finalizado todas las actividades de esta fase. Tu proceso ha sido analizado y guardado.
      </p>
    </div>

    <!-- Panel de Autoevaluación (Reemplaza pregunta 01) -->
    <div class="bg-emerald-50 border-2 border-emerald-100 rounded-[40px] p-8 md:p-12 shadow-sm space-y-8 max-w-2xl mx-auto">
      <div class="text-6xl mb-6 animate-bounce">🛡️</div>
      <h4 class="text-2xl font-black text-emerald-900 leading-none uppercase italic tracking-tight">Control de Progreso</h4>
      <p class="text-sm text-emerald-800 font-bold mt-4 leading-relaxed">
        El sistema ha verificado tus respuestas y ha consolidado tu aprendizaje. 
        Estás listo para avanzar a la siguiente etapa de tu entrenamiento.
      </p>
    </div>

    <!-- Submit -->
    <div class="pt-8 text-center max-w-xl mx-auto">
      <button
        @click="enviarControl"
        :disabled="isSubmitting"
        class="w-full py-7 bg-slate-900 text-white font-black uppercase tracking-[0.5em] text-xs rounded-[32px] transition-all shadow-2xl disabled:opacity-20 hover:scale-[1.01] active:scale-95"
      >
        {{ isSubmitting ? 'Guardando Control...' : 'Continuar al Siguiente Nivel' }}
      </button>
    </div>
  </div>
</template>
