import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  // Solo verificar en peticiones que no sean assets
  if (event.path.startsWith('/_nuxt') || event.path.startsWith('/api/_')) {
    return
  }

  const session = await getUserSession(event)
  
  if (session.user) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user) {
        await clearUserSession(event)
        if (event.path.startsWith('/dashboard') || event.path === '/') {
          return sendRedirect(event, '/auth/login')
        }
      }
    } catch (error) {
      console.error('Error en session-check:', error)
    }
  } else if (event.path.startsWith('/dashboard') || event.path === '/') {
    return sendRedirect(event, '/auth/login')
  }
})
