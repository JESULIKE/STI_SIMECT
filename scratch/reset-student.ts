import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetStudent(studentCode: string) {
  console.log(`Buscando estudiante con código: ${studentCode}...`)
  
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { code: studentCode },
          { email: studentCode }
        ]
      },
      include: { studentProfile: true }
    })

    if (!user || !user.studentProfile) {
      console.error("ERROR: Estudiante no encontrado o no tiene perfil.")
      return
    }

    const studentProfileId = user.studentProfile.id
    console.log(`Estudiante encontrado: ${user.name} (ID: ${user.id})`)
    console.log("Procediendo a borrar datos de progreso e intentos...")

    await prisma.$transaction([
      prisma.activityAttempt.deleteMany({ where: { studentProfileId } }),
      prisma.metacognitionChecklist.deleteMany({ where: { studentProfileId } }),
      prisma.reflection.deleteMany({ where: { studentProfileId } }),
      prisma.progress.deleteMany({ where: { studentProfileId } }),
      prisma.earnedBadge.deleteMany({ where: { studentProfileId } }),
      prisma.errorPattern.deleteMany({ where: { studentProfileId } }),
      prisma.studentProfile.update({
        where: { id: studentProfileId },
        data: {
          totalPoints: 0,
          currentStreak: 0,
          lastActivityAt: null
        }
      })
    ])

    console.log("¡ÉXITO! Todos los datos de progreso han sido eliminados.")

  } catch (error) {
    console.error("ERROR CRÍTICO:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Obtener código de los argumentos de línea de comandos
const code = process.argv[2]

if (!code) {
  console.log("Uso: npx jiti scratch/reset-student.ts <CODIGO_O_EMAIL>")
  process.exit(1)
}

resetStudent(code)
