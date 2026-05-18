<script setup lang="ts">
const props = defineProps<{
  badges: Array<{
    id: string
    nombre: string
    descripcion: string
    icono: string
  }>
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <span class="text-xs font-black uppercase tracking-[0.3em] text-black">Mis Insignias</span>

    <div v-if="!badges || badges.length === 0" class="flex flex-col items-center py-6 text-center">
      <span class="text-4xl mb-2">🏅</span>
      <p class="text-xs font-bold text-slate-500 italic">Tus insignias aparecerán aquí al ganarlas</p>
    </div>

    <div v-else class="flex flex-wrap gap-3">
      <div
        v-for="badge in badges"
        :key="badge.id"
        class="group relative flex flex-col items-center gap-1 cursor-pointer"
      >
        <div class="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-400 shadow-sm hover:shadow-md hover:shadow-yellow-400/50 hover:scale-110 transition-all">
          <span class="text-2xl drop-shadow-sm select-none">{{ badge.icono }}</span>
        </div>
        <span class="text-[8px] font-black text-black uppercase tracking-tight text-center leading-tight max-w-[56px]">{{ badge.nombre }}</span>

        <!-- Tooltip al hover -->
        <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 px-3 py-2 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 leading-relaxed shadow-xl">
          <p class="font-black mb-0.5">{{ badge.nombre }}</p>
          <p class="opacity-80">{{ badge.descripcion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

