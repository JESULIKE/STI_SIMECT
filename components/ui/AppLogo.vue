<template>
  <div class="flex items-center gap-2.5">
    <!-- Logo Imagen -->
    <div
      class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100"
      aria-hidden="true"
    >
      <img src="/Logo.png" alt="SIMECT Logo" class="w-full h-full object-cover" />
    </div>

    <!-- Nombre -->
    <div v-if="!compact" class="leading-tight">
      <span class="block text-sm font-black italic tracking-tighter text-black">
        Tutor
      </span>
      <span class="block text-[10px] font-black uppercase tracking-widest text-indigo-500">
        SIMECT
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>
