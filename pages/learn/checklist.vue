<script setup lang="ts">
import ChecklistInicial from '~/components/metacognition/ChecklistInicial.vue'
import { useStudentStore } from '~/stores/student'

definePageMeta({ 
  layout: 'main' // Usamos el layout main que ya configuramos para ser oscuro y sin sidebar
})

const studentStore = useStudentStore()

const handleChecklistSubmit = async (data: any) => {
  console.log('Checklist completado:', data)
  studentStore.completeChecklist()
  
  studentStore.setProgress({
    metacognitiveState: {
      ...studentStore.progress.metacognitiveState,
      confidenceLevel: data.planifiedStrategy
    }
  })

  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-10 px-4">
    <div class="w-full max-w-4xl"> <!-- Aumentado de max-w-2xl a max-w-4xl -->
      <div class="text-center mb-12 animate-fade-in">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 rotate-3">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        </div>
        <h1 class="text-4xl lg:text-5xl font-black text-black tracking-tight uppercase italic">Preparación Mental</h1>
        <p class="text-slate-800 mt-4 text-lg font-medium">Reflexiona sobre tus objetivos y estrategias antes de comenzar la sesión.</p>
      </div>

      <ChecklistInicial @submit="handleChecklistSubmit" />
    </div>
  </div>
</template>
