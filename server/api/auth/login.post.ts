import * as bcrypt from 'bcryptjs'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'Cuerpo de solicitud vacío' })
    }

    let { studentCode, password } = body

    if (!studentCode || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Código y contraseña obligatorios' })
    }

    // Limpiar espacios accidentales y normalizar
    studentCode = studentCode.trim()

    // Si el código parece institucional, forzar mayúsculas (igual que en registro)
    if (studentCode.toLowerCase().startsWith('est-') || studentCode.toLowerCase().startsWith('doc-')) {
      studentCode = studentCode.toUpperCase()
    } else {
      // Si es un email, pasarlo a minúsculas
      if (studentCode.includes('@')) {
        studentCode = studentCode.toLowerCase()
      }
    }

    password = password.trim()

    // 1. Buscar usuario por código (prioridad) o por email
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { code: studentCode },
          { email: studentCode }
        ]
      },
      include: { studentProfile: true }
    })


    if (!dbUser) {
      throw createError({ statusCode: 401, statusMessage: 'Usuario no encontrado. Revisa tu código.' })
    }

    // 2. Verificar contraseña cifrada
    const isPasswordCorrect = await bcrypt.compare(password, dbUser.password)
    if (!isPasswordCorrect) {
      throw createError({ statusCode: 401, statusMessage: 'Contraseña incorrecta.' })
    }

    // 3. Actualizar racha si es estudiante
    if (dbUser.role === 'STUDENT' && dbUser.studentProfile) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const lastActivity = dbUser.studentProfile.lastActivityAt ? new Date(dbUser.studentProfile.lastActivityAt) : null
      if (lastActivity) lastActivity.setHours(0, 0, 0, 0)

      let newStreak = dbUser.studentProfile.currentStreak
      const oneDayInMs = 24 * 60 * 60 * 1000

      if (!lastActivity) {
        newStreak = 1
      } else {
        const diffDays = Math.round((today.getTime() - lastActivity.getTime()) / oneDayInMs)

        if (diffDays === 1) {
          newStreak += 1 // Entró ayer, racha continúa
        } else if (diffDays > 1) {
          newStreak = 1 // Perdió la racha, vuelve a 1
        }
      }

      await prisma.studentProfile.update({
        where: { id: dbUser.studentProfile.id },
        data: {
          currentStreak: newStreak,
          lastActivityAt: new Date()
        }
      })
    }

    // 4. Preparar datos de sesión
    const sessionUser = {
      id: dbUser.id,
      studentProfileId: dbUser.studentProfile?.id || null,
      studentCode: dbUser.code,
      name: dbUser.name,
      role: dbUser.role,
      institucion: dbUser.institucion || null
    }


    console.log(`LOGIN: Sesión iniciada para ${dbUser.name} (${dbUser.role})`)

    await setUserSession(event, { user: sessionUser }, {
      maxAge: 60 * 60 * 8
    })

    return { message: 'Bienvenido al STI', user: sessionUser }

  } catch (error: any) {
    // Log detallado para Vercel
    console.error('--- ERROR LOGIN API ---')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    if (error.code) console.error('Prisma Error Code:', error.code)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Error en el servidor: ${error.message || 'Error desconocido'}`,
    })
  }
})
