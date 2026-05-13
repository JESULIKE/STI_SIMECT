<script setup lang="ts">
const props = defineProps<{
  points: number
  show: boolean
}>()

const emit = defineEmits(['complete'])

const visible = ref(false)

watch(() => props.show, (newVal) => {
  if (newVal) {
    visible.value = true
    setTimeout(() => {
      visible.value = false
      emit('complete')
    }, 2000)
  }
})
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible"
      class="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
    >
      <div class="animate-float-and-fly text-6xl font-black text-indigo-500 italic tracking-tighter drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]">
        +{{ points }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.animate-float-and-fly {
  animation: float-and-fly 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes float-and-fly {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(50px);
  }
  20% {
    opacity: 1;
    transform: scale(1.2) translateY(0);
  }
  40% {
    opacity: 1;
    transform: scale(1) translateY(-20px);
  }
  100% {
    opacity: 0;
    transform: scale(0.2) translateY(-100vh) translateX(100vw); /* Hacia la esquina superior derecha */
  }
}
</style>
