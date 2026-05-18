<script setup lang="ts">
import { useKitStore } from '~/stores/kit'
import type { FallacyKey } from '~/stores/kit'

const kit = useKitStore()
onMounted(() => kit.load())

const newFact = reactive({ text: '', source: '', data: '', phase: 'F1' as 'F1' | 'F2' | 'F3' })
const addFact = () => {
  if (!newFact.text.trim()) return
  kit.addFact({ ...newFact })
  newFact.text = ''; newFact.source = ''; newFact.data = ''
}

const metaPhase = ref<'f1' | 'f2' | 'f3'>('f1')
const metaConfig = {
  f1: { label: 'Fase 1 · Análisis', color: '#3b82f6' },
  f2: { label: 'Fase 2 · Evaluación', color: '#8b5cf6' },
  f3: { label: 'Fase 3 · Juicios', color: '#f59e0b' },
}

const fallacies: Array<{ key: keyof FallacyKey; name: string; desc: string; icon: string }> = [
  { key: 'generalizacion', name: 'Generalización apresurada', desc: '"Siempre", "todos" sin evidencia suficiente', icon: '🔄' },
  { key: 'adHominem', name: 'Ataque personal', desc: 'Atacar a la persona, no al argumento', icon: '🎯' },
  { key: 'pendiente', name: 'Pendiente resbaladiza', desc: 'Consecuencias extremas sin justificación', icon: '📉' },
  { key: 'falsaCausa', name: 'Falsa causa (post hoc)', desc: 'B después de A, por tanto A causó B', icon: '🔗' },
  { key: 'apelacionEmocion', name: 'Apelación a la emoción', desc: 'Emoción sustituye al razonamiento lógico', icon: '💔' },
  { key: 'hombresPaja', name: 'Hombre de paja', desc: 'Distorsionar el argumento ajeno', icon: '🌾' },
]

const skillLabels: Record<string, string> = {
  f1_facts: 'F1 — Identifiqué hechos verificables',
  f1_arguments: 'F1 — Analicé argumentos multiperspectiva',
  f2_credibility: 'F2 — Evalué credibilidad con criterios CRAAP',
  f2_fallacies: 'F2 — Detecté falacias lógicas',
  f2_toulmin: 'F2 — Construí un argumento Toulmin',
  f3_judgment: 'F3 — Formulé un juicio con evidencia',
  f3_perspectives: 'F3 — Consideré perspectivas con imparcialidad',
  meta_cycles: 'Meta — Completé ciclos P→M→C en 3 fases',
  meta_growth: 'Meta — Mi pensamiento evolucionó desde F1',
}

const tabs = [
  { id: 'notebook' as const, label: 'Cuaderno', icon: '📓' },
  { id: 'meta' as const, label: 'Diario', icon: '🧠' },
  { id: 'fallacies' as const, label: 'Falacias', icon: '⚠️' },
  { id: 'judgment' as const, label: 'Juicio', icon: '⚡' },
  { id: 'progress' as const, label: 'Progreso', icon: '📊' },
]

const ringCirc = 2 * Math.PI * 26
const ringDash = computed(() => `${(kit.overallProgress / 100) * ringCirc} ${ringCirc}`)
const totalBadge = computed(() => kit.factsCount + kit.fallaciesCount)
</script>

