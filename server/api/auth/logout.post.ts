export default defineEventHandler(async (event) => {
  console.log('LOGOUT: Iniciando proceso de cierre de sesión')
  // Limpia la sesión actual del usuario
  await clearUserSession(event)
  console.log('LOGOUT: Sesión eliminada del servidor')
  return { message: 'Logout exitoso' }
})
