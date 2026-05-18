<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({ layout: 'auth' })

const { fetch: refreshSession, loggedIn } = useUserSession()
const router = useRouter()

if (loggedIn.value) {
  await navigateTo('/dashboard')
}

useSeoMeta({
  title: 'Registro STI SIMECT',
  description: 'Crea tu cuenta en el Sistema Tutor Inteligente para el Pensamiento Crítico.',
})

const roles = [
  { id: 'STUDENT', label: 'Estudiante', icon: '🎓' },
  { id: 'TEACHER', label: 'Docente', icon: '👨‍🏫' }
]

const selectedRole = ref('STUDENT')
const form = reactive({
  name: '',
  email: '',
  institucion: '',
  password: '',
  confirmPassword: '',
  acceptedConsent: false
})

const isLoading = ref(false)
const error = ref<string | null>(null)

const colegios = [
  "Institución Educativa Cristóbal colon",
  "Institución educativa Liceo Guillermo Valencia",
  "institución educativa inem Lorenzo María Lleras",
  "Institución Educativa Rancho grande",
  "Institución Policarpa salavarrieta",
  "Institución Educativa Antonia Santos",
  "Institución Educativa Juan XXIII",
  "Institución educativa José María Córdoba",
  "Mega colegio el Dorado",
  "Institución educativa Santa María Goretti",
  "Institución educativa Mercedes Ábrego",
  "Institución educativa Cecilia de lleras",
  "Institucion Educativa Santa Rosa De Lima"
]

const isFormValid = computed(() => {
  const common = form.name.length > 0 && 
                 form.password.length >= 6 && 
                 form.password === form.confirmPassword &&
                 form.acceptedConsent &&
                 form.institucion.length > 0
  return common
})

const handleRegister = async () => {
  if (!isFormValid.value) return
  isLoading.value = true
  error.value = null

  try {
    const finalEmail = form.email || undefined

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: form.name,
        email: finalEmail,
        password: form.password,
        role: selectedRole.value,
        institucion: form.institucion
      }
    })

    // Mostrar el código al usuario inmediatamente antes de redirigir
    window.alert(`¡Registro exitoso!\n\nTu código de acceso es: ${response.user.studentCode}\n\nPor favor, anótalo y guárdalo en un lugar seguro, lo necesitarás siempre para iniciar sesión.`)

    await refreshSession()
    
    if (selectedRole.value === 'TEACHER') {
      router.push('/admin/analytics')
    } else {
      router.push('/dashboard')
    }
  } catch (err: any) {
    console.error('Registration error:', err)
    error.value = err.data?.statusMessage || 'Error al crear la cuenta. Intenta con otro correo.'
  } finally {
    isLoading.value = false
  }
}

