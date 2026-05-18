<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  badge: {
    id: string
    nombre: string
    descripcion: string
    icono: string
  }
}>()

const emit = defineEmits(['close'])
const visible = ref(false)
const closing = ref(false)

const close = () => {
  closing.value = true
  setTimeout(() => {
    visible.value = false
    emit('close')
  }, 400)
}

onMounted(() => {
  setTimeout(() => { visible.value = true }, 50)
  setTimeout(close, 8000)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-400 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="visible && !closing" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="close">
        <Transition
          enter-active-class="transition duration-600 ease-out"
          enter-from-class="opacity-0 scale-50 translate-y-8"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div v-if="visible" class="relative mx-4 max-w-sm w-full">
            <div class="absolute inset-0 rounded-[40px] bg-gradient-to-br from-yellow-400/40 to-amber-600/40 blur-2xl scale-110"></div>
            <div class="relative bg-white rounded-[40px] p-10 text-center shadow-2xl border-4 border-yellow-400/60 overflow-hidden">
              <div class="absolute top-4 right-6 text-yellow-400 text-2xl animate-pulse">✨</div>
              <div class="absolute top-8 left-5 text-amber-400 text-xl animate-bounce" style="animation-delay:.3s">⭐</div>
              <div class="absolute bottom-6 right-5 text-yellow-300 text-lg" style="animation:spin 3s linear infinite">✦</div>

              <div class="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg">
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white">¡Nueva Insignia!</span>
              </div>

              <div class="badge-icon-enter relative inline-flex items-center justify-center w-28 h-28 mx-auto mb-6">
                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.6)]"></div>
                <span class="relative text-6xl drop-shadow-lg select-none">{{ badge.icono }}</span>
              </div>

              <h2 class="text-3xl font-black text-black uppercase tracking-tighter mb-3 leading-none">
                {{ badge.nombre }}
              </h2>

              <p class="text-sm text-slate-600 font-medium leading-relaxed mb-8 px-2">
                {{ badge.descripcion }}
              </p>

              <button
                @click="close"
                class="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition-all active:scale-95"
              >
                ¡Continuar mi viaje! 🚀
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.badge-icon-enter {
  animation: badgeScale 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}
@keyframes badgeScale {
  from { transform: scale(0) rotate(-15deg); opacity: 0; }
  to   { transform: scale(1) rotate(0deg);  opacity: 1; }
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

