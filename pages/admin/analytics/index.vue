<script setup lang="ts">
definePageMeta({ 
  layout: 'main',
  middleware: ['auth', 'admin']
})

const { user } = useUserSession()

const students = ref([])
const groupStats = ref([])
const frequentErrors = ref([])
const institucion = ref('')
const isLoading = ref(true)

onMounted(async () => {
  try {
    const data: any = await $fetch('/api/admin/analytics/summary')
    students.value = data.students
    groupStats.value = data.groupStats
    frequentErrors.value = data.frequentErrors
    institucion.value = data.institucion || ''
  } catch (error) {
    console.error('Error cargando analítica real:', error)
  } finally {
    isLoading.value = false
  }
})

const handleExportCSV = () => {
  window.location.href = '/api/admin/analytics/export'
}

const searchQuery = ref('')
const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  const q = searchQuery.value.toLowerCase()
  return students.value.filter((s: any) =>
    s.name.toLowerCase().includes(q) ||
    s.studentCode.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="min-h-screen p-8 lg:p-12 transition-colors duration-500">
    <div class="max-w-7xl mx-auto space-y-10">
      
      <!-- Header Grupal -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="space-y-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Investigación Proyecto FE-01-24</span>
          <h1 class="text-4xl font-black text-black uppercase tracking-tighter italic">Panel de Control Docente</h1>
          
          <!-- Código y Colegio del Docente -->
          <div class="flex flex-wrap items-center gap-3 pt-1">
            <div v-if="user?.studentCode" class="flex items-center gap-2 px-3 py-1.5 bg-blue-100 border-2 border-blue-300 rounded-xl">
              <span class="text-[9px] font-black uppercase text-blue-500 tracking-widest">Tu Código:</span>
              <span class="text-sm font-mono font-black text-blue-900">{{ user.studentCode }}</span>
            </div>
            <div v-if="institucion" class="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
              <span class="text-[9px] font-black uppercase text-emerald-600 tracking-widest">🏫</span>
              <span class="text-xs font-bold text-emerald-800">{{ institucion }}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-4">
           <button @click="handleExportCSV" class="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-400 transition-colors">
             ⬇️ Exportar CSV
           </button>
        </div>
      </header>

      <!-- KPIs del Grupo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-if="isLoading" v-for="i in 3" :key="i" class="h-32 bg-blue-50 animate-pulse rounded-[40px]"></div>
        <div v-else v-for="stat in groupStats" :key="stat.label" 
             class="bg-white p-8 rounded-[40px] shadow-xl border-2 border-blue-50 flex items-center gap-6">
          <div class="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">
            {{ stat.icon }}
          </div>
          <div>
            <p class="text-3xl font-black text-black font-mono">{{ stat.value }}</p>
            <h3 class="text-[10px] font-black uppercase tracking-widest text-black">{{ stat.label }}</h3>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Lista de Estudiantes -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black px-2">Seguimiento de Alumnos</h2>
            <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {{ filteredStudents.length }} estudiante(s)
            </span>
          </div>

          <!-- Buscador -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, código o correo..."
              class="w-full px-5 py-3 bg-white border-2 border-blue-100 rounded-2xl text-sm text-black placeholder:text-blue-300 focus:border-blue-400 focus:outline-none transition-all shadow-sm"
            />
            <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"></path>
              </svg>
            </div>
          </div>

          <div v-if="isLoading" class="h-64 bg-blue-50 animate-pulse rounded-[48px]"></div>
          <div v-else class="bg-white rounded-[48px] border-2 border-blue-50 shadow-2xl overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-blue-50">
                <tr>
                  <th class="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-blue-700">Estudiante</th>
                  <th class="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-blue-700">Código</th>
                  <th class="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-blue-700 hidden md:table-cell">Correo</th>
                  <th class="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-blue-700">Nivel</th>
                  <th class="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-blue-700">IPC</th>
                  <th class="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-blue-700">Ver</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-blue-50">
                <tr v-if="filteredStudents.length === 0">
                  <td colspan="6" class="px-8 py-12 text-center text-black italic font-medium">
                    No hay estudiantes registrados en este colegio aún.
                  </td>
                </tr>
                <tr v-for="std in filteredStudents" :key="std.id" class="hover:bg-blue-50/40 transition-colors group">
                  <td class="px-6 py-5">
                    <span class="font-bold text-black text-sm">{{ std.name }}</span>
                  </td>
                  <td class="px-6 py-5">
                    <span class="font-mono font-black text-blue-800 text-sm bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                      {{ std.studentCode }}
                    </span>
                  </td>
                  <td class="px-6 py-5 hidden md:table-cell">
                    <span class="text-xs text-black font-medium">{{ std.email }}</span>
                  </td>
                  <td class="px-6 py-5">
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      {{ std.level }}
                    </span>
                  </td>
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-1.5 bg-blue-50 rounded-full overflow-hidden max-w-[50px]">
                        <div class="h-full bg-emerald-500" :style="{ width: `${std.ipc}%` }"></div>
                      </div>
                      <span class="font-black text-sm text-black">{{ std.ipc }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <NuxtLink :to="`/admin/analytics/${std.id}`" 
                             class="text-[9px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
                      Ver <span>→</span>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Alertas de Errores Comunes -->
        <div class="space-y-8">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black px-2">Alertas del Grupo</h2>
          <div v-if="isLoading" class="h-48 bg-blue-50 animate-pulse rounded-[40px]"></div>
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
        </div>
      </div>

    </div>
  </div>
</template>
