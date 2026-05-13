import { defineStore } from 'pinia'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'ADMIN')
  const isTeacher  = computed(() => user.value?.role === 'TEACHER')
  const isStudent  = computed(() => user.value?.role === 'STUDENT')
  const displayName = computed(() => user.value?.name ?? 'Invitado')

  const setUser = (u: AuthUser | null) => { user.value = u }
  const clearError = () => { error.value = null }

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
      const { fetch: refreshSession } = useUserSession()
      await refreshSession()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
      throw e
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isLoggedIn, isAdmin, isTeacher, isStudent, displayName,
    setUser, clearError, login, logout,
  }
})
