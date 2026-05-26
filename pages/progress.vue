<script setup lang="ts">
import BadgeDisplay from '~/components/gamification/BadgeDisplay.vue'

definePageMeta({ layout: 'main' })

const { data: progressData, pending, error } = await useFetch('/api/student/progress')

const subPhaseLabels: Record<string, string> = {
  '1.1': 'Identificación de hechos relevantes',
  '1.2': 'Identificación de opciones y argumentos',
  '2.1': 'Credibilidad de las fuentes',
  '2.2': 'Lógica de argumentos',
  '3.1': 'Consideraciones propias',
  '3.2': 'Consideración de perspectivas',
}

const phases = computed(() => (progressData.value as any)?.phases || [])
const totalPoints = computed(() => (progressData.value as any)?.points || 0)
const currentStreak = computed(() => (progressData.value as any)?.streak || 0)
</script>

<template>
  <div class="w-full max-w-4xl mx-auto py-6">

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-black text-black mb-1">Mapa de Aprendizaje</h1>
      <p class="text-black/60 font-medium text-sm">Visualiza tu avance en el camino del pensamiento crítico.</p>
    </div>

    <!-- Mini stats -->
    <div class="flex gap-3 mb-8 flex-wrap">
      <div class="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm">
        <span class="text-2xl">⭐</span>
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-indigo-600">Puntos</p>
          <p class="text-xl font-black text-black leading-none">{{ totalPoints }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm">
        <span class="text-2xl">🔥</span>
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-orange-500">Racha</p>
          <p class="text-xl font-black text-black leading-none">{{ currentStreak }} días</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-20">
      <div class="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-orange-50 border-2 border-orange-200 rounded-3xl p-8 text-center">
      <p class="text-orange-800 font-bold">No se pudo cargar tu progreso.</p>
    </div>

    <!-- Fases -->
    <div v-else class="space-y-5">
      <div
        v-for="(phase, phaseIdx) in phases"
        :key="phase.code"
        class="bg-white rounded-3xl shadow-sm"
      >
        <!-- Cabecera fase -->
        <div class="px-7 pt-6 pb-5 border-b border-slate-100">
          <div class="flex items-start gap-4">
            <!-- Ícono -->
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 mt-0.5"
              :class="{
                'bg-emerald-100': phase.status === 'Completado',
                'bg-indigo-100': phase.status === 'En curso',
                'bg-slate-100': phase.status === 'Bloqueado' || phase.status === 'Pendiente',
              }"
            >{{ phase.icon }}</div>

            <div class="flex-1">
              <!-- Título + badge en misma fila -->
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h2 class="font-black text-black text-lg leading-tight">{{ phase.name }}</h2>
                <span
                  class="text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg shrink-0"
                  :class="{
                    'bg-emerald-100 text-emerald-700': phase.status === 'Completado',
                    'bg-indigo-100 text-indigo-700': phase.status === 'En curso',
                    'bg-slate-100 text-slate-500': phase.status === 'Bloqueado' || phase.status === 'Pendiente',
                  }"
                >
                  {{ phase.status === 'Completado' ? '✅ Completado' : phase.status === 'En curso' ? '🔓 En Curso' : '🔒 Bloqueado' }}
                </span>
              </div>

              <!-- Barra progreso fase -->
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-slate-100 rounded-full">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="phase.status === 'Completado' ? 'bg-emerald-500' : 'bg-indigo-500'"
                    :style="{ width: `${phase.progress}%` }"
                  ></div>
                </div>
                <span class="text-xs font-black text-black/50 w-10 text-right shrink-0">{{ phase.progress }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Subfases -->
        <div class="px-7 py-5 space-y-6">
          <div
            v-for="(sp, spIdx) in phase.subPhases"
            :key="sp.code"
            :class="sp.status === 'Bloqueado' ? 'opacity-40' : ''"
          >
            <!-- Fila: bullet + nombre + badge + botón -->
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <!-- Bullet -->
              <div
                class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0"
                :class="{
                  'bg-emerald-500 border-emerald-500 text-white': sp.status === 'Completado',
                  'bg-indigo-500 border-indigo-500 text-white': sp.status === 'En curso',
                  'bg-white border-slate-200 text-slate-400': sp.status === 'Pendiente' || sp.status === 'Bloqueado',
                }"
              >
                <span v-if="sp.status === 'Completado'">✓</span>
                <span v-else-if="sp.status === 'En curso'">▶</span>
                <span v-else class="text-[9px]">{{ sp.code }}</span>
              </div>

              <!-- Nombre subfase -->
              <p class="font-bold text-sm text-black leading-tight flex-1 min-w-0">
                {{ subPhaseLabels[sp.code] || sp.name }}
              </p>

              <!-- Badge estado -->
              <span
                class="text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-md shrink-0"
                :class="{
                  'bg-emerald-100 text-emerald-700': sp.status === 'Completado',
                  'bg-indigo-100 text-indigo-700': sp.status === 'En curso',
                  'bg-slate-100 text-slate-400': sp.status === 'Pendiente' || sp.status === 'Bloqueado',
                }"
              >
                {{ sp.status === 'Completado' ? '✅ Completada' : sp.status === 'En curso' ? '🔓 Activa' : sp.status === 'Pendiente' ? 'Pendiente' : '🔒' }}
              </span>

              <!-- Botón continuar (solo subfase activa) -->
              <NuxtLink
                v-if="sp.status === 'En curso'"
                :to="`/learn/${(progressData as any)?.nivelActual?.code?.toLowerCase() || 'basic'}/${phase.code.toLowerCase()}`"
                class="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 shadow-md shadow-indigo-600/20 whitespace-nowrap"
              >
                Continuar →
              </NuxtLink>
            </div>

            <!-- Pastillitas de actividades -->
            <div class="flex items-center gap-1.5 mb-2 pl-10">
              <div
                v-for="i in sp.total"
                :key="i"
                class="h-2 w-full rounded-full transition-all duration-500 max-w-[40px]"
                :class="i <= sp.completed
                  ? (sp.status === 'Completado' ? 'bg-emerald-500' : 'bg-indigo-500')
                  : 'bg-slate-200'"
              ></div>
              <span class="ml-2 text-[10px] font-bold text-black/40 whitespace-nowrap shrink-0">
                {{ sp.completed }}/{{ sp.total }} actividades
              </span>
            </div>

            <!-- Barra de progreso de subfase -->
            <div class="flex items-center gap-3 pl-10">
              <div class="flex-1 h-1.5 bg-slate-100 rounded-full">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="sp.status === 'Completado' ? 'bg-emerald-400' : 'bg-indigo-400'"
                  :style="{ width: `${sp.progress}%` }"
                ></div>
              </div>
              <span class="text-[10px] font-black text-black/40 shrink-0 w-9 text-right">{{ sp.progress }}%</span>
            </div>

            <!-- Separador entre subfases -->
            <div v-if="spIdx < phase.subPhases.length - 1" class="border-t border-slate-100 mt-5"></div>
          </div>
        </div>

      </div>

      <!-- Insignias -->
      <div class="bg-white rounded-3xl shadow-sm p-7">
        <h2 class="font-black text-black text-base uppercase tracking-widest mb-4">Vitrina de Logros</h2>
        <BadgeDisplay />
      </div>

    </div>
  </div>
</template>
