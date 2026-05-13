<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ badgeId: string }>()
const visible = ref(true)

const close = () => {
  visible.value = false
}

// Ocultar automáticamente después de 5 segundos
onMounted(() => {
  setTimeout(close, 5000)
})
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-y-2 translate-x-4 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="transform opacity-100 translate-y-0 translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 translate-y-2"
  >
    <div v-if="visible" class="fixed bottom-6 right-6 z-[200] max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-yellow-400/50">
      <div class="p-4 w-full">
        <div class="flex items-start">
          <div class="flex-shrink-0 pt-0.5">
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              🏅
            </div>
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-bold text-black">
              ¡Nueva Insignia Desbloqueada!
            </p>
            <p class="mt-1 text-sm text-slate-800 font-medium">
              {{ badgeId.replace(/_/g, ' ').toUpperCase() }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button @click="close" class="bg-white rounded-md inline-flex text-black hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span class="sr-only">Cerrar</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
