<script setup lang="ts">
definePageMeta({ 
  layout: 'main',
  middleware: ['auth', 'admin']
})
const route = useRoute()
const studentId = route.params.id

const { data: response, pending } = await useFetch(`/api/admin/analytics/student/${studentId}`)
const student = computed(() => (response.value as any)?.data)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
  })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8 lg:p-12 transition-colors duration-500">
    <div v-if="pending" class="max-w-5xl mx-auto flex items-center justify-center h-64">
       <div class="animate-spin text-indigo-500 text-4xl">⏳</div>
    </div>

    <div v-else-if="student" class="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Cabecera de Ficha -->
      <header class="flex justify-between items-end border-b-2 border-slate-100 pb-8">
        <div class="space-y-2">
          <NuxtLink to="/admin/analytics" class="text-[10px] font-black uppercase text-indigo-500 hover:tracking-widest transition-all">← Volver al Panel</NuxtLink>
          <h1 class="text-4xl font-black text-black uppercase tracking-tighter italic">
            {{ student.user.name }}
          </h1>
          <p class="text-black font-mono text-xs uppercase tracking-widest">{{ student.codigoEstudiantil }}</p>
        </div>
        <div class="flex gap-4">
           <div class="text-right">
             <p class="text-2xl font-black text-emerald-600 font-mono">{{ student.totalPoints }}</p>
             <p class="text-[9px] font-black uppercase text-black">Puntos Totales</p>
           </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <!-- Columna de Trazabilidad (Lo que el estudiante DICE) -->
        <div class="lg:col-span-2 space-y-10">
          <section class="space-y-6">
            <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black">Voz del Estudiante (Cualitativo)</h2>
            
            <div class="space-y-6">
              <!-- Muestra de Checklists -->
              <div v-for="cl in student.checklists" :key="cl.id" 
                   class="bg-white p-8 rounded-[40px] shadow-xl border-l-8 border-indigo-500 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">Planificación Inicial</span>
                  <span class="text-[10px] text-black font-medium">{{ formatDate(cl.createdAt) }}</span>
                </div>
                <div class="space-y-4">
                  <p class="text-sm text-black italic leading-relaxed">
                    "{{ cl.queSe || 'No escribió nada' }}"
                  </p>
                  <div class="flex gap-4">
                     <span class="text-[10px] font-bold text-black uppercase">Confianza: {{ cl.confianzaInicial }}/5</span>
                     <span class="text-[10px] font-bold text-black uppercase">Entorno OK: {{ cl.entornoSinDistracciones ? 'SÍ' : 'NO' }}</span>
                  </div>
                </div>
              </div>

              <!-- Muestra de Reflexiones -->
              <div v-for="ref in student.reflections" :key="ref.id" 
                   class="bg-white p-8 rounded-[40px] shadow-xl border-l-8 border-emerald-500 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">Reflexión Post-Actividad</span>
                  <span class="text-[10px] text-black font-medium">{{ formatDate(ref.createdAt) }}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <span class="text-[8px] font-black uppercase text-black">Qué aprendí</span>
                    <p class="text-xs text-black italic">"{{ ref.queAprendi }}"</p>
                  </div>
                  <div class="space-y-1">
                    <span class="text-[8px] font-black uppercase text-black">Dificultad encontrada</span>
                    <p class="text-xs text-black italic">"{{ ref.queFueDificil }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Columna de Desempeño (Lo que el estudiante HACE) -->
        <div class="space-y-10">
          <section class="space-y-6">
            <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black">Historial Técnico (Cuantitativo)</h2>
            
            <div class="bg-white rounded-[40px] p-8 border-2 border-slate-100 shadow-xl space-y-6">
              <div v-for="attempt in student.attempts" :key="attempt.id" class="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="text-xs font-black uppercase tracking-tight text-black">{{ attempt.activity.titulo }}</h4>
                  <span class="font-mono text-xs font-black text-emerald-600">{{ attempt.puntajeObtenido }} pts</span>
                </div>
                <div class="flex justify-between text-[9px] text-black font-bold uppercase">
                  <span>{{ attempt.tiempoSegundos }} seg</span>
                  <span>{{ formatDate(attempt.createdAt) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Gráfico de Progreso Rápido -->
          <div class="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
             <h3 class="text-[10px] font-black uppercase tracking-[0.3em] opacity-50 mb-4 text-center">Avance de Nivel</h3>
             <div class="space-y-4">
                <div v-for="p in student.progresses" :key="p.id" class="space-y-1">
                  <div class="flex justify-between text-[10px] font-bold">
                    <span>{{ p.phase }} ({{ p.level }})</span>
                    <span>{{ Math.round(p.percentCompleted) }}%</span>
                  </div>
                  <div class="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: `${p.percentCompleted}%` }"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
