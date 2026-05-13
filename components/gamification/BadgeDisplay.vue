<script setup lang="ts">
import { useStudentStore } from '../../stores/student'

const studentStore = useStudentStore()

// Mapeo básico de IDs de badges a emojis/iconos para la demo
const getBadgeIcon = (id: string) => {
  const map: Record<string, string> = {
    'first_perfect': '🏆',
    'speed_demon': '⚡',
    'deep_thinker': '🧠',
    'three_streak': '🔥'
  }
  return map[id] || '🏅'
}
</script>

<template>
  <div class="flex flex-col">
    <span class="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Insignias Obtenidas</span>
    <div class="flex flex-wrap gap-2">
      <div v-if="studentStore.progress.earnedBadges.length === 0" class="text-sm text-black italic">
        Aún no tienes insignias
      </div>
      
      <div 
        v-for="badge in studentStore.progress.earnedBadges" 
        :key="badge"
        class="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-400 shadow-sm hover:shadow-md hover:shadow-yellow-400/50 hover:scale-110 transition-all cursor-pointer"
      >
        <span class="text-xl drop-shadow-sm">{{ getBadgeIcon(badge) }}</span>
        
        <!-- Tooltip -->
        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
          {{ badge }}
        </div>
      </div>
    </div>
  </div>
</template>
