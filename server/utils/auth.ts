import type { H3Event } from 'h3'

// ── Tipos ────────────────────────────────────────────────────────
export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  avatar?: string
}

// ── Helpers de sesión ────────────────────────────────────────────

/**
 * Obtiene el usuario de la sesión actual.
 * Lanza un 401 si no está autenticado.
 */
export const requireAuth = async (event: H3Event): Promise<SessionUser> => {
  const session = await requireUserSession(event)
  return session.user as SessionUser
}

/**
 * Obtiene el usuario de la sesión o null si no está autenticado.
 */
export const getOptionalAuth = async (event: H3Event): Promise<SessionUser | null> => {
  try {
    const session = await getUserSession(event)
    return (session?.user as SessionUser) ?? null
  } catch {
    return null
  }
}

/**
 * Verifica que el usuario tenga el rol requerido.
 * Lanza 403 si no tiene permisos.
 */
export const requireRole = async (
  event: H3Event,
  role: SessionUser['role'] | SessionUser['role'][],
): Promise<SessionUser> => {
  const user = await requireAuth(event)
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permisos para realizar esta acción.',
    })
  }
  return user
}
