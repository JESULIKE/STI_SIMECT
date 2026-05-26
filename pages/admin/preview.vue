<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MultipleChoiceActivity from '~/components/activities/types/MultipleChoiceActivity.vue'
import FillInTheBlankActivity from '~/components/activities/types/FillInTheBlankActivity.vue'
import MatchingActivity from '~/components/activities/types/MatchingActivity.vue'
import ClassificationActivity from '~/components/activities/types/ClassificationActivity.vue'
import TrafficLightActivity from '~/components/activities/types/TrafficLightActivity.vue'
import SequenceOrderActivity from '~/components/activities/types/SequenceOrderActivity.vue'
import ArrowMatchingActivity from '~/components/activities/types/ArrowMatchingActivity.vue'
import DragAndDropActivity from '~/components/activities/types/DragAndDropActivity.vue'
import TextMarkupActivity from '~/components/activities/types/TextMarkupActivity.vue'

definePageMeta({ layout: 'main' })

const { data: allActivities, pending } = await useFetch('/api/admin/activities')

const selected = ref<any>(null)
const fakeAnswer = ref<any>({})
const fakeState = ref<'in_progress' | 'finished'>('in_progress')

const faseLabel: Record<string, string> = {
  ANALYSIS: 'Fase 1 — Análisis',
  EVALUATION: 'Fase 2 — Evaluación',
  JUDGMENT: 'Fase 3 — Juicio',
}
const nivelLabel: Record<string, string> = {
  BASIC: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}
const tipoLabel: Record<string, string> = {
  FILL_IN_THE_BLANK: '📝 Completar espacio',
  MULTIPLE_CHOICE_REASONED: '🔘 Selección múltiple',
  MATCHING: '🔗 Emparejar',
  CLASSIFICATION: '📂 Clasificar',
  TRAFFIC_LIGHT: '🚦 Semáforo',
  SEQUENCE_ORDER: '🔢 Ordenar secuencia',
  ARROW_MATCHING: '➡️ Conectar con flecha',
  DRAG_AND_DROP: '🖱️ Arrastrar y soltar',
  TEXT_MARKUP: '🖊️ Seleccionar fragmento',
}

const grouped = computed(() => {
  if (!allActivities.value) return {}
  const groups: Record<string, any[]> = {}
  for (const act of allActivities.value as any[]) {
    const key = `${act.fase}__${act.subPhase}`
    if (!groups[key]) groups[key] = []
    groups[key].push(act)
  }
  return groups
})

function selectActivity(act: any) {
  selected.value = act
  fakeAnswer.value = {}
  fakeState.value = 'in_progress'
}

function resetPreview() {
  fakeAnswer.value = {}
  fakeState.value = 'in_progress'
}

