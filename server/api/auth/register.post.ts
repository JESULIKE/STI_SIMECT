import { Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'Cuerpo vacío' })
    }

    let { name, email, password, role, studentCode } = body

    if (!password || !name || (!email && !studentCode)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nombre, contraseña y un identificador (email o código) son obligatorios',
      })
    }

    // Normalización de Datos
    if (email) email = email.trim().toLowerCase()
    
    if (studentCode) {
      studentCode = studentCode.trim()
      // Si el código parece institucional (EST-xxx o DOC-xxx), forzar mayúsculas
      if (studentCode.toLowerCase().startsWith('est-') || studentCode.toLowerCase().startsWith('doc-')) {
        studentCode = studentCode.toUpperCase()
      }
    }

    // Si no hay email, generar uno basado en el código
    const finalEmail = email || `${studentCode.toLowerCase()}@simect.edu.co`

    // 1. Verificar si el email o el código ya existen (Usando normalizados)
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
        code: studentCode || finalEmail,
        password: hashedPassword,
        role: (role || 'STUDENT') as Role,
        studentProfile: role === 'STUDENT' ? {
          create: {
            codigoEstudiantil: studentCode,
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
      role: user.role
    }

    // Auto-login después del registro
    await setUserSession(event, { user: sessionUser }, { maxAge: 60 * 60 * 8 })

    return { 
      message: 'Cuenta creada con éxito', 
      user: sessionUser 
    }
    
  } catch (error: any) {
    console.error('Error en API de Registro:', error)
    
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
      statusMessage: error.statusMessage || 'Error al crear la cuenta',
    })
  }
})