<template>
  <!-- OVERLAY -->
  <Transition name="kit-fade">
    <div v-if="kit.isOpen" class="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40" @click="kit.close()" />
  </Transition>

  <!-- PANEL -->
  <Transition name="kit-slide">
    <aside
      v-if="kit.isOpen"
      class="fixed top-0 right-0 h-full w-full max-w-[360px] z-50 flex flex-col"
      style="background: #f0f7ff; box-shadow: -8px 0 40px rgba(100,150,220,0.18)"
    >
      <!-- ── HEADER ── -->
      <div class="flex items-center gap-3 px-5 py-4 bg-white border-b-2 border-blue-100 shrink-0">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md shrink-0"
          style="background: linear-gradient(135deg, #D7EEFA, #b3d9f5)">🧰</div>
        <div class="flex-1">
          <h2 class="text-sm font-black text-slate-800 tracking-tight uppercase">Kit de Herramientas</h2>
          <p class="text-[10px] text-slate-400">Memoria persistente entre fases</p>
        </div>

        <!-- Progress ring -->
        <div class="relative w-11 h-11 shrink-0">
          <svg class="w-11 h-11 -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#e0ecf8" stroke-width="4"/>
            <circle cx="30" cy="30" r="26" fill="none" stroke="#3b82f6" stroke-width="4"
              stroke-linecap="round" :stroke-dasharray="ringDash"
              style="transition: stroke-dasharray .6s ease"/>
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-600">
            {{ kit.overallProgress }}%
          </span>
        </div>

        <button @click="kit.close()"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-blue-50 transition-all text-sm shrink-0">
          ✕
        </button>
      </div>

      <!-- ── TABS ── -->
      <div class="grid grid-cols-5 gap-1 px-3 pt-3 pb-2 bg-white border-b border-blue-100 shrink-0">
        <button
          v-for="tab in tabs" :key="tab.id"
          @click="kit.setTab(tab.id)"
          :class="[
            'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all duration-200',
            kit.activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600'
          ]"
        >
          <span class="text-base leading-none">{{ tab.icon }}</span>
          <span class="leading-none text-center">{{ tab.label }}</span>
        </button>
      </div>

      <!-- ── BODY ── -->
      <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3" style="scrollbar-width:thin; scrollbar-color: #b3d9f5 transparent">

        <!-- ═══ CUADERNO ═══ -->
        <template v-if="kit.activeTab === 'notebook'">
          <div class="rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3 flex gap-2.5 items-start">
            <span class="text-lg shrink-0">📦</span>
            <p class="text-[11px] text-blue-700 leading-relaxed">Los hechos guardados aquí se <strong>cargan automáticamente</strong> como banco de evidencias en Fase 3.</p>
          </div>

          <!-- List -->
          <div class="space-y-2">
            <TransitionGroup name="fact-list">
              <div v-for="fact in kit.facts" :key="fact.id"
                class="group flex items-start gap-2.5 p-3.5 rounded-2xl bg-white border-2 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <span :class="[
                  'shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black mt-0.5',
                  fact.phase==='F1' ? 'bg-blue-100 text-blue-600' :
                  fact.phase==='F2' ? 'bg-violet-100 text-violet-600' : 'bg-amber-100 text-amber-600'
                ]">{{ fact.phase }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] text-slate-700 leading-snug line-clamp-2 font-medium">{{ fact.text }}</p>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span v-if="fact.source" class="text-[10px] text-slate-400">📚 {{ fact.source }}</span>
                    <span v-if="fact.data" class="text-[10px] font-black text-blue-600 ml-auto">{{ fact.data }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="kit.toggleStar(fact.id)"
                    :class="['text-base leading-none transition-colors', fact.starred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400']">★</button>
                  <button @click="kit.deleteFact(fact.id)"
                    class="text-xs text-slate-300 hover:text-red-400 transition-colors leading-none">✕</button>
                </div>
              </div>
            </TransitionGroup>
            <div v-if="kit.facts.length === 0"
              class="text-center py-8 rounded-2xl border-2 border-dashed border-blue-200">
              <p class="text-2xl mb-2">📝</p>
              <p class="text-[12px] text-slate-400">Aún no hay hechos registrados</p>
            </div>
          </div>

          <!-- Add form -->
          <div class="rounded-2xl bg-white border-2 border-blue-100 p-4 space-y-3">
            <p class="text-[10px] font-black text-blue-700 uppercase tracking-widest">Añadir hecho verificado</p>
            <textarea v-model="newFact.text" rows="2" placeholder="Describe el hecho con datos concretos..."
              class="w-full px-3 py-2.5 rounded-xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none resize-none transition-colors" />
            <div class="flex gap-2">
              <input v-model="newFact.source" placeholder="Fuente"
                class="flex-1 px-3 py-2 rounded-xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 text-[11px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors"/>
              <input v-model="newFact.data" placeholder="Dato clave"
                class="w-24 px-3 py-2 rounded-xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 text-[11px] text-slate-700 placeholder:text-slate-400 outline-none transition-colors"/>
              <select v-model="newFact.phase"
                class="px-2 py-2 rounded-xl bg-blue-50 border-2 border-blue-100 text-[11px] text-slate-700 outline-none">
                <option value="F1">F1</option>
                <option value="F2">F2</option>
                <option value="F3">F3</option>
              </select>
            </div>
            <button @click="addFact" :disabled="!newFact.text.trim()"
              class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-md shadow-blue-200">
              + Guardar hecho
            </button>
          </div>
        </template>

        <!-- ═══ DIARIO METACOGNITIVO ═══ -->
        <template v-if="kit.activeTab === 'meta'">
          <div class="flex gap-2">
            <button v-for="ph in (['f1','f2','f3'] as const)" :key="ph" @click="metaPhase = ph"
              :class="['flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200',
                metaPhase === ph
                  ? ph==='f1' ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : ph==='f2' ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white border-2 border-blue-100 text-slate-400 hover:border-blue-300'
              ]">
              {{ ph.toUpperCase() }}
            </button>
          </div>

          <div class="rounded-2xl bg-white border-2 border-blue-100 px-4 py-3 flex items-center gap-2">
            <div class="w-2 h-8 rounded-full shrink-0" :style="{ background: metaConfig[metaPhase].color }"/>
            <p class="text-[11px] font-black text-slate-600 uppercase tracking-wider">{{ metaConfig[metaPhase].label }}</p>
          </div>

          <div v-for="({ field, label, icon, accent }) in [
            { field: 'planning' as const, label: 'Planeación', icon: '🗺️', accent: '#3b82f6' },
            { field: 'monitoring' as const, label: 'Monitoreo', icon: '🛑', accent: '#f59e0b' },
            { field: 'control' as const, label: 'Control', icon: '🧠', accent: '#8b5cf6' },
          ]" :key="field" class="rounded-2xl bg-white border-2 border-blue-100 p-4 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-base">{{ icon }}</span>
              <span class="text-[10px] font-black uppercase tracking-wider" :style="{ color: accent }">{{ label }}</span>
              <span class="ml-auto text-[10px] font-bold" :class="kit.meta[metaPhase][field].trim().split(/\s+/).filter(Boolean).length >= 5 ? 'text-emerald-500' : 'text-slate-300'">
                {{ kit.meta[metaPhase][field].trim().split(/\s+/).filter(Boolean).length }} pal.
                {{ kit.meta[metaPhase][field].trim().split(/\s+/).filter(Boolean).length >= 5 ? '✓' : '' }}
              </span>
            </div>
            <textarea :value="kit.meta[metaPhase][field]"
              @input="kit.updateMeta(metaPhase, field, ($event.target as HTMLTextAreaElement).value)"
              rows="3" :placeholder="`Tu reflexión de ${label.toLowerCase()}...`"
              class="w-full px-3 py-2.5 rounded-xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-colors"/>
          </div>
        </template>

        <!-- ═══ FALACIAS ═══ -->
        <template v-if="kit.activeTab === 'fallacies'">
          <div class="rounded-2xl bg-rose-50 border-2 border-rose-200 px-4 py-3 flex items-center justify-between">
            <p class="text-[11px] text-rose-600 font-medium">Marca las falacias detectadas en los textos</p>
            <span class="font-black text-lg text-rose-600">{{ kit.fallaciesCount }}</span>
          </div>

          <div class="space-y-2">
            <button v-for="f in fallacies" :key="f.key" @click="kit.toggleFallacy(f.key)"
              :class="['w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]',
                kit.fallacies[f.key]
                  ? 'bg-rose-50 border-rose-300 shadow-sm shadow-rose-100'
                  : 'bg-white border-blue-100 hover:border-blue-300'
              ]">
              <div :class="['w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center text-[11px] font-black transition-all',
                kit.fallacies[f.key] ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300']">
                {{ kit.fallacies[f.key] ? '✓' : '' }}
              </div>
              <span class="text-xl shrink-0">{{ f.icon }}</span>
              <div>
                <p class="text-[12px] font-bold" :class="kit.fallacies[f.key] ? 'text-rose-700' : 'text-slate-700'">{{ f.name }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">{{ f.desc }}</p>
              </div>
            </button>
          </div>
        </template>

        <!-- ═══ JUICIO ═══ -->
        <template v-if="kit.activeTab === 'judgment'">
          <div class="rounded-2xl bg-amber-50 border-2 border-amber-200 px-4 py-3 flex gap-2.5 items-start">
            <span class="text-lg shrink-0">⚡</span>
            <p class="text-[11px] text-amber-700 leading-relaxed">Borrador libre — ensaya y afina antes de los marcos estructurados de Fase 3.</p>
          </div>

          <div v-for="({ field, label, placeholder, accent, rows }) in [
            { field: 'position' as const, label: 'Mi posición', placeholder: 'Considero que la respuesta fue...', accent: '#f59e0b', rows: 2 },
            { field: 'evidence' as const, label: 'Mis evidencias más fuertes', placeholder: '1. …\n2. …\n3. …', accent: '#3b82f6', rows: 3 },
            { field: 'counterpoint' as const, label: 'Reconozco del otro lado', placeholder: 'Sin embargo, también es cierto que...', accent: '#8b5cf6', rows: 2 },
            { field: 'implications' as const, label: 'Implicaciones', placeholder: 'Esto implica que...', accent: '#10b981', rows: 2 },
          ]" :key="field" class="rounded-2xl bg-white border-2 border-blue-100 p-4 space-y-2">
            <label class="text-[10px] font-black uppercase tracking-wider" :style="{ color: accent }">{{ label }}</label>
            <textarea :value="kit.judgment[field]"
              @input="kit.updateJudgment(field, ($event.target as HTMLTextAreaElement).value)"
              :rows="rows" :placeholder="placeholder"
              class="w-full px-3 py-2.5 rounded-xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-colors"/>
          </div>

          <!-- Live preview -->
          <Transition name="kit-fade">
            <div v-if="kit.judgmentPreview" class="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 shadow-sm shadow-amber-100">
              <p class="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">🔍 Vista previa integrada</p>
              <p class="text-[12px] text-slate-700 leading-relaxed italic">{{ kit.judgmentPreview }}</p>
            </div>
          </Transition>
        </template>

        <!-- ═══ PROGRESO ═══ -->
        <template v-if="kit.activeTab === 'progress'">
          <!-- Stats -->
          <div class="grid grid-cols-2 gap-3">
            <div v-for="({ label, value, emoji, bg, text }) in [
              { label: 'Hechos', value: kit.factsCount, emoji: '📓', bg: 'bg-blue-50', text: 'text-blue-600' },
              { label: 'Falacias', value: kit.fallaciesCount, emoji: '⚠️', bg: 'bg-rose-50', text: 'text-rose-600' },
              { label: 'Meta.', value: `${kit.metaEntriesCount}/9`, emoji: '🧠', bg: 'bg-violet-50', text: 'text-violet-600' },
              { label: 'Habilidades', value: `${kit.skillsCount}/${kit.totalSkills}`, emoji: '📊', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            ]" :key="label"
              :class="['rounded-2xl border-2 border-blue-100 p-4 text-center', bg]">
              <p class="text-2xl mb-1">{{ emoji }}</p>
              <p :class="['text-2xl font-black font-mono', text]">{{ value }}</p>
              <p class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{{ label }}</p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="rounded-2xl bg-white border-2 border-blue-100 p-5 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progreso general del ciclo</span>
              <span class="text-lg font-black text-blue-600">{{ kit.overallProgress }}%</span>
            </div>
            <div class="h-3 rounded-full bg-blue-50 border border-blue-100 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                style="background: linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981)"
                :style="{ width: kit.overallProgress + '%' }"/>
            </div>
            <div class="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Inicio</span><span>Meta</span>
            </div>
          </div>

          <!-- Skills checklist -->
          <div class="rounded-2xl bg-white border-2 border-blue-100 p-4 space-y-2.5">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Habilidades de Pensamiento Crítico</p>
            <label v-for="(label, key) in skillLabels" :key="key"
              class="flex items-start gap-3 cursor-pointer group py-1.5 border-b border-blue-50 last:border-0">
              <div @click="kit.toggleSkill(key)"
                :class="['w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-black cursor-pointer transition-all',
                  kit.skills[key] ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 group-hover:border-blue-400']">
                {{ kit.skills[key] ? '✓' : '' }}
              </div>
              <span class="text-[11px] leading-snug transition-colors"
                :class="kit.skills[key] ? 'text-blue-700 font-bold' : 'text-slate-500'">{{ label }}</span>
            </label>
          </div>

          <!-- Closing note -->
          <div class="rounded-2xl bg-white border-2 border-blue-100 p-4 space-y-2">
            <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reflexión final de cierre</label>
            <textarea :value="kit.closingNote"
              @input="kit.updateClosingNote(($event.target as HTMLTextAreaElement).value)"
              rows="3" placeholder="Si le explicara a un compañero lo que aprendí en este ciclo..."
              class="w-full px-3 py-2.5 rounded-xl bg-blue-50 border-2 border-blue-100 focus:border-blue-400 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-colors"/>
          </div>

          <button @click="kit.reset()"
            class="w-full py-3 rounded-2xl bg-white border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-[11px] font-bold text-red-400 hover:text-red-600 transition-all uppercase tracking-widest">
            🗑️ Reiniciar Kit completo
          </button>
        </template>

      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.kit-fade-enter-active, .kit-fade-leave-active { transition: opacity .22s ease }
.kit-fade-enter-from, .kit-fade-leave-to { opacity: 0 }
.kit-slide-enter-active, .kit-slide-leave-active { transition: transform .3s cubic-bezier(.4,0,.2,1) }
.kit-slide-enter-from, .kit-slide-leave-to { transform: translateX(100%) }

.fact-list-enter-active { animation: factIn .25s ease }
.fact-list-leave-active { animation: factIn .2s ease reverse }
@keyframes factIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }

::-webkit-scrollbar { width: 4px }
::-webkit-scrollbar-track { background: transparent }
::-webkit-scrollbar-thumb { background: #b3d9f5; border-radius: 2px }
</style>