// ──────────────────────────────────────────────────────────────────
// FEEDBACK EN VIVO: calcula item a item sin enviar al servidor
// ──────────────────────────────────────────────────────────────────
const liveBreakdown = computed(() => {
  const act = selected.value
  const ans = fakeAnswer.value
  if (!act || !ans || !act.claveRespuestas) return []

  const tipo = act.tipo
  const clave = act.claveRespuestas

  if (tipo === 'FILL_IN_THE_BLANK' || tipo === 'TEXT_MARKUP') {
    const studentText = (ans.text || '').toLowerCase().trim()
    const correct = (clave.respuestaExacta || '').toLowerCase().trim()
    if (!studentText) return []
    return [{ itemId: 'ans', label: 'Tu respuesta', studentAnswer: ans.text, correctAnswer: clave.respuestaExacta, isCorrect: studentText === correct || studentText.includes(correct) }]
  }

  if (tipo === 'MULTIPLE_CHOICE_REASONED') {
    const chosen = ans.selectedId
    if (!chosen) return []
    const opts = act.contenido?.opciones || []
    const correctOpt = opts.find((o: any) => o.esCorrecta)
    const chosenOpt = opts.find((o: any) => o.id === chosen)
    return [{ itemId: chosen, label: 'Opción seleccionada', studentAnswer: chosenOpt?.texto || chosen, correctAnswer: correctOpt?.texto || clave.correcta, isCorrect: correctOpt?.id === chosen }]
  }

  if (tipo === 'MATCHING') {
    const student = ans.matching || {}
    const correct = clave.matching || {}
    const pares = act.contenido?.pares || []
    return Object.entries(correct).map(([id, correctVal]: any) => {
      const par = pares.find((p: any) => p.id === id)
      const studentVal = student[id] || ''
      return { itemId: id, label: par?.izquierda || id, studentAnswer: studentVal || '(sin respuesta)', correctAnswer: correctVal, isCorrect: studentVal.toLowerCase().trim() === correctVal.toLowerCase().trim() }
    })
  }

  if (tipo === 'CLASSIFICATION') {
    const student = ans.classification || {}
    const correct = clave.classification || {}
    const items = act.contenido?.items || []
    const cols = act.contenido?.columnas || []
    return Object.entries(correct).map(([itemId, correctColId]: any) => {
      const item = items.find((i: any) => i.id === itemId)
      const correctCol = cols.find((c: any) => c.id === correctColId)
      const studentColId = student[itemId] || ''
      const studentCol = cols.find((c: any) => c.id === studentColId)
      return { itemId, label: item?.texto || itemId, studentAnswer: studentCol?.label || studentColId || '(sin respuesta)', correctAnswer: correctCol?.label || correctColId, isCorrect: studentColId === correctColId }
    })
  }

  if (tipo === 'ARROW_MATCHING') {
    const studentArrows: any[] = ans.arrows || []
    const correctArrows: any[] = clave.arrows || []
    const izq = act.contenido?.izquierda || []
    const der = act.contenido?.derecha || []
    return correctArrows.map(ca => {
      const fromItem = izq.find((i: any) => i.id === ca.from)
      const toItem = der.find((d: any) => d.id === ca.to)
      const studentArrow = studentArrows.find(sa => sa.from === ca.from)
      const studentToItem = der.find((d: any) => d.id === studentArrow?.to)
      return { itemId: ca.from, label: fromItem?.texto || ca.from, studentAnswer: studentToItem?.texto || studentArrow?.to || '(sin respuesta)', correctAnswer: toItem?.texto || ca.to, isCorrect: studentArrow?.to === ca.to }
    })
  }

  if (tipo === 'SEQUENCE_ORDER') {
    const studentSeq: string[] = ans.sequence || []
    const correctSeq: string[] = clave.sequence || []
    const items = act.contenido?.items || []
    return correctSeq.map((id: string, idx: number) => {
      const item = items.find((i: any) => i.id === id)
      const studentId = studentSeq[idx]
      const studentItem = items.find((i: any) => i.id === studentId)
      return { itemId: id, label: `Posición ${idx + 1}`, studentAnswer: studentItem?.texto || studentId || '(sin respuesta)', correctAnswer: item?.texto || id, isCorrect: studentId === id }
    })
  }

  if (tipo === 'TRAFFIC_LIGHT') {
    const student = ans.trafficLight || {}
    const correct = clave.trafficLight || {}
    const fuentes = act.contenido?.fuentes || []
    const colorLabel: Record<string, string> = { green: '✅ Confiable', yellow: '⚠️ Dudosa', red: '❌ No confiable' }
    return Object.entries(correct).map(([id, correctColor]: any) => {
      const fuente = fuentes.find((f: any) => f.id === id)
      const studentColor = student[id] || ''
      return { itemId: id, label: fuente?.nombre || id, studentAnswer: colorLabel[studentColor] || studentColor || '(sin respuesta)', correctAnswer: colorLabel[correctColor] || correctColor, isCorrect: studentColor === correctColor }
    })
  }

  if (tipo === 'DRAG_AND_DROP') {
    const mapping = clave.mapping || {}
    const studentMapping = ans.mapping || {}
    const items = act.contenido?.items || []
    const categorias = act.contenido?.categorias || act.contenido?.categories || []
    return items.map((item: any) => {
      const correctCatId = mapping[item.id]
      const studentCatId = studentMapping[item.id] || ''
      const correctCat = categorias.find((c: any) => c.id === correctCatId)
      const studentCat = categorias.find((c: any) => c.id === studentCatId)
      return { itemId: item.id, label: item.texto, studentAnswer: studentCat?.label || studentCatId || '(sin respuesta)', correctAnswer: correctCat?.label || correctCatId, isCorrect: studentCatId === correctCatId }
    })
  }

  return []
})

