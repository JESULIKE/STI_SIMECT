<script setup lang="ts">
definePageMeta({ 
  layout: 'main',
  middleware: ['auth', 'admin']
})

const route = useRoute()
const studentId = route.params.id

const { data: response, pending } = await useFetch(`/api/admin/analytics/student/${studentId}`)
const student = computed(() => (response.value as any)?.data)
const summary = computed(() => student.value?.summary)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })
}

const formatTime = (secs: number) => {
  if (!secs) return '—'
  if (secs < 60) return `${secs} seg`
  return `${Math.floor(secs / 60)} min ${secs % 60} seg`
}

// Determinar si un intento fue correcto basándose en puntaje
const wasCorrect = (attempt: any) => (attempt.puntajeObtenido || 0) >= 10

const subPhaseColor = (sp: string) => {
  const map: Record<string, string> = {
    '1.1': 'bg-indigo-100 text-indigo-700',
    '1.2': 'bg-indigo-200 text-indigo-800',
    '2.1': 'bg-emerald-100 text-emerald-700',
    '2.2': 'bg-emerald-200 text-emerald-800',
    '3.1': 'bg-amber-100 text-amber-700',
    '3.2': 'bg-amber-200 text-amber-800',
  }
  return map[sp] || 'bg-slate-100 text-slate-700'
}

