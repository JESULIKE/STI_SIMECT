<script setup lang="ts">
import { computed } from 'vue'
import { useStudentStore } from '../../stores/student'

const studentStore = useStudentStore()

// Estos valores deberían venir de consultas reales a la BD sobre cuántas actvidades hay por fase/nivel.
// Para la demo, usamos un porcentaje mock.
const phaseProgressPercentage = computed(() => 65) 
const levelProgressPercentage = computed(() => 30)

const phaseName = computed(() => studentStore.progress.phase)
</script>

<template>
  <div class="flex flex-col gap-3 w-full max-w-md">
    <!-- Nivel -->
    <div>
      <div class="flex justify-between items-end mb-1">
        <span class="text-xs font-bold text-indigo-700">Nivel {{ studentStore.currentLevelLabel }}</span>
        <span class="text-[10px] font-semibold text-slate-800">{{ levelProgressPercentage }}%</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div class="bg-indigo-600 h-1.5 rounded-full" :style="{ width: `${levelProgressPercentage}%` }"></div>
      </div>
    </div>

    <!-- Fase -->
    <div>
      <div class="flex justify-between items-end mb-1">
        <span class="text-xs font-bold text-emerald-700">Fase: {{ phaseName }}</span>
        <span class="text-[10px] font-semibold text-slate-800">{{ phaseProgressPercentage }}%</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" :style="{ width: `${phaseProgressPercentage}%` }"></div>
      </div>
    </div>
  </div>
</template>
