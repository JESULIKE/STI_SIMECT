<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center justify-between
           border-b border-blue-300 bg-white/90 px-4 backdrop-blur-md
          "
  >
    <!-- Izquierda: Logo + toggle sidebar -->
    <div class="flex items-center gap-3">
      <button
        id="sidebar-toggle"
        class="inline-flex h-8 w-8 items-center justify-center rounded-lg
               text-surface-500 hover:bg-surface-100 hover:text-surface-900
              
               transition-colors duration-150"
        aria-label="Abrir/cerrar menú"
        @click="uiStore.toggleSidebar"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <UiAppLogo />
    </div>

    <!-- Derecha: acciones globales -->
    <div class="flex items-center gap-2">
      <div class="mx-1 h-6 w-px bg-surface-200" aria-hidden="true" />

      <!-- Avatar si hay sesión -->
      <div v-if="loggedIn" class="flex items-center gap-3">
        
        <!-- Código del Estudiante/Docente -->
        <div 
          v-if="user?.studentCode" 
          class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm"
          title="Tu código de acceso"
        >
          <span class="text-[10px] font-black uppercase text-blue-500 tracking-widest">CÓDIGO:</span>
          <span class="text-sm font-mono font-bold text-blue-900">{{ user.studentCode }}</span>
        </div>

        <button
          id="user-menu-btn"
          class="flex h-9 w-9 items-center justify-center rounded-xl
                 bg-red-500 text-white shadow-lg shadow-red-500/20
                 hover:bg-red-600 transition-all duration-200"
          :title="user?.name + ' (Cerrar Sesión)'"
          aria-label="Cerrar sesión"
          @click="handleLogout"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      <!-- Login link si no hay sesión -->
      <NuxtLink
        v-else
        id="navbar-login-link"
        to="/auth/login"
        class="inline-flex items-center gap-1.5 rounded-lg bg-primary-800 px-3.5 py-2
               text-sm font-medium text-white shadow-primary hover:bg-primary-700
               transition-colors duration-150"
      >
        Iniciar sesión
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const uiStore = useUIStore()

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
    window.location.href = '/auth/login'
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    await clear()
    window.location.href = '/auth/login'
  }
}

</script>
