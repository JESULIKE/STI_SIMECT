// Middleware de autenticación: protege rutas que requieren login
// Uso: definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware((_to, _from) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login', { redirectCode: 302 })
  }
})
