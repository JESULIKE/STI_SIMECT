<script setup lang="ts">
const props = defineProps<{
  user: any
}>()

// Datos mock para demostración
const stats = [
  { label: 'Estudiantes Activos', value: '24', icon: '👥', color: 'text-blue-600 bg-blue-100' },
  { label: 'Promedio Grupal', value: '86%', icon: '📈', color: 'text-emerald-600 bg-emerald-100' },
  { label: 'Actividades Pendientes', value: '5', icon: '📝', color: 'text-amber-600 bg-amber-100' },
]

const students = [
  { id: 1, name: 'Ana García', progress: 75, lastActive: 'Hace 10 min', status: 'En línea' },
  { id: 2, name: 'Carlos Ruiz', progress: 40, lastActive: 'Hace 1 hora', status: 'Ausente' },
  { id: 3, name: 'Elena Beltrán', progress: 95, lastActive: 'Ayer', status: 'Desconectado' },
  { id: 4, name: 'Mateo López', progress: 62, lastActive: 'Hace 5 min', status: 'En línea' },
]
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Panel Docente</h1>
        <p class="text-slate-800">Bienvenido, Prof. {{ user.name }}. Aquí tienes un resumen de tus clases.</p>
      </div>
      <div class="flex gap-3">
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Nueva Actividad
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-slide-up">
        <div class="flex items-center gap-4">
          <div :class="['p-3 rounded-2xl text-2xl', stat.color]">
            {{ stat.icon }}
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800 uppercase tracking-wider">{{ stat.label }}</p>
            <p class="text-3xl font-black text-slate-800">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Students Table -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-800">Seguimiento de Alumnos</h2>
          <button class="text-indigo-600 font-bold text-sm hover:underline">Ver todos</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50">
                <th class="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest">Estudiante</th>
                <th class="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest">Progreso</th>
                <th class="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest">Estado</th>
                <th class="px-6 py-4 text-xs font-bold text-black uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="student in students" :key="student.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {{ student.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-800">{{ student.name }}</p>
                      <p class="text-xs text-slate-800">{{ student.lastActive }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                    <div class="bg-indigo-600 h-2 rounded-full" :style="{ width: student.progress + '%' }"></div>
                  </div>
                  <span class="text-xs font-bold text-slate-800 mt-1 block">{{ student.progress }}%</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider',
                    student.status === 'En línea' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-black'
                  ]">
                    {{ student.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="p-2 text-black hover:text-indigo-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions / Reports -->
      <div class="space-y-6">
        <div class="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-3xl text-white shadow-xl shadow-indigo-900/20">
          <h3 class="text-lg font-bold mb-2">Reporte Semanal</h3>
          <p class="text-indigo-100 text-sm mb-6">Descarga el análisis detallado del desempeño de tus grupos.</p>
          <button class="w-full bg-white text-indigo-900 font-black py-3 rounded-xl hover:bg-indigo-50 transition-colors uppercase text-xs tracking-widest">
            Generar PDF
          </button>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 class="text-lg font-bold text-slate-800 mb-4">Alertas de Alumnos</h3>
          <div class="space-y-4">
            <div class="flex gap-3 items-start p-3 bg-red-50 rounded-2xl border border-red-100">
              <span class="text-xl">⚠️</span>
              <div>
                <p class="text-sm font-bold text-red-800">Bajo rendimiento</p>
                <p class="text-xs text-red-600">Carlos Ruiz no ha completado la fase 2.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
