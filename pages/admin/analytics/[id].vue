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
    label: 'Autoevaluación',
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
  return correctOpt ? correctOpt.texto : attempt.activity?.claveRespuestas?.correcta || 'a'
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

              <!-- Nueva visualización adaptada a las métricas JOL y onboarding del sendero -->
              <div v-if="cl.seguridadSinAyuda !== null" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
                
                <!-- JOL 1 -->
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">01. Seguridad sin Ayuda (Tutor)</p>
                  <div class="flex gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.seguridadSinAyuda || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                  </div>
                </div>

                <!-- JOL 2 -->
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">02. Seguridad del Tema</p>
                  <div class="flex gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.seguridadTema || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                  </div>
                </div>

                <!-- JOL 3 -->
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">03. Tiempo Estimado (Fase 1)</p>
                  <p class="font-bold text-slate-900 font-mono text-sm">{{ cl.tiempoEstimadoFase1 ? `${cl.tiempoEstimadoFase1} min` : '—' }}</p>
                </div>

                <!-- JOL 4 -->
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">04. Atención a Números/Medidas</p>
                  <div class="flex gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.atencionNumeros || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                  </div>
                </div>

                <!-- JOL 5 -->
                <div class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">05. Separación de Argumentos</p>
                  <div class="flex gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.separacionArgumentos || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                  </div>
                </div>

                <!-- Onboarding Comprensión (si existe) -->
                <div v-if="cl.comprensionSIMECT !== null" class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Comprensión de SIMECT</p>
                  <div class="flex gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.comprensionSIMECT || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                  </div>
                </div>

                <!-- Onboarding Familiaridad (si existe) -->
                <div v-if="cl.familiaridadTema !== null" class="space-y-1">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest">Familiaridad con el Tema</p>
                  <div class="flex gap-0.5">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (cl.familiaridadTema || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                  </div>
                </div>

              </div>

              <!-- Legacy Fallback (para compatibilidad de registros anteriores) -->
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

          <!-- ─── MONITOREO METACÓGNITIVO INTERMEDIO ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span> Monitoreo Metacognitivo Intermedio (Fase 1)
            </h2>

            <div v-if="!student.monitorings || student.monitorings.length === 0" class="text-xs text-slate-400 italic px-4">
              Sin monitoreos registrados aún en esta fase.
            </div>

            <div
              v-for="mon in student.monitorings" :key="mon.id"
              class="bg-white border-2 border-slate-100 rounded-[32px] p-7 space-y-5 shadow-sm animate-in fade-in duration-300"
            >
              <div class="flex justify-between items-center">
                <span class="text-[9px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                  Monitoreo SF {{ mon.subPhase }}
                </span>
                <span class="text-[10px] text-slate-400 font-medium">{{ formatDate(mon.createdAt) }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold">
                <!-- Dimensión 1 -->
                <div class="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">01. Atención al Detalle</p>
                  <div class="flex gap-1 items-center mt-1">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (mon.atencionDetalle || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="ml-2 font-black text-black font-mono text-xs">{{ mon.atencionDetalle }}/5</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-1 italic leading-tight">
                    {{ 
                      mon.atencionDetalle === 1 ? 'Me distraje por completo; no recuerdo ninguna cifra.' :
                      mon.atencionDetalle === 2 ? 'Vi los números, pero no les presté atención real.' :
                      mon.atencionDetalle === 3 ? 'Los leí con cuidado, pero tuve que devolverme.' :
                      mon.atencionDetalle === 4 ? 'Estuve atento y retuve la mayoría de datos.' :
                      mon.atencionDetalle === 5 ? 'Estuve 100% enfocado; capté cada dato.' : '—'
                    }}
                  </p>
                </div>

                <!-- Dimensión 2 -->
                <div class="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">02. Filtro de Información (Trampas)</p>
                  <div class="flex gap-1 items-center mt-1">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (mon.filtroInformacion || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="ml-2 font-black text-black font-mono text-xs">{{ mon.filtroInformacion }}/5</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-1 italic leading-tight">
                    {{ 
                      mon.filtroInformacion === 1 ? 'Habría creído de inmediato al WhatsApp anónimo.' :
                      mon.filtroInformacion === 2 ? 'Me parecieron creíbles; casi caigo en la trampa.' :
                      mon.filtroInformacion === 3 ? 'Dudé de las fuentes, pero esperé la solución.' :
                      mon.filtroInformacion === 4 ? 'Identifiqué rápido que eran fuentes dudosas.' :
                      mon.filtroInformacion === 5 ? 'Supe de inmediato; activé alertas al instante.' : '—'
                    }}
                  </p>
                </div>

                <!-- Dimensión 3 -->
                <div class="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">03. Conexión con Planeación</p>
                  <div class="flex gap-1 items-center mt-1">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (mon.conexionPlaneacion || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="ml-2 font-black text-black font-mono text-xs">{{ mon.conexionPlaneacion }}/5</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-1 italic leading-tight">
                    {{ 
                      mon.conexionPlaneacion === 1 ? 'Me olvidé de lo planeado; leí en piloto automático.' :
                      mon.conexionPlaneacion === 2 ? 'Me acordé un par de veces, pero costó aplicarlo.' :
                      mon.conexionPlaneacion === 3 ? 'Apliqué la estrategia al ponerse difícil la lectura.' :
                      mon.conexionPlaneacion === 4 ? 'Intenté separar propuestas de motivos en el texto.' :
                      mon.conexionPlaneacion === 5 ? 'Totalmente; usé la estrategia de inicio a fin.' : '—'
                    }}
                  </p>
                </div>

                <!-- Dimensión 4 -->
                <div class="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">04. Esfuerzo Cognitivo</p>
                  <div class="flex gap-1 items-center mt-1">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (mon.esfuerzoCognitivo || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="ml-2 font-black text-black font-mono text-xs">{{ mon.esfuerzoCognitivo }}/5</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-1 italic leading-tight">
                    {{ 
                      mon.esfuerzoCognitivo === 1 ? 'Demasiado esfuerzo; me siento muy confundido.' :
                      mon.esfuerzoCognitivo === 2 ? 'Esfuerzo alto; cuesta conectar datos y decisiones.' :
                      mon.esfuerzoCognitivo === 3 ? 'Esfuerzo moderado; hace pensar, voy entendiendo.' :
                      mon.esfuerzoCognitivo === 4 ? 'Esfuerzo bajo; cómodo analizando argumentos.' :
                      mon.esfuerzoCognitivo === 5 ? 'Muy fácil; proceso la lógica sin problemas.' : '—'
                    }}
                  </p>
                </div>

                <!-- Dimensión 5 -->
                <div class="space-y-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 md:col-span-2">
                  <p class="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">05. Monitoreo de Seguridad/Confianza Actual</p>
                  <div class="flex gap-1 items-center mt-1">
                    <span v-for="i in 5" :key="i" class="text-base" :class="i <= (mon.confianzaActual || 0) ? 'opacity-100' : 'opacity-20'">⭐</span>
                    <span class="ml-2 font-black text-black font-mono text-xs">{{ mon.confianzaActual }}/5</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-1 italic leading-tight">
                    {{ 
                      mon.confianzaActual === 1 ? 'Me siento igual o más confundido que antes.' :
                      mon.confianzaActual === 2 ? 'Siento que sé lo mismo, no he descubierto nada.' :
                      mon.confianzaActual === 3 ? 'He aclarado un par de dudas sobre el río y fuentes.' :
                      mon.confianzaActual === 4 ? 'Siento que ahora comprendo mucho mejor las causas.' :
                      mon.confianzaActual === 5 ? 'Giro total; ahora veo el problema como analista.' : '—'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── META-REFLEXIONES FLAVELL ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Meta-Reflexión (Modelo de Flavell)
            </h2>

            <!-- Resumen Global: Radar -->
            <div class="bg-white border-2 border-emerald-100 rounded-[32px] p-6 shadow-xl mb-6">
               <h3 class="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2 text-center">Autoevaluación Metacognitiva del Estudiante</h3>
               <p class="text-[10px] text-center text-slate-400 mb-4 px-8 leading-tight italic">Este gráfico refleja cómo el estudiante se calificó a sí mismo al finalizar las actividades.</p>
               <div class="h-64 flex justify-center items-center">
                  <Radar :data="radarChartData" :options="radarChartOptions" />
               </div>
            </div>

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

          <!-- ─── HISTORIAL DE INTENTOS Y GRÁFICA DE LÍNEAS ─── -->
          <section class="space-y-4">
            <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Desempeño Técnico
            </h2>

            <!-- Gráfica de Evolución de Puntajes -->
            <div class="bg-white border-2 border-indigo-100 rounded-[32px] p-6 shadow-xl mb-6">
               <h3 class="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-4 text-center">Evolución de Puntajes</h3>
               <div class="h-64">
                  <Line :data="lineChartData" :options="lineChartOptions" />
               </div>
            </div>

            <!-- Lista de Intentos -->
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
                      <span class="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {{ attempt.activity.nivel === 'BASIC' ? 'Básico' : attempt.activity.nivel === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado' }}
                      </span>
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

                <!-- Botón expandir / Desglose por ítem y feedback -->
                <div v-if="attempt.feedbackRecibido">
                  <button
                    @click="toggleAttempt(attempt.id)"
                    class="w-full text-[8px] font-black uppercase tracking-widest text-center py-2 rounded-xl transition-all"
                    :class="expandedAttemptId === attempt.id ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                  >
                    {{ expandedAttemptId === attempt.id ? '▲ Ocultar detalle' : '▼ Ver feedback y respuesta' }}
                  </button>

                  <div v-if="expandedAttemptId === attempt.id" class="mt-3 space-y-2">
                    <!-- Desglose por item si existe -->
                    <template v-if="attempt.feedbackRecibido.itemBreakdown?.length">
                      <div
                        v-for="item in attempt.feedbackRecibido.itemBreakdown" :key="item.itemId"
                        class="flex items-start gap-2 p-3 rounded-xl border"
                        :class="item.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'"
                      >
                        <span class="text-sm flex-shrink-0">{{ item.isCorrect ? '✅' : '❌' }}</span>
                        <div class="min-w-0 flex-1">
                          <p class="text-[9px] font-black text-slate-500 truncate uppercase tracking-wide">{{ item.label }}</p>
                          <p class="text-[10px] font-bold mt-0.5" :class="item.isCorrect ? 'text-emerald-700' : 'text-red-700'">
                            {{ item.studentAnswer }}
                          </p>
                          <p v-if="!item.isCorrect" class="text-[10px] text-slate-500">
                            ✔ Correcta: <span class="font-bold text-emerald-700">{{ item.correctAnswer }}</span>
                          </p>
                        </div>
                      </div>
                    </template>

                    <!-- Respuesta simple para actividades de ítem único (ej. Selección Múltiple, Completar Espacio) -->
                    <template v-else>
                      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                        <!-- Caso: Selección Múltiple -->
                        <div v-if="attempt.activity?.tipo === 'MULTIPLE_CHOICE_REASONED'">
                          <p class="text-[8px] font-black uppercase tracking-widest text-slate-400">Opción elegida por el estudiante</p>
                          <p class="text-[10px] font-bold text-slate-800 mt-1 leading-snug">
                            {{ getChoiceText(attempt) }}
                          </p>
                          <div v-if="(attempt.puntajeObtenido || 0) < 10" class="text-[10px] text-slate-500 mt-1">
                            ✔ Correcta: <span class="font-bold text-emerald-700">{{ getCorrectChoiceText(attempt) }}</span>
                          </div>
                        </div>

                        <!-- Caso: Completar Espacio u Otros -->
                        <div v-else>
                          <p class="text-[8px] font-black uppercase tracking-widest text-slate-400">Respuesta enviada</p>
                          <p class="text-[10px] font-bold text-slate-800 mt-1 leading-snug">
                            "{{ attempt.respuesta?.text || attempt.respuesta || '(vacío)' }}"
                          </p>
                          <div v-if="(attempt.puntajeObtenido || 0) < 10 && attempt.activity?.claveRespuestas?.respuestaExacta" class="text-[10px] text-slate-500 mt-1">
                            ✔ Esperada: <span class="font-bold text-emerald-700">"{{ attempt.activity.claveRespuestas.respuestaExacta }}"</span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Mensaje del Tutor -->
                    <div v-if="attempt.feedbackRecibido.message" class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mt-2">
                      <p class="text-[8px] font-black uppercase tracking-widest text-indigo-500 mb-1">💬 Retroalimentación dada al estudiante</p>
                      <p class="text-[10px] text-indigo-900 font-bold italic leading-relaxed">
                        "{{ attempt.feedbackRecibido.message }}"
                      </p>
                    </div>
                  </div>
                </div>
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
