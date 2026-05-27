<script setup lang="ts">
definePageMeta({ 
  layout: 'main',
  middleware: ['auth', 'admin']
})

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Filler,
  LineController,
  RadarController
} from 'chart.js'
import { Line, Radar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler, LineController, RadarController
)

const route = useRoute()
const studentId = route.params.id

const { data: response, pending } = await useFetch(`/api/admin/analytics/student/${studentId}`)
const student = computed(() => (response.value as any)?.data)
const summary = computed(() => student.value?.summary)

// Chart.js Data
const scoreTimeline = computed(() => student.value?.scoreTimeline || [])
// We removed the Flavell radar chart from the DB, but we can keep it for legacy if needed or just remove it.
// Let's keep it in case there are legacy reflections, otherwise it will just be empty.
const metacognitionRadar = computed(() => student.value?.metacognitionRadar || [0, 0, 0, 0, 0])

const lineChartData = computed(() => ({
  labels: scoreTimeline.value.map((s: any) => `SF ${s.subPhase}`),
  datasets: [{
    label: 'Puntaje Obtenido',
    data: scoreTimeline.value.map((s: any) => s.score),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    fill: true,
    tension: 0.4
  }]
}))
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, max: 100 } },
  plugins: { legend: { display: false } }
}

const radarChartData = computed(() => ({
  labels: ['Claridad', 'Hechos', 'Datos', 'Estrategia', 'Promedio'],
  datasets: [{
    label: 'Autoevaluación (Legacy)',
    data: metacognitionRadar.value,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    pointBackgroundColor: '#10b981',
    pointHoverBackgroundColor: '#fff'
  }]
}))
const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { r: { beginAtZero: true, max: 5 } }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  })
}

