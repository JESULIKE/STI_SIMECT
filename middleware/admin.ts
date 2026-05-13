export default defineNuxtRouteMiddleware((to, from) => {
  const { user, loggedIn } = useUserSession()

  // Bloquear solo si es un estudiante intentando entrar a rutas administrativas
  if (loggedIn.value && user.value?.role === 'STUDENT') {
    console.warn(`ACCESO DENEGADO: El estudiante ${user.value.name} intentó entrar a ${to.path}`)
    return navigateTo('/dashboard')
  }
  
  // Si no está logueado, el middleware 'auth' se encargará de redirigir al login
})
