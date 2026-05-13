<script setup lang="ts">
definePageMeta({ 
  layout: 'main',
  middleware: ['auth', 'admin']
})
import { ref } from 'vue'

const students = ref([])
const groupStats = ref([])
const frequentErrors = ref([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data: any = await $fetch('/api/admin/analytics/summary')
    students.value = data.students
    groupStats.value = data.groupStats
    frequentErrors.value = data.frequentErrors
  } catch (error) {
    console.error('Error cargando analítica real:', error)
  } finally {
    isLoading.value = false
  }
})

const handleExportCSV = () => {
  window.location.href = '/api/admin/analytics/export'
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8 lg:p-12 transition-colors duration-500">
    <div class="max-w-7xl mx-auto space-y-12">
      
      <!-- Header Grupal -->
      <header class="flex justify-between items-center">
        <div class="space-y-1">
          <span class="text-[10px] font-black uppercase tracking-widest text-emerald-500">Investigación Proyecto FE-01-24</span>
          <h1 class="text-4xl font-black text-black uppercase tracking-tighter italic">Panel de Control Docente</h1>
        </div>
        <div class="flex gap-4">
           <button class="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
             ⚙️ Configurar Nivel
           </button>
        </div>
      </header>

      <!-- KPIs del Grupo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-if="isLoading" v-for="i in 3" :key="i" class="h-32 bg-slate-100 animate-pulse rounded-[40px]"></div>
        <div v-else v-for="stat in groupStats" :key="stat.label" 
             class="bg-white p-8 rounded-[40px] shadow-xl border-2 border-slate-100 flex items-center gap-6">
          <div class="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
            {{ stat.icon }}
          </div>
          <div>
            <p class="text-3xl font-black text-black font-mono">{{ stat.value }}</p>
            <h3 class="text-[10px] font-black uppercase tracking-widest text-black">{{ stat.label }}</h3>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- Lista de Estudiantes -->
        <div class="lg:col-span-2 space-y-8">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black px-2">Seguimiento de Alumnos</h2>
          <div v-if="isLoading" class="h-64 bg-slate-100 animate-pulse rounded-[48px]"></div>
          <div v-else class="bg-white rounded-[48px] border-2 border-slate-100 shadow-2xl overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black">Estudiante</th>
                  <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black">Nivel</th>
                  <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black">IPC</th>
                  <th class="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-black">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-if="students.length === 0">
                  <td colspan="4" class="px-8 py-12 text-center text-black italic font-medium">No hay estudiantes registrados aún.</td>
                </tr>
                <tr v-for="std in students" :key="std.id" class="hover:bg-slate-50/50 transition-colors group">
                  <td class="px-8 py-6">
                    <div class="flex flex-col">
                      <span class="font-bold text-black">{{ std.name }}</span>
                      <span class="text-[10px] font-mono text-black">{{ std.id }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {{ std.level }}
                    </span>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-3">
                      <div class="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-[60px]">
                        <div class="h-full bg-emerald-500" :style="{ width: `${std.ipc}%` }"></div>
                      </div>
                      <span class="font-black text-sm">{{ std.ipc }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <NuxtLink :to="`/admin/analytics/${std.id}`" 
                             class="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 flex items-center gap-2">
                      Ver Detalle <span>→</span>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Alertas de Errores Comunes (Sección 11.3) -->
        <div class="space-y-8">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black px-2">Alertas del Grupo</h2>
          <div v-if="isLoading" class="h-48 bg-slate-100 animate-pulse rounded-[40px]"></div>
          <div v-else class="bg-orange-500 text-white rounded-[40px] p-8 shadow-2xl space-y-6">
             <div class="flex justify-between items-start">
                <span class="text-4xl">⚠️</span>
                <span class="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded-lg">Brechas Detectadas</span>
             </div>
             <div class="space-y-4">
                <div v-if="frequentErrors.length === 0" class="text-xs italic opacity-70">No hay errores recurrentes detectados.</div>
                <div v-for="err in frequentErrors" :key="err.type" class="border-b border-white/20 pb-4 last:border-0">
                   <p class="text-xs font-black uppercase tracking-tighter">{{ err.type }}</p>
                   <div class="flex justify-between items-center mt-1">
                      <span class="text-[9px] opacity-70">{{ err.phase }}</span>
                      <span class="text-sm font-black">{{ err.count }} alumnos</span>
                   </div>
                </div>
             </div>
             <p class="text-[10px] font-medium italic opacity-80 leading-relaxed" v-if="frequentErrors.length > 0">
               "Se han detectado patrones de error recurrentes. Se sugiere una intervención focalizada."
             </p>
          </div>
          
          <div class="bg-white rounded-[40px] p-8 border-2 border-slate-100 shadow-xl text-center">
             <p class="text-[10px] font-black text-black uppercase tracking-widest mb-4">Exportación Total</p>
             <button @click="handleExportCSV" class="w-full py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg hover:bg-emerald-400 transition-colors">
               Descargar CSV Completo
             </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