const formatTime = (secs: number) => {
  if (!secs && secs !== 0) return '—'
  if (secs < 60) return `${secs} seg`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

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

const expandedAttemptId = ref<string | null>(null)
const toggleAttempt = (id: string) => {
  expandedAttemptId.value = expandedAttemptId.value === id ? null : id
}

const getChoiceText = (attempt: any) => {
  const chosenId = attempt.respuesta?.selectedId || attempt.respuesta
  const opciones = attempt.activity?.contenido?.opciones || []
  const opt = opciones.find((o: any) => o.id === chosenId)
  return opt ? opt.texto : chosenId || '(sin respuesta)'
}

const getCorrectChoiceText = (attempt: any) => {
  const opciones = attempt.activity?.contenido?.opciones || []
  const correctOpt = opciones.find((o: any) => o.esCorrecta) || opciones.find((o: any) => o.id === attempt.activity?.claveRespuestas?.correcta)
  return correctOpt ? correctOpt.texto : attempt.activity?.claveRespuestas?.correcta || '—'
}

// Helper functions para obtener las preguntas exactas por Fase
const getChecklistQuestions = (fase: string) => {
  if (fase === 'EVALUATION') {
    return [
      { id: 'jol1', label: 'Seguridad sin Ayuda', q: 'Para esta segunda fase, ¿Qué tan seguro te sientes de poder realizar el ejercicio sin pedir ayuda al tutor?' },
      { id: 'jol2', label: 'Tiempo Estimado', q: 'De acuerdo con la información que sabes hasta el momento, ¿Cuánto tiempo crees que podrías demorar realizando la segunda fase?' },
      { id: 'jol3', label: 'Interés en el Tema', q: '¿Sientes interesante el tema que se está tratando en el sistema tutor SIMECT?' },
      { id: 'jol4', label: 'Identificación de Fuentes', q: '¿Qué tan seguro estás de poder identificar si una fuente es falsa antes de verificarla?' },
      { id: 'jol5', label: 'Veracidad de Datos', q: '¿Qué tanta confianza sientes respecto a la veracidad de sus datos antes de investigar su origen?' },
    ]
  } else if (fase === 'JUDGMENT') {
    return [
      { id: 'jol1', label: 'Seguridad sin Ayuda', q: 'Para esta tercera fase, ¿Qué tan seguro te sientes de poder realizar el ejercicio sin pedir ayuda al tutor?' },
      { id: 'jol2', label: 'Tiempo Estimado', q: 'De acuerdo con la información que sabes hasta el momento, ¿Cuánto tiempo crees que podrías demorar realizando la tercera fase?' },
      { id: 'jol3', label: 'Interés en el Tema', q: '¿Sientes interesante el tema que se está tratando en el sistema tutor SIMECT?' },
      { id: 'jol4', label: 'Separación de Emociones', q: '¿Qué tan bueno eres para separar tus gustos o tus rabias a la hora de dar una opinión seria sobre un problema?' },
      { id: 'jol5', label: 'Defensa Objetiva', q: '¿Qué tan seguro estás de que podrías defender y explicar los argumentos de un compañero que piensa totalmente diferente a ti, sin terminar discutiendo?' },
    ]
  } else {
    // Fase 1 por defecto
    return [
      { id: 'jol1', label: 'Seguridad sin Ayuda', q: 'Desde este primer momento, ¿Qué tan seguro te sientes de poder realizar el ejercicio sin pedir ayuda al docente?' },
      { id: 'jol2', label: 'Seguridad del Tema', q: '¿Te sientes seguro del tema que se va a tratar en sistema tutor SIMECT?' },
      { id: 'jol3', label: 'Tiempo Estimado', q: 'De acuerdo con la información que sabes hasta el momento, ¿Cuánto tiempo crees que podrías demorar realizando la primera fase?' },
      { id: 'jol4', label: 'Atención a Medidas', q: '¿Qué tan acostumbrado estás a prestarle atención a los números y unidades de medida exactas?' },
      { id: 'jol5', label: 'Separar Hechos/Motivos', q: '¿Qué tan bueno eres para separar lo que una persona propone hacer del porqué dice que hay que hacerlo?' },
    ]
  }
}

const getMonitoringQuestions = (subPhase: string) => {
  const isPhase2 = subPhase.startsWith('2')
  return [
    { id: 'monitoreo1', label: 'Uso de Ayudas', q: 'Hasta este momento, ¿Has solicitado ayuda al tutor? ¿Cuántas veces?' },
    { id: 'monitoreo2', label: 'Interés', q: isPhase2 ? 'En una escala del 1 al 5 ¿Qué tan interesante has sentido el texto?' : 'En una escala del 1 al 5 ¿Qué tan interesante has sentido el tema a tratar en SIMECT?' },
    { id: 'monitoreo3', label: 'Gestión de Tiempo', q: '¿Estas cumpliendo con el tiempo que planteaste en la fase de planeación?' }
  ]
}

const getPhaseName = (fase: string) => {
  if (fase === 'EVALUATION') return 'Fase 2: Evaluación'
  if (fase === 'JUDGMENT') return 'Fase 3: Juicio'
  return 'Fase 1: Análisis'
}
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
            <p class="text-2xl font-black text-indigo-600 font-mono">{{ student.totalPoints || student.puntajeTotal || 0 }}</p>
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
            <p class="text-2xl font-black text-amber-600 font-mono">{{ summary?.avgScore ?? '—' }}</p>
            <p class="text-[9px] font-black uppercase text-black mt-1">Puntaje Prom.</p>
          </div>
        </div>
      </header>

      <!-- ═══ CUERPO PRINCIPAL ═══ -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">

        <!-- ── COLUMNA IZQUIERDA: Metacognición ── (3/5) -->
        <div class="lg:col-span-3 space-y-10">

          <!-- ─── DIAGNÓSTICOS INICIALES (PLANEACIÓN) ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Planeación por Fase (Checklists)
            </h2>

            <div v-if="student.checklists.length === 0" class="text-xs text-slate-400 italic px-4">Sin planeaciones registradas aún.</div>

            <div
              v-for="cl in student.checklists" :key="cl.id"
              class="bg-white border-2 border-slate-100 rounded-[32px] p-7 space-y-5 shadow-sm"
            >
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                  Planeación — {{ getPhaseName(cl.fase) }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(cl.createdAt) }}</span>
              </div>

              <!-- Visualización Dinámica de los JOLs -->
              <div class="space-y-4 mt-4">
                <div v-for="(q, index) in getChecklistQuestions(cl.fase)" :key="q.id" class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1">{{ index + 1 }}. {{ q.label }}</p>
                  <p class="text-sm font-medium text-slate-800 mb-2 leading-snug">{{ q.q }}</p>
                  <div class="flex items-center gap-2">
                    <template v-if="cl[q.id] !== null && cl[q.id] !== undefined">
                      <!-- Si es la pregunta de tiempo (jol3 en fase 1 o jol2 en fase 2/3), a veces se guarda como 1-5 o valor directo -->
                      <template v-if="cl[q.id] <= 5">
                        <span v-for="i in 5" :key="i" class="text-lg transition-all" :class="i <= cl[q.id] ? 'opacity-100' : 'opacity-20 grayscale'">⭐</span>
                        <span class="ml-2 font-black text-black font-mono text-sm">{{ cl[q.id] }}/5</span>
                      </template>
                      <template v-else>
                        <span class="font-black text-indigo-600 font-mono text-sm bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200">{{ cl[q.id] }} min</span>
                      </template>
                    </template>
                    <template v-else>
                      <span class="text-[10px] text-slate-400 italic">No respondió</span>
                    </template>
                  </div>
                </div>

                <!-- Legacy Fallbacks (Onboarding) -->
                <div v-if="cl.comprensionSIMECT !== null" class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p class="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Onboarding: Comprensión SIMECT</p>
                  <div class="flex items-center gap-2">
                    <span v-for="i in 5" :key="i" class="text-lg" :class="i <= cl.comprensionSIMECT ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="font-black text-emerald-800 font-mono text-sm">{{ cl.comprensionSIMECT }}/5</span>
                  </div>
                </div>
                
                <div v-if="cl.familiaridadTema !== null" class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p class="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Onboarding: Familiaridad con el Tema</p>
                  <div class="flex items-center gap-2">
                    <span v-for="i in 5" :key="i" class="text-lg" :class="i <= cl.familiaridadTema ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="font-black text-emerald-800 font-mono text-sm">{{ cl.familiaridadTema }}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── MONITOREO METACÓGNITIVO INTERMEDIO ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Monitoreos (Intermedio de Fase)
            </h2>

            <div v-if="!student.monitorings || student.monitorings.length === 0" class="text-xs text-slate-400 italic px-4">
              Sin monitoreos registrados aún.
            </div>

            <div
              v-for="mon in student.monitorings" :key="mon.id"
              class="bg-white border-2 border-slate-100 rounded-[32px] p-7 space-y-5 shadow-sm animate-in fade-in duration-300"
            >
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                  Monitoreo — SF {{ mon.subPhase }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(mon.createdAt) }}</span>
              </div>

              <!-- Preguntas Dinámicas de Monitoreo -->
              <div class="space-y-4 mt-4">
                <div v-for="(q, index) in getMonitoringQuestions(mon.subPhase)" :key="q.id" class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] font-black uppercase text-indigo-400 tracking-widest mb-1">{{ index + 1 }}. {{ q.label }}</p>
                  <p class="text-sm font-medium text-slate-800 mb-2 leading-snug">{{ q.q }}</p>
                  <div class="flex items-center gap-2">
                    <template v-if="mon[q.id] !== null && mon[q.id] !== undefined">
                      <span v-for="i in 5" :key="i" class="text-lg transition-all" :class="i <= mon[q.id] ? 'opacity-100' : 'opacity-20 grayscale'">⭐</span>
                      <span class="ml-2 font-black text-black font-mono text-sm">{{ mon[q.id] }}/5</span>
                    </template>
                    <template v-else>
                      <span class="text-[10px] text-slate-400 italic">No respondió</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── PUNTOS DE CONTROL (REFLECTIONS) ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Puntos de Control (Fin de Fase)
            </h2>

            <div v-if="student.reflections.length === 0" class="text-xs text-slate-400 italic px-4">Sin puntos de control registrados aún.</div>

            <div
              v-for="(ref, i) in student.reflections" :key="ref.id"
              class="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-7 flex items-center justify-between shadow-sm"
            >
              <div>
                <span class="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">
                  Punto de Control Superado
                </span>
                <p class="text-sm font-bold text-emerald-900">
                  Fase Completada Exitosamente ✅
                </p>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-emerald-600 font-medium block">{{ formatDate(ref.createdAt) }}</span>
                <span class="text-[8px] uppercase tracking-widest font-black text-emerald-500/50 block mt-1">Registro DB: {{ ref.id.slice(0,8) }}</span>
              </div>
            </div>

            <!-- Legacy Radar si existen datos de autoevaluación -->
            <div v-if="metacognitionRadar.some(v => v > 0)" class="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-sm mt-6">
               <h3 class="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 text-center">Autoevaluación Legacy (Modelo Flavell)</h3>
               <div class="h-48 flex justify-center items-center">
                  <Radar :data="radarChartData" :options="radarChartOptions" />
               </div>
            </div>
          </section>

        </div>

        <!-- ── COLUMNA DERECHA: Desempeño Técnico ── (2/5) -->
        <div class="lg:col-span-2 space-y-8">

          <!-- ─── HISTORIAL DE INTENTOS Y GRÁFICA DE LÍNEAS ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Desempeño en Actividades
            </h2>

            <!-- Gráfica de Evolución de Puntajes -->
            <div class="bg-white border-2 border-indigo-100 rounded-[32px] p-6 shadow-xl mb-6">
               <h3 class="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-4 text-center">Evolución de Puntajes</h3>
               <div class="h-48">
                  <Line :data="lineChartData" :options="lineChartOptions" />
               </div>
            </div>

            <!-- Lista de Intentos -->
            <div class="bg-white border-2 border-slate-100 rounded-[32px] p-6 space-y-4 shadow-sm">
              <div v-if="student.attempts.length === 0" class="text-xs text-slate-400 italic text-center py-8">Sin intentos registrados aún.</div>
              
              <div
                v-for="attempt in student.attempts" :key="attempt.id"
                class="rounded-2xl border-2 p-4 space-y-3 transition-all"
                :class="wasCorrect(attempt) ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'"
              >
                <!-- Actividad + resultado -->
                <div class="flex justify-between items-start gap-2 border-b pb-3" :class="wasCorrect(attempt) ? 'border-emerald-100' : 'border-red-100'">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-1.5">
                      <span class="text-[8px] font-black px-2 py-0.5 rounded-full" :class="subPhaseColor(attempt.activity?.subPhase)">SF {{ attempt.activity?.subPhase }}</span>
                      <span class="text-[8px] font-black uppercase text-slate-500">{{ getPhaseName(attempt.activity?.fase) }}</span>
                      <span class="text-[8px] font-black px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        {{ attempt.activity?.nivel === 'BASIC' ? 'Básico' : attempt.activity?.nivel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado' }}
                      </span>
                    </div>
                    <h4 class="text-xs font-black text-black uppercase leading-tight line-clamp-2">{{ attempt.activity?.titulo || 'Actividad sin título' }}</h4>
                  </div>
                  <span class="text-xl shrink-0 mt-1">{{ wasCorrect(attempt) ? '✅' : '❌' }}</span>
                </div>

                <!-- Métricas -->
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <!-- Puntaje -->
                  <div class="bg-white rounded-xl p-2 border border-slate-100 flex flex-col justify-center items-center">
                    <p class="text-[8px] font-black uppercase text-slate-400 mb-0.5">Puntaje</p>
                    <p class="font-black text-sm font-mono" :class="wasCorrect(attempt) ? 'text-emerald-600' : 'text-red-500'">
                      {{ attempt.puntajeObtenido ?? 0 }} / 10
                    </p>
                  </div>
                  <!-- Tiempo -->
                  <div class="bg-white rounded-xl p-2 border border-slate-100 flex flex-col justify-center items-center">
                    <p class="text-[8px] font-black uppercase text-slate-400 mb-0.5">Tiempo Invertido</p>
                    <p class="font-black text-sm text-slate-700 font-mono">{{ formatTime(attempt.tiempoSegundos) }}</p>
                  </div>
                </div>

                <!-- Botón expandir -->
                <div class="pt-1">
                  <button
                    @click="toggleAttempt(attempt.id)"
                    class="w-full text-[8px] font-black uppercase tracking-widest text-center py-2.5 rounded-xl transition-all"
                    :class="expandedAttemptId === attempt.id ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                  >
                    {{ expandedAttemptId === attempt.id ? '▲ Ocultar Detalles' : '▼ Ver Respuesta Enviada' }}
                  </button>

                  <div v-if="expandedAttemptId === attempt.id" class="mt-3 space-y-2 animate-in slide-in-from-top-2">
                    
                    <!-- Respuesta de Desglose (Si es interactiva/mapa) -->
                    <template v-if="attempt.feedbackRecibido?.itemBreakdown?.length">
                      <div class="space-y-2">
                        <p class="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Desglose de Ítems Respondidos</p>
                        <div
                          v-for="item in attempt.feedbackRecibido.itemBreakdown" :key="item.itemId"
                          class="flex items-start gap-2 p-3 rounded-xl border bg-white shadow-sm"
                          :class="item.isCorrect ? 'border-emerald-200' : 'border-red-200'"
                        >
                          <span class="text-sm flex-shrink-0 mt-0.5">{{ item.isCorrect ? '✅' : '❌' }}</span>
                          <div class="min-w-0 flex-1">
                            <p class="text-[9px] font-black text-slate-500 truncate uppercase tracking-wide">{{ item.label }}</p>
                            <p class="text-[11px] font-bold mt-1 leading-tight" :class="item.isCorrect ? 'text-emerald-700' : 'text-red-700'">
                              Su respuesta: {{ item.studentAnswer }}
                            </p>
                            <p v-if="!item.isCorrect" class="text-[10px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              ✔ Correcta: <span class="font-bold text-emerald-700">{{ item.correctAnswer }}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Respuesta simple (Opción Múltiple o Texto) -->
                    <template v-else>
                      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div v-if="attempt.activity?.tipo === 'MULTIPLE_CHOICE_REASONED'">
                          <p class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Opción elegida por el estudiante</p>
                          <p class="text-xs font-bold text-slate-800 leading-snug p-2 bg-slate-50 rounded-lg border border-slate-100">
                            {{ getChoiceText(attempt) }}
                          </p>
                          <div v-if="(attempt.puntajeObtenido || 0) < 10" class="mt-3">
                            <p class="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Opción Correcta</p>
                            <p class="text-xs font-bold text-emerald-800 leading-snug p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                              {{ getCorrectChoiceText(attempt) }}
                            </p>
                          </div>
                        </div>

                        <div v-else>
                          <p class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Respuesta enviada</p>
                          <p class="text-xs font-bold text-slate-800 leading-snug p-2 bg-slate-50 rounded-lg border border-slate-100">
                            {{ attempt.respuesta?.text || attempt.respuesta || '(Sin respuesta de texto)' }}
                          </p>
                          <div v-if="(attempt.puntajeObtenido || 0) < 10 && attempt.activity?.claveRespuestas?.respuestaExacta" class="mt-3">
                            <p class="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Respuesta Esperada</p>
                            <p class="text-xs font-bold text-emerald-800 leading-snug p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                              {{ attempt.activity.claveRespuestas.respuestaExacta }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Mensaje del Tutor -->
                    <div v-if="attempt.feedbackRecibido?.message" class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mt-3 relative overflow-hidden">
                      <div class="absolute top-0 right-0 p-2 opacity-10 text-2xl">🤖</div>
                      <p class="text-[8px] font-black uppercase tracking-widest text-indigo-500 mb-1 relative z-10">Tutor SIMECT</p>
                      <p class="text-[10px] text-indigo-900 font-bold italic leading-relaxed relative z-10">
                        "{{ attempt.feedbackRecibido.message }}"
                      </p>
                    </div>
                  </div>
                </div>

                <p class="text-[8px] text-slate-400 font-medium text-right pt-2 border-t border-slate-100">{{ formatDate(attempt.createdAt) }}</p>
              </div>
            </div>
          </section>

          <!-- ─── PROGRESO POR SUBFASE ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Avance en el Sendero
            </h2>
            <div class="bg-slate-950 text-white rounded-[32px] p-7 space-y-5 shadow-2xl relative overflow-hidden">
              <!-- Grid background -->
              <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></div>
              
              <div v-if="student.progresses.length === 0" class="text-xs text-white/30 italic text-center py-4 relative z-10">Sin avance registrado aún.</div>
              <div v-for="p in student.progresses" :key="p.id" class="space-y-2 relative z-10">
                <div class="flex justify-between items-center text-[10px] font-bold">
                  <span class="text-white/70">{{ getPhaseName(p.phase) }} — SF {{ p.subPhase }}</span>
                  <span class="text-emerald-400 font-mono">{{ Math.round(p.percentCompleted) }}%</span>
                </div>
                <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
      <div class="text-center space-y-2">
        <p class="text-4xl">📭</p>
        <p class="text-black font-black uppercase tracking-widest text-sm">No se encontró el estudiante</p>
      </div>
    </div>
  </div>
</template>