const transferColor = (val: string) => {
  if (val === 'Sí') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (val === 'Tal vez') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

const starDimensions = [
  { key: 'claridadMonteria',   label: '¿Claridad de la situación?' },
  { key: 'hechosOpiniones',    label: '¿Distinguió hechos de opiniones?' },
  { key: 'datosConcretosStar', label: '¿Usó datos concretos?' },
  { key: 'sigueEstrategia',    label: '¿Siguió su estrategia?' },
]
</script>

<template>
  <div class="min-h-screen bg-white p-6 lg:p-10">
    <div v-if="pending" class="max-w-6xl mx-auto flex items-center justify-center h-64">
       <div class="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
    </div>

    <div v-else-if="student" class="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- ═══ CABECERA ═══ -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-slate-100 pb-8 gap-6">
        <div class="space-y-1">
          <NuxtLink to="/admin/analytics" class="text-[10px] font-black uppercase text-indigo-500 hover:tracking-widest transition-all">← Volver al Panel</NuxtLink>
          <h1 class="text-4xl font-black text-black uppercase tracking-tighter italic">{{ student.user.name }}</h1>
          <p class="text-black font-mono text-xs uppercase tracking-widest">{{ student.codigoEstudiantil }}</p>
        </div>
        <!-- KPIs rápidos -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center bg-indigo-50 rounded-3xl p-4 border-2 border-indigo-100">
            <p class="text-2xl font-black text-indigo-600 font-mono">{{ student.totalPoints }}</p>
            <p class="text-[9px] font-black uppercase text-black mt-1">Puntos</p>
          </div>
          <div class="text-center bg-emerald-50 rounded-3xl p-4 border-2 border-emerald-100">
            <p class="text-2xl font-black text-emerald-600 font-mono">{{ summary?.successRate ?? '—' }}%</p>
            <p class="text-[9px] font-black uppercase text-black mt-1">Tasa Aciertos</p>
          </div>
          <div class="text-center bg-slate-50 rounded-3xl p-4 border-2 border-slate-100">
            <p class="text-2xl font-black text-black font-mono">{{ formatTime(summary?.avgTimeSeconds) }}</p>
            <p class="text-[9px] font-black uppercase text-black mt-1">Tiempo Prom.</p>
          </div>
          <div class="text-center bg-amber-50 rounded-3xl p-4 border-2 border-amber-100">
            <p class="text-2xl font-black text-amber-600 font-mono">{{ summary?.avgAutoEval ?? '—' }}/5</p>
            <p class="text-[9px] font-black uppercase text-black mt-1">Autoevaluación</p>
          </div>
        </div>
      </header>

      <!-- ═══ CUERPO PRINCIPAL ═══ -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">

        <!-- ── COLUMNA IZQUIERDA: Metacognición ── (3/5) -->
        <div class="lg:col-span-3 space-y-10">

          <!-- ─── DIAGNÓSTICOS INICIALES ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Diagnóstico Inicial (Planificación)
            </h2>

            <div v-if="student.checklists.length === 0" class="text-xs text-slate-400 italic px-4">Sin diagnósticos registrados aún.</div>

            <div
              v-for="cl in student.checklists" :key="cl.id"
              class="bg-white border-2 border-slate-100 rounded-[32px] p-7 space-y-5 shadow-sm"
            >
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">Planificación Inicial</span>
                <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(cl.createdAt) }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Plan de Resolución</p>
                  <p class="font-bold text-black">{{ cl.queSe || '—' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Espera Aprender</p>
                  <p class="font-bold text-black">{{ cl.queEsperoAprender || '—' }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Estrategia Elegida</p>
                  <p class="font-bold text-black">{{ Array.isArray(cl.estrategias) ? cl.estrategias[0] : '—' }}</p>
                </div>
                <div class="flex gap-4 items-center">
                  <div class="space-y-1">
                    <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Confianza Inicial</p>
                    <div class="flex gap-1">
                      <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.confianzaInicial || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    </div>
                  </div>
                  <div class="space-y-1 text-center">
                    <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Entorno OK</p>
                    <span class="text-lg">{{ cl.entornoSinDistracciones ? '✅' : '❌' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── META-REFLEXIONES FLAVELL ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Meta-Reflexión Final (Modelo de Flavell)
            </h2>

            <div v-if="student.reflections.length === 0" class="text-xs text-slate-400 italic px-4">Sin reflexiones registradas aún.</div>

            <div
              v-for="ref in student.reflections" :key="ref.id"
              class="bg-white border-2 border-slate-100 rounded-[32px] p-7 space-y-6 shadow-sm"
            >
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">Reflexión Post-Subfase</span>
                <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(ref.createdAt) }}</span>
              </div>

              <!-- Estrellas por dimensión -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="dim in starDimensions" :key="dim.key"
                  class="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2"
                >
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-tight">{{ dim.label }}</p>
                  <div class="flex gap-1 items-center">
                    <span v-for="i in 5" :key="i" class="text-lg transition-all" :class="i <= ((ref as any)[dim.key] || 0) ? 'opacity-100' : 'opacity-15 grayscale'">⭐</span>
                    <span class="ml-2 font-black text-black text-sm font-mono">{{ (ref as any)[dim.key] ?? '—' }}/5</span>
                  </div>
                </div>
              </div>

              <!-- Promedio + Transferencia -->
              <div class="flex flex-wrap gap-4 items-center">
                <div class="bg-indigo-50 rounded-2xl px-5 py-3 border border-indigo-100">
                  <span class="text-[9px] font-black uppercase text-indigo-500 block">Promedio</span>
                  <span class="font-black text-indigo-600 text-lg font-mono">{{ ref.autoEvaluacion ?? '—' }}/5</span>
                </div>
                <div v-if="ref.transferencia" class="rounded-2xl px-5 py-3 border-2 text-sm font-black" :class="transferColor(ref.transferencia)">
                  <span class="text-[9px] font-black uppercase opacity-60 block">¿Aplicar fuera del aula?</span>
                  {{ ref.transferencia }}
                </div>
              </div>

              <!-- Respuestas abiertas -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="ref.queFueDificil || ref.queHariaDiferente">
                <div v-if="ref.queFueDificil" class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Lo más difícil</p>
                  <p class="text-sm text-black italic bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">"{{ ref.queFueDificil }}"</p>
                </div>
                <div v-if="ref.queHariaDiferente" class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Haría diferente</p>
                  <p class="text-sm text-black italic bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">"{{ ref.queHariaDiferente }}"</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <!-- ── COLUMNA DERECHA: Desempeño Técnico ── (2/5) -->
        <div class="lg:col-span-2 space-y-8">

          <!-- ─── HISTORIAL DE INTENTOS ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Historial de Actividades
            </h2>

            <div class="bg-white border-2 border-slate-100 rounded-[32px] p-6 space-y-4 shadow-sm">
              <div v-if="student.attempts.length === 0" class="text-xs text-slate-400 italic text-center py-8">Sin intentos registrados aún.</div>
              
              <div
                v-for="attempt in student.attempts" :key="attempt.id"
                class="rounded-2xl border-2 p-4 space-y-3 transition-all"
                :class="wasCorrect(attempt) ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'"
              >
                <!-- Actividad + resultado -->
                <div class="flex justify-between items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <span class="text-[8px] font-black px-2 py-0.5 rounded-full" :class="subPhaseColor(attempt.activity.subPhase)">SF {{ attempt.activity.subPhase }}</span>
                      <span class="text-[8px] font-black uppercase text-slate-400">{{ attempt.activity.fase }}</span>
                    </div>
                    <h4 class="text-xs font-black text-black uppercase leading-tight truncate">{{ attempt.activity.titulo }}</h4>
                  </div>
                  <span class="text-xl shrink-0">{{ wasCorrect(attempt) ? '✅' : '❌' }}</span>
                </div>

                <!-- Métricas -->
                <div class="grid grid-cols-3 gap-2 text-center">
                  <!-- Puntaje -->
                  <div>
                    <p class="text-[8px] font-black uppercase text-slate-400">Puntaje</p>
                    <p class="font-black text-sm font-mono" :class="wasCorrect(attempt) ? 'text-emerald-600' : 'text-red-500'">
                      {{ attempt.puntajeObtenido ?? 0 }}
                    </p>
                  </div>
                  <!-- Confianza previa -->
                  <div>
                    <p class="text-[8px] font-black uppercase text-slate-400">Confianza</p>
                    <div class="flex justify-center gap-0.5">
                      <span v-for="i in 3" :key="i" class="text-xs" :class="i <= (attempt.confianzaPrevia || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    </div>
                  </div>
                  <!-- Tiempo -->
                  <div>
                    <p class="text-[8px] font-black uppercase text-slate-400">Tiempo</p>
                    <p class="font-black text-xs text-black font-mono">{{ formatTime(attempt.tiempoSegundos) }}</p>
                  </div>
                </div>

                <!-- Fecha -->
                <p class="text-[8px] text-slate-400 font-medium text-right">{{ formatDate(attempt.createdAt) }}</p>
              </div>
            </div>
          </section>

          <!-- ─── PROGRESO POR SUBFASE ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Avance por Subfase
            </h2>
            <div class="bg-slate-950 text-white rounded-[32px] p-7 space-y-5 shadow-2xl">
              <div v-if="student.progresses.length === 0" class="text-xs text-white/30 italic text-center py-4">Sin progreso registrado aún.</div>
              <div v-for="p in student.progresses" :key="p.id" class="space-y-2">
                <div class="flex justify-between items-center text-[10px] font-bold">
                  <span class="text-white/70">{{ p.phase }} — SF {{ p.subPhase }}</span>
                  <span class="text-emerald-400 font-mono">{{ Math.round(p.percentCompleted) }}%</span>
                </div>
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000 rounded-full"
                    :style="{ width: `${p.percentCompleted}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="max-w-6xl mx-auto flex items-center justify-center h-64">
      <p class="text-black font-bold">No se encontró el estudiante.</p>
    </div>
  </div>
</template>