// Emojis educativos que caen — variación para registro
const floatingEmojis = [
  { emoji: '📚', delay: '0s',   duration: '7s',  left: '4%',  size: '2.2rem' },
  { emoji: '✏️', delay: '1s',   duration: '6s',  left: '10%', size: '1.5rem' },
  { emoji: '🎓', delay: '0.4s', duration: '8s',  left: '18%', size: '2rem' },
  { emoji: '📐', delay: '2s',   duration: '9s',  left: '27%', size: '1.4rem' },
  { emoji: '🔬', delay: '1.5s', duration: '7s',  left: '38%', size: '1.8rem' },
  { emoji: '📝', delay: '0.7s', duration: '8.5s',left: '48%', size: '1.6rem' },
  { emoji: '🧪', delay: '2.5s', duration: '6.5s',left: '58%', size: '2rem' },
  { emoji: '🖊️', delay: '0.2s', duration: '7.5s',left: '67%', size: '1.5rem' },
  { emoji: '📖', delay: '1.8s', duration: '6s',  left: '76%', size: '1.9rem' },
  { emoji: '🔭', delay: '3s',   duration: '9s',  left: '85%', size: '1.6rem' },
  { emoji: '🎒', delay: '1.3s', duration: '8s',  left: '93%', size: '2rem' },
  { emoji: '🏫', delay: '2.8s', duration: '7s',  left: '55%', size: '1.7rem' },
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
    <div class="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">

      <!-- Branding -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-blue-900/20 mb-2 overflow-hidden border-4 border-white/80 p-2">
           <img src="/Logo.png" alt="SIMECT Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-4xl font-black text-white drop-shadow-lg italic tracking-tighter uppercase">Tutor SIMECT</h1>
        <p class="text-blue-900 font-bold italic drop-shadow-sm">Sistema Tutor Inteligente para el Pensamiento Crítico</p>
      </div>

      <!-- Tabs -->
      <div class="flex p-1.5 bg-white/30 backdrop-blur-md rounded-[24px] border-2 border-white/50">
        <NuxtLink 
          to="/auth/login" 
          class="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center rounded-[18px] text-blue-900 hover:text-blue-950 transition-all"
        >
          Iniciar Sesión
        </NuxtLink>
        <NuxtLink 
          to="/auth/register" 
          class="flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-center rounded-[18px] bg-white shadow-xl text-blue-900 transition-all"
        >
          Crear Cuenta
        </NuxtLink>
      </div>

      <!-- Card de Registro -->
      <div class="bg-white/90 backdrop-blur-xl p-8 rounded-[48px] shadow-2xl border-2 border-white relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div class="relative z-10 space-y-5">
          <div class="text-center space-y-1">
            <h2 class="text-xl font-black text-blue-900 uppercase tracking-tight">Únete al proyecto</h2>
            <p class="text-[10px] text-blue-700 font-bold uppercase tracking-widest">Completa tus datos para comenzar</p>
          </div>

          <!-- Selector de Rol -->
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="role in roles"
              :key="role.id"
              type="button"
              @click="selectedRole = role.id"
              :class="[
                'relative flex items-center justify-center gap-2 rounded-2xl py-4 px-4 transition-all duration-300 border-2 font-black uppercase text-[10px] tracking-widest',
                selectedRole === role.id 
                  ? 'bg-blue-700 text-white border-blue-700 shadow-lg shadow-blue-700/30 scale-105' 
                  : 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400'
              ]"
            >
              <span>{{ role.icon }}</span>
              {{ role.label }}
            </button>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            
            <div class="space-y-2">
              <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">Nombre Completo</label>
              <input 
                v-model="form.name"
                type="text" 
                required
                placeholder="Ej: Juan Pérez"
                class="w-full px-5 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none transition-all italic text-sm font-medium"
              >
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">Correo (Opcional)</label>
              <input 
                v-model="form.email"
                type="email" 
                placeholder="juan@ejemplo.com"
                class="w-full px-5 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-900 placeholder:text-blue-300 focus:border-blue-500 focus:outline-none transition-all text-sm"
              >
            </div>

            <div class="space-y-2">
              <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">
                Institución Educativa
              </label>
              <div class="relative">
                <select 
                  v-model="form.institucion"
                  required
                  class="w-full px-5 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-900 focus:border-blue-500 focus:outline-none transition-all text-sm appearance-none cursor-pointer"
                  :class="{ 'text-blue-300': !form.institucion }"
                >
                  <option value="" disabled selected>Selecciona tu colegio</option>
                  <option v-for="colegio in colegios" :key="colegio" :value="colegio">
                    {{ colegio }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-2">
                <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">Contraseña</label>
                <input 
                  v-model="form.password"
                  type="password" 
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-900 focus:border-blue-500 focus:outline-none transition-all text-sm"
                >
              </div>
              <div class="space-y-2">
                <label class="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-900 px-2">Confirmar</label>
                <input 
                  v-model="form.confirmPassword"
                  type="password" 
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-blue-900 focus:border-blue-500 focus:outline-none transition-all text-sm"
                >
              </div>
            </div>

            <div v-if="error" class="bg-orange-100 border-2 border-orange-400 text-orange-700 p-4 rounded-2xl text-[10px] font-bold uppercase text-center italic">
              {{ error }}
            </div>

            <!-- Consentimiento -->
            <div class="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
              <div class="flex gap-3">
                <input 
                  v-model="form.acceptedConsent"
                  id="consent-reg"
                  type="checkbox" 
                  class="w-5 h-5 mt-1 rounded-lg accent-blue-600"
                >
                <label for="consent-reg" class="text-[10px] text-blue-800 leading-tight font-semibold">
                  Autorizo el tratamiento de mis datos para fines pedagógicos del <span class="font-black text-blue-600">Proyecto FE-01-24</span> (Ley 1581 de 2012).
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="!isFormValid || isLoading"
              class="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-[0.5em] text-xs rounded-3xl shadow-2xl shadow-green-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group"
            >
              <span v-if="!isLoading" class="flex items-center justify-center gap-2">
                Registrarme 🎓
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creando Cuenta...
              </span>
            </button>

            <!-- Ayuda de Validación -->
            <div v-if="!isFormValid && !isLoading" class="text-center space-y-1 py-1">
               <p v-if="form.name.length === 0" class="text-[9px] text-blue-700 uppercase font-bold">* Falta ingresar tu nombre</p>
               <p v-if="!form.institucion" class="text-[9px] text-blue-700 uppercase font-bold">* Selecciona tu institución educativa</p>
               <p v-if="form.password.length < 6" class="text-[9px] text-blue-700 uppercase font-bold">* La contraseña debe tener al menos 6 caracteres</p>
               <p v-if="form.password !== form.confirmPassword && form.confirmPassword.length > 0" class="text-[9px] text-orange-500 uppercase font-bold">* Las contraseñas no coinciden</p>
               <p v-if="!form.acceptedConsent" class="text-[9px] text-purple-600 uppercase font-bold">* Debes aceptar el consentimiento de datos</p>
            </div>
          </form>
        </div>
      </div>

      <div class="text-center">
        <p class="text-[10px] text-blue-900 font-black uppercase tracking-widest drop-shadow-sm">
          © {{ new Date().getFullYear() }} Universidad de Córdoba — Colombia
        </p>
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
  5%   { opacity: 0.7; }
  90%  { opacity: 0.5; }
  100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
</style>
