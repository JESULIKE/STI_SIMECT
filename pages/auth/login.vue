<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()
const router = useRouter()

const form = reactive({
  studentCode: '',
  password: '',
  acceptedConsent: false
})

const isLoading = ref(false)
const showPassword = ref(false)
const error = ref<string | null>(null)

const isCodeValid = computed(() => {
  if (form.studentCode.length === 0) return true
  return form.studentCode.length >= 4
})

const isFormValid = computed(() => {
  return form.studentCode.length > 0 && 
         form.password.length > 0 &&
         form.acceptedConsent
})

const handleLogin = async () => {
  if (!isFormValid.value) return
  isLoading.value = true
  error.value = null

  try {
    const role = form.studentCode.startsWith('DOC-') ? 'ADMIN' : 'STUDENT'
    
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        studentCode: form.studentCode,
        password: form.password,
        role: role
      }
    })

    const session = await refreshSession()
    const actualUser = (session as any)?.user
    
    if (actualUser?.role && actualUser.role !== 'STUDENT') {
      router.push('/admin/analytics')
    } else {
      router.push('/dashboard')
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.data?.statusMessage || 'Credenciales no reconocidas. Verifica tu código.'
  } finally {
    isLoading.value = false
  }
}

// Emojis educativos que caen en el fondo — posiciones a lo largo de TODA la pantalla
const floatingEmojis = [
  { emoji: '📚', delay: '0s',   duration: '6s',  left: '2%',  size: '2rem' },
  { emoji: '✏️', delay: '0.5s', duration: '8s',  left: '7%',  size: '1.5rem' },
  { emoji: '🎓', delay: '1s',   duration: '7s',  left: '13%', size: '2.2rem' },
  { emoji: '📐', delay: '1.5s', duration: '9s',  left: '19%', size: '1.4rem' },
  { emoji: '🔬', delay: '2s',   duration: '6.5s',left: '25%', size: '1.8rem' },
  { emoji: '📝', delay: '0.8s', duration: '7.5s',left: '31%', size: '1.6rem' },
  { emoji: '🧠', delay: '2.5s', duration: '8.5s',left: '37%', size: '2rem' },
  { emoji: '📖', delay: '0.3s', duration: '7s',  left: '43%', size: '1.9rem' },
  { emoji: '🎨', delay: '1.8s', duration: '6s',  left: '49%', size: '1.6rem' },
  { emoji: '🔭', delay: '3s',   duration: '9s',  left: '55%', size: '1.5rem' },
  { emoji: '🎓', delay: '1.2s', duration: '8s',  left: '61%', size: '2.2rem' },
  { emoji: '📊', delay: '2.2s', duration: '7s',  left: '67%', size: '1.3rem' },
  { emoji: '🎫', delay: '0.6s', duration: '8.5s',left: '73%', size: '1.7rem' },
  { emoji: '📚', delay: '1.7s', duration: '6.5s',left: '79%', size: '2rem' },
  { emoji: '✏️', delay: '2.8s', duration: '7.5s',left: '85%', size: '1.5rem' },
  { emoji: '📌', delay: '0.9s', duration: '9s',  left: '91%', size: '1.4rem' },
  { emoji: '🌟', delay: '3.5s', duration: '6s',  left: '96%', size: '1.8rem' },
]
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
    
    <!-- ══ Emojis educativos cayendo — capa FIJA sobre toda la pantalla ══ -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <span
        v-for="(item, i) in floatingEmojis"
        :key="i"
        class="falling-emoji absolute top-0"
        :style="{
          left: item.left,
          fontSize: item.size,
          animationDelay: item.delay,
          animationDuration: item.duration
        }"
      >{{ item.emoji }}</span>
    </div>

    <!-- ══ Contenido del formulario ══ -->
    <div class="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
      
      <!-- Branding -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-blue-900/20 mb-4 overflow-hidden border-4 border-white/80 p-2">
           <img src="/Logo.png" alt="SIMECT Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-4xl font-black text-white drop-shadow-lg italic tracking-tighter uppercase">Tutor SIMECT</h1>
        <p class="text-blue-900 font-bold italic drop-shadow-sm">Sistema Tutor Inteligente para el Pensamiento Crítico</p>
      </div>

      <!-- Card -->
      <div class="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[48px] shadow-2xl border-2 border-white relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>

        <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
          
          <div class="text-center space-y-1 mb-2">
            <h2 class="text-xl font-black text-blue-900 uppercase tracking-tight">Bienvenido de nuevo</h2>
            <p class="text-[10px] text-blue-700 font-bold uppercase tracking-widest italic">Ingresa tus credenciales para continuar</p>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">Código Estudiantil / Docente</label>
            <input 
              v-model="form.studentCode"
              type="text" 
              required
              placeholder="Ej: DOC-001 o EST-001"
              class="w-full px-6 py-5 bg-blue-50 border-2 border-blue-200 rounded-3xl text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none transition-all shadow-sm font-mono tracking-widest"
              :class="!isCodeValid && form.studentCode.length > 0 ? 'border-orange-400 bg-orange-50' : ''"
            >
            <p v-if="!isCodeValid && form.studentCode.length > 0" class="text-[9px] font-black text-orange-500 uppercase px-2">El código debe ser válido (Ej. EST-001)</p>
          </div>

          <div class="space-y-2">
            <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">Contraseña</label>
            <div class="relative">
              <input 
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'" 
                required
                placeholder="••••••••"
                class="w-full px-6 pr-14 py-5 bg-blue-50 border-2 border-blue-200 rounded-3xl text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none transition-all shadow-sm tracking-tighter"
              >
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 transition-colors focus:outline-none"
                title="Mostrar/Ocultar contraseña"
              >
                <!-- Eye Icon when password is shown -->
                <svg v-if="showPassword" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye Off Icon when password is hidden -->
                <svg v-else class="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="error" class="bg-orange-100 border-2 border-orange-400 text-orange-700 p-4 rounded-2xl text-[10px] font-bold uppercase text-center italic">
            {{ error }}
          </div>

          <!-- Consentimiento -->
          <div class="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 space-y-3">
            <div class="flex gap-3">
              <input 
                v-model="form.acceptedConsent"
                id="consent"
                type="checkbox" 
                class="w-5 h-5 mt-1 rounded-lg accent-blue-600"
              >
              <label for="consent" class="text-[10px] text-blue-800 leading-tight font-semibold">
                Acepto el <span class="text-blue-600 font-black">Consentimiento Informado</span> y autorizo el tratamiento de mis datos personales para fines pedagógicos e investigativos del <span class="font-black">Proyecto FE-01-24</span> (Ley 1581 de 2012).
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="!isFormValid || isLoading"
            class="w-full py-6 bg-blue-700 hover:bg-blue-600 text-white font-black uppercase tracking-[0.5em] text-xs rounded-3xl shadow-2xl shadow-blue-700/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group"
          >
            <span v-if="!isLoading" class="flex items-center justify-center gap-2">
              Iniciar Viaje 🚀
            </span>
            <span v-else class="flex items-center justify-center">
              <svg class="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Verificando...
            </span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-[10px] text-blue-700 font-black uppercase tracking-widest">
            Proyecto FE-01-24 — Universidad de Córdoba
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex p-1.5 bg-white/30 backdrop-blur-md rounded-[24px] border-2 border-white/50">
        <NuxtLink 
          to="/auth/login" 
          class="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center rounded-[18px] bg-white shadow-xl text-blue-900 transition-all"
        >
          Iniciar Sesión
        </NuxtLink>
        <NuxtLink 
          to="/auth/register" 
          class="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center rounded-[18px] text-blue-900 hover:text-blue-950 transition-all"
        >
          Crear Cuenta
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══ Emojis cayendo ═══ */
.falling-emoji {
  animation: fall linear infinite;
  opacity: 0;
  user-select: none;
}

@keyframes fall {
  0%   { transform: translateY(-60px) rotate(0deg);   opacity: 0; }
  5%   { opacity: 0.8; }
  90%  { opacity: 0.6; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
</style>
