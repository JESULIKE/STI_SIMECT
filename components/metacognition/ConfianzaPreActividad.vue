<template>
  <div class="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-surface-900">
      Antes de comenzar
    </h3>
    <p class="mb-4 text-sm text-surface-600">
      ¿Qué tan seguro te sientes de poder resolver esta actividad correctamente?
    </p>

    <div class="flex items-center gap-2">
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        class="group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        :class="[
          hoverValue >= star ? 'text-accent-500 scale-110' :
          modelValue >= star ? 'text-accent-500' : 'text-surface-300'
        ]"
        @mouseenter="hoverValue = star"
        @mouseleave="hoverValue = 0"
        @click="selectValue(star)"
        :aria-label="`Calificar con ${star} estrellas`"
      >
        <svg class="h-8 w-8 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </button>
    </div>

    <div class="mt-3 h-5 text-sm font-medium" :class="modelValue > 0 ? 'text-primary-700' : 'text-transparent'">
      {{ labels[hoverValue > 0 ? hoverValue - 1 : modelValue - 1] || 'Selecciona una opción' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const hoverValue = ref(0)

const labels = [
  'Muy inseguro',
  'Inseguro',
  'Neutro',
  'Seguro',
  'Muy seguro'
]

const selectValue = (val: number) => {
  emit('update:modelValue', val)
}
</script>
