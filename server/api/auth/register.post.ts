import { Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'Cuerpo vacío' })
    }

    let { name, email, password, role, studentCode, institucion } = body

    if (!password || !name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nombre y contraseña son obligatorios',
      })
    }

    // Normalización de Datos
    if (email) email = email.trim().toLowerCase()
    
    // Auto-generar código si no se proporciona (lo normal ahora)
    const assignedRole = (role || 'STUDENT') as Role
    if (!studentCode) {
      const count = await prisma.user.count({ where: { role: assignedRole } })
      const prefix = assignedRole === 'STUDENT' ? 'EST-' : 'DOC-'
      studentCode = `${prefix}${String(count + 1).padStart(3, '0')}`
    } else {
      studentCode = studentCode.trim()
      if (studentCode.toLowerCase().startsWith('est-') || studentCode.toLowerCase().startsWith('doc-')) {
        studentCode = studentCode.toUpperCase()
      }
    }

    // Si no hay email, generar uno basado en el código
    const finalEmail = email || `${studentCode.toLowerCase()}@simect.edu.co`

    // 1. Verificar si el email o el código ya existen
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: finalEmail },
          { code: studentCode }
        ]
      }
    })

    if (existingUser) {
      const field = existingUser.email === finalEmail ? 'correo' : 'código';
      throw createError({ statusCode: 400, statusMessage: `El ${field} ya está registrado` })
    }

    // 2. Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3. Crear usuario y perfil en transacción
    const user = await prisma.user.create({
      data: {
        name,
        email: finalEmail,
        code: studentCode,
        password: hashedPassword,
        role: assignedRole,
        institucion: institucion || null, // Se guarda para todos los roles
        studentProfile: assignedRole === 'STUDENT' ? {
          create: {
            codigoEstudiantil: studentCode,
            institucion: institucion || null,
            totalPoints: 0,
            currentStreak: 0
          }
        } : undefined
      },
      include: {
        studentProfile: true
      }
    })


    // 4. Preparar datos de sesión
    const sessionUser = {
      id: user.id,
      studentProfileId: user.studentProfile?.id || null,
      studentCode: studentCode || finalEmail,
      name: user.name,
      role: user.role,
      institucion: user.institucion || null
    }

    // Auto-login después del registro
    await setUserSession(event, { user: sessionUser }, { maxAge: 60 * 60 * 8 })

    return { 
      message: 'Cuenta creada con éxito', 
      user: sessionUser 
    }
    
  } catch (error: any) {
    // Log detallado para Vercel
    console.error('--- ERROR REGISTER API ---')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)

    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      const field = error.meta?.target?.includes('email') ? 'correo' : 'código';
      throw createError({
        statusCode: 400,
        statusMessage: `Error: El ${field} ya está en uso.`,
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Error al crear la cuenta: ${error.message || 'Error desconocido'}`,
    })
  }
})