const liveScore = computed(() => {
  if (!liveBreakdown.value.length) return null
  const correct = liveBreakdown.value.filter((i: any) => i.isCorrect).length
  const total = liveBreakdown.value.length
  return { correct, total, pct: Math.round((correct / total) * 100) }
})

const liveHasAnswer = computed(() => {
  const ans = fakeAnswer.value
  if (!ans) return false
  const tipo = selected.value?.tipo
  if (tipo === 'MULTIPLE_CHOICE_REASONED') return !!ans.selectedId
  if (tipo === 'FILL_IN_THE_BLANK' || tipo === 'TEXT_MARKUP') return !!(ans.text?.trim())
  if (tipo === 'MATCHING') return Object.keys(ans.matching || {}).length > 0
  if (tipo === 'CLASSIFICATION') return Object.keys(ans.classification || {}).length > 0
  if (tipo === 'ARROW_MATCHING') return (ans.arrows || []).length > 0
  if (tipo === 'SEQUENCE_ORDER') return (ans.sequence || []).length > 0
  if (tipo === 'TRAFFIC_LIGHT') return Object.keys(ans.trafficLight || {}).length > 0
  if (tipo === 'DRAG_AND_DROP') return Object.keys(ans.mapping || {}).length > 0
  return false
})

// Mensaje de feedback que daría el sistema (espejo del motor pedagógico)
const liveFeedbackMessage = computed(() => {
  if (!liveHasAnswer.value || !selected.value) return ''
  const tipo = selected.value.tipo
  const ans = fakeAnswer.value
  const score = liveScore.value?.pct ?? 0

  // Para selección múltiple: mostrar el feedback específico de la opción elegida
  if (tipo === 'MULTIPLE_CHOICE_REASONED') {
    const chosen = ans.selectedId
    const opts = selected.value.contenido?.opciones || []
    const chosenOpt = opts.find((o: any) => o.id === chosen)
    if (chosenOpt?.feedback) return chosenOpt.feedback
  }

  // Para el resto: mensaje según puntaje (espejo de getNextAction)
  if (score >= 90) return '¡Excelente! Respondiste perfectamente. Demuestras un dominio sólido de este concepto.'
  if (score >= 70) return '¡Muy bien! Vas por buen camino. Sin embargo, ¿has considerado si tu argumento es "Lógico" y "Relevante"? Revisa la guía de estándares intelectuales.'
  if (score >= 50) return '¡Aprobado! Respondiste más de la mitad correctamente. Sigue practicando para mejorar tu precisión.'
  if (score >= 25) return 'Antes de continuar, reflexiona: ¿tu respuesta es lo suficientemente "Precisa"? Un buen pensador crítico verifica sus fuentes. Haremos un refuerzo rápido.'
  return 'He notado que persisten algunas dudas. Para construir un juicio sólido, es vital volver a los fundamentos. Reforcemos las bases antes de avanzar.'
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- SIDEBAR: Lista de actividades -->
    <aside class="w-72 min-h-screen bg-white border-r border-slate-100 flex flex-col overflow-hidden flex-shrink-0">
      <div class="p-5 border-b border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Panel Admin</p>
        <h1 class="text-lg font-black text-black">Previsualizar Actividades</h1>
        <p class="text-xs text-slate-400 mt-1">Haz clic en cualquier pregunta para probarla</p>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-4">
        <div v-if="pending" class="text-center py-10 text-slate-400 text-sm">Cargando...</div>

        <template v-for="(acts, groupKey) in grouped" :key="groupKey">
          <div>
            <div class="px-3 py-2 mb-1">
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {{ faseLabel[(groupKey as string).split('__')[0]] }} · Sub {{ (groupKey as string).split('__')[1] }}
              </p>
            </div>
            <button
              v-for="act in acts" :key="act.id"
              @click="selectActivity(act)"
              class="w-full text-left px-3 py-3 rounded-2xl transition-all mb-1"
              :class="selected?.id === act.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'hover:bg-slate-50 text-slate-700'"
            >
              <div class="flex items-start gap-3">
                <span class="text-base mt-0.5">{{ tipoLabel[act.tipo]?.split(' ')[0] }}</span>
                <div class="min-w-0">
                  <p class="text-xs font-black truncate">{{ act.titulo }}</p>
                  <p class="text-[10px] opacity-60 mt-0.5">
                    {{ nivelLabel[act.nivel] }} · {{ tipoLabel[act.tipo]?.split(' ').slice(1).join(' ') }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </template>
      </div>
    </aside>

    <!-- MAIN: Vista previa -->
    <main class="flex-1 overflow-y-auto">
      <div v-if="!selected" class="h-full flex items-center justify-center">
        <div class="text-center space-y-4">
          <div class="text-6xl">👈</div>
          <p class="text-xl font-black text-slate-700">Selecciona una pregunta</p>
          <p class="text-sm text-slate-400">Haz clic en cualquier actividad del panel izquierdo</p>
        </div>
      </div>

      <div v-else class="max-w-2xl mx-auto py-10 px-6 space-y-6">
        <!-- Header info -->
        <div class="bg-white rounded-3xl border border-slate-100 p-6 space-y-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 rounded-full">{{ faseLabel[selected.fase] }}</span>
            <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 rounded-full">Sub {{ selected.subPhase }}</span>
            <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full"
              :class="{ 'bg-green-100 text-green-600': selected.nivel === 'BASIC', 'bg-amber-100 text-amber-600': selected.nivel === 'INTERMEDIATE', 'bg-red-100 text-red-600': selected.nivel === 'ADVANCED' }">
              {{ nivelLabel[selected.nivel] }}
            </span>
            <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-violet-100 text-violet-600 rounded-full">{{ tipoLabel[selected.tipo] }}</span>
          </div>
          <h2 class="text-xl font-black text-black">{{ selected.titulo }}</h2>

          <!-- Clave -->
          <details>
            <summary class="text-xs font-bold text-slate-400 cursor-pointer hover:text-indigo-500 select-none">🔑 Ver respuesta correcta</summary>
            <pre class="mt-2 text-xs bg-slate-50 rounded-xl p-3 text-green-700 overflow-auto">{{ JSON.stringify(selected.claveRespuestas, null, 2) }}</pre>
          </details>

          <!-- Pista -->
          <div v-if="selected.contenido?.pista" class="bg-amber-50 rounded-2xl p-3">
            <p class="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">💡 Pista</p>
            <p class="text-xs text-amber-800">{{ selected.contenido.pista }}</p>
          </div>
        </div>

        <!-- COMPONENTE ACTIVIDAD — :key fuerza reinicio al cambiar de actividad -->
        <div class="bg-white rounded-3xl border border-slate-100 p-8">
          <FillInTheBlankActivity
            v-if="selected.tipo === 'FILL_IN_THE_BLANK'"
            :key="selected.id"
            :pregunta="selected.contenido?.pregunta"
            :plantilla="selected.contenido?.plantilla"
            :opciones="selected.contenido?.opciones || []"
            :state="fakeState"
            @update:answer="(v) => fakeAnswer = v"
          />
          <MultipleChoiceActivity
            v-else-if="selected.tipo === 'MULTIPLE_CHOICE_REASONED'"
            :key="selected.id"
            :contenido="selected.contenido"
            v-model="fakeAnswer"
          />
          <TextMarkupActivity
            v-else-if="selected.tipo === 'TEXT_MARKUP'"
            :key="selected.id"
            :contenido="selected.contenido"
            v-model="fakeAnswer"
          />
          <MatchingActivity
            v-else-if="selected.tipo === 'MATCHING'"
            :key="selected.id"
            :pregunta="selected.contenido?.pregunta"
            :pares="selected.contenido?.pares || []"
            :state="fakeState"
            @update:answer="(v) => fakeAnswer = v"
          />
          <ClassificationActivity
            v-else-if="selected.tipo === 'CLASSIFICATION'"
            :key="selected.id"
            :pregunta="selected.contenido?.pregunta"
            :columnas="selected.contenido?.columnas || []"
            :items="selected.contenido?.items || []"
            :state="fakeState"
            @update:answer="(v) => fakeAnswer = v"
          />
          <TrafficLightActivity
            v-else-if="selected.tipo === 'TRAFFIC_LIGHT'"
            :key="selected.id"
            :pregunta="selected.contenido?.pregunta"
            :fuentes="selected.contenido?.fuentes || []"
            :state="fakeState"
            @update:answer="(v) => fakeAnswer = v"
          />
          <SequenceOrderActivity
            v-else-if="selected.tipo === 'SEQUENCE_ORDER'"
            :key="selected.id"
            :pregunta="selected.contenido?.pregunta"
            :items="selected.contenido?.items || []"
            :state="fakeState"
            @update:answer="(v) => fakeAnswer = v"
          />
          <ArrowMatchingActivity
            v-else-if="selected.tipo === 'ARROW_MATCHING'"
            :key="selected.id"
            :pregunta="selected.contenido?.pregunta"
            :izquierda="selected.contenido?.izquierda || []"
            :derecha="selected.contenido?.derecha || []"
            :state="fakeState"
            @update:answer="(v) => fakeAnswer = v"
          />
          <DragAndDropActivity
            v-else-if="selected.tipo === 'DRAG_AND_DROP'"
            :key="selected.id"
            :contenido="selected.contenido"
            v-model="fakeAnswer"
          />
          <div v-else class="text-center py-6 text-slate-400">
            <p class="text-sm">Tipo <code>{{ selected.tipo }}</code> sin previsualización.</p>
          </div>
        </div>

        <!-- ══ FEEDBACK EN VIVO ══ -->
        <div class="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Feedback en vivo</p>
              <p class="text-xs text-slate-500 mt-0.5">Así respondería el sistema con tu selección actual</p>
            </div>
            <!-- Marcador -->
            <div v-if="liveScore" class="text-right">
              <p class="text-2xl font-black font-mono"
                :class="liveScore.pct >= 50 ? 'text-emerald-600' : 'text-red-500'">
                {{ liveScore.pct }}%
              </p>
              <p class="text-[9px] font-black uppercase text-slate-400">{{ liveScore.correct }}/{{ liveScore.total }} correctas</p>
            </div>
          </div>

          <div class="p-6 space-y-3">
            <!-- Sin respuesta aún -->
            <div v-if="!liveHasAnswer" class="text-center py-6 text-slate-300 text-sm italic">
              Interactúa con la actividad para ver el feedback en vivo...
            </div>

            <!-- Desglose por ítem -->
            <template v-else>
              <div
                v-for="item in liveBreakdown" :key="item.itemId"
                class="flex items-start gap-3 p-4 rounded-2xl border-2 transition-all"
                :class="item.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'"
              >
                <span class="text-xl flex-shrink-0 mt-0.5">{{ item.isCorrect ? '✅' : '❌' }}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-[10px] font-black text-slate-500 uppercase tracking-wide">{{ item.label }}</p>
                  <p class="text-sm font-bold mt-1" :class="item.isCorrect ? 'text-emerald-700' : 'text-red-700'">
                    {{ item.studentAnswer }}
                  </p>
                  <p v-if="!item.isCorrect" class="text-xs text-slate-500 mt-0.5">
                    Correcta: <span class="font-bold text-emerald-700">{{ item.correctAnswer }}</span>
                  </p>
                </div>
              </div>

              <!-- Veredicto global -->
              <div class="mt-4 pt-4 border-t border-slate-100">
                <div class="flex items-center gap-3 px-2 mb-4">
                  <span class="text-3xl">{{ liveScore && liveScore.pct >= 50 ? '🎉' : '💪' }}</span>
                  <div>
                    <p class="font-black text-black text-sm">
                      {{ liveScore && liveScore.pct >= 100 ? '¡Perfecto! Todo correcto.' :
                         liveScore && liveScore.pct >= 50 ? '¡Aprobado! Más de la mitad correctas.' :
                         'Menos de la mitad correctas. Se enviará a refuerzo.' }}
                    </p>
                    <p class="text-xs text-slate-400 mt-0.5">(Umbral de aprobación: ≥ 50%)</p>
                  </div>
                </div>

                <!-- Mensaje que daría el tutor Manuel -->
                <div v-if="liveFeedbackMessage" class="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-4">
                  <p class="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">💬 Mensaje del Tutor Manuel</p>
                  <p class="text-sm text-indigo-900 font-medium leading-relaxed italic">"{{ liveFeedbackMessage }}"</p>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Botón reiniciar -->
        <button
          @click="resetPreview"
          class="w-full py-4 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all"
        >
          🔄 Reiniciar pregunta
        </button>
      </div>
    </main>
  </div>
</template>
