<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  contenido: {
    tema: string
    instrucciones: string
    conectoresSugeridos: string[]
  }
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

const argument = ref({
  premisa: '',
  evidencia: '',
  conclusion: ''
})

// Conectores lógicos requeridos para el pensamiento crítico (Sección 6.4.3)
const logicConnectors = ['porque', 'por lo tanto', 'como consecuencia', 'debido a', 'ya que', 'en conclusión']

const stats = computed(() => {
  const text = `${argument.value.premisa} ${argument.value.evidencia} ${argument.value.conclusion}`
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const foundConnectors = logicConnectors.filter(c => text.toLowerCase().includes(c))
  
  return {
    wordCount: words.length,
    connectorsFound: foundConnectors
  }
})

watch(argument, (newVal) => {
  emit('update:modelValue', { ...newVal, stats: stats.value })
}, { deep: true })
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-700">
    <div class="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 text-center">
      <p class="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Fase 3: Formulación de Juicios</p>
      <h4 class="text-xl font-black text-black italic">{{ contenido.tema }}</h4>
    </div>

    <!-- Guía interactiva -->
    <div class="bg-amber-100 border-2 border-amber-300 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
      <span class="text-3xl animate-bounce">💡</span>
      <div>
        <p class="text-sm font-black uppercase tracking-widest text-amber-900">Guía de interacción</p>
        <p class="text-base font-bold text-amber-800 mt-1 leading-relaxed">
          Escribe tu argumento dividiéndolo en 3 secciones: Premisa, Evidencia y Conclusión. Para aumentar la solidez de tu razonamiento, asegúrate de escribir al menos 40 palabras en total e incluir al menos 1 o más conectores lógicos de los sugeridos en la barra gris inferior (por ejemplo, "porque", "por lo tanto", "ya que").
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-8">
      <!-- Campo 1: Premisa -->
      <div class="space-y-3">
        <label class="flex justify-between items-center px-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-black">01. Premisa (¿Qué afirmas?)</span>
          <span class="text-[10px] font-mono text-slate-300">{{ argument.premisa.length }}/100</span>
        </label>
        <textarea
          v-model="argument.premisa"
          rows="2"
          class="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 text-black focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
          placeholder="Escribe tu afirmación principal aquí..."
        />
      </div>

      <!-- Campo 2: Evidencia -->
      <div class="space-y-3">
        <label class="flex justify-between items-center px-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-black">02. Evidencia (¿Con qué lo sustentas?)</span>
          <span class="text-[10px] font-mono text-slate-300">{{ argument.evidencia.length }}/200</span>
        </label>
        <textarea
          v-model="argument.evidencia"
          rows="3"
          class="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 text-black focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
          placeholder="Cita datos o hechos específicos del nivel..."
        />
      </div>

      <!-- Campo 3: Conclusión -->
      <div class="space-y-3">
        <label class="flex justify-between items-center px-2">
          <span class="text-[10px] font-black uppercase tracking-widest text-black">03. Conclusión (¿A qué llegas?)</span>
          <span class="text-[10px] font-mono text-slate-300">{{ argument.conclusion.length }}/150</span>
        </label>
        <textarea
          v-model="argument.conclusion"
          rows="2"
          class="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 text-black focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
          placeholder="Concluye tu argumento con coherencia lógica..."
        />
      </div>
    </div>

    <!-- Indicadores de Calidad en Tiempo Real (Sección 6.4.3) -->
    <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex gap-4">
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase text-black">Palabras</span>
            <span class="text-xl font-black" :class="stats.wordCount >= 40 ? 'text-emerald-500' : 'text-slate-300'">{{ stats.wordCount }} <small class="text-[10px] opacity-50">mín 40</small></span>
          </div>
          <div class="w-px h-10 bg-slate-200"></div>
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase text-black">Conectores</span>
            <div class="flex gap-1 mt-1">
              <div v-for="i in 3" :key="i" class="w-4 h-1.5 rounded-full transition-colors" :class="stats.connectorsFound.length >= i ? 'bg-indigo-500' : 'bg-slate-200'"></div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2 max-w-md justify-end">
          <span v-for="conn in logicConnectors" :key="conn" 
                class="px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all"
                :class="stats.connectorsFound.includes(conn) ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-black opacity-50'">
            {{ conn }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
