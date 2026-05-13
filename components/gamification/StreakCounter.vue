<script setup lang="ts">
import { computed } from 'vue'
import { useStudentStore } from '../../stores/student'

const studentStore = useStudentStore()

const streakDays = computed(() => studentStore.progress.currentStreak)

const flameClass = computed(() => {
  if (streakDays.value >= 7) return 'text-orange-600 animate-pulse drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]'
  if (streakDays.value >= 3) return 'text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]'
  if (streakDays.value > 0) return 'text-amber-500'
  return 'text-slate-300 grayscale'
})
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      :class="flameClass"
      class="transition-all duration-300"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 2.4 6a5.2 5.2 0 01-8.3 3.9 5.2 5.2 0 01-1.6-4.9z"/>
    </svg>
    <div class="flex flex-col leading-none">
      <span class="text-xs font-bold text-slate-800">{{ streakDays }} Días</span>
      <span class="text-[10px] text-slate-800 uppercase font-semibold tracking-wider">Racha</span>
    </div>
  </div>
</template>
