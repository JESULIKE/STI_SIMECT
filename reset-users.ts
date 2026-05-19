import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetUsers() {
  try {
    const emailsToReset = ['jesus.estudiante@simect.com', 'jesus@simect.com']

    for (const email of emailsToReset) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { studentProfile: true }
      })

      if (!user) {
        console.log(`No se encontró el usuario: ${email}`)
        continue
      }

      console.log(`\n=========================================`)
      console.log(`Reseteando usuario: ${user.email} (${user.role})`)
      console.log(`=========================================`)

      // 1. Borrar Logs de Sesión (aplica para estudiantes y docentes)
      const deletedLogs = await prisma.sessionLog.deleteMany({
        where: { userId: user.id }
      })
      console.log(`✓ Logs de sesión eliminados: ${deletedLogs.count}`)

      // 2. Borrar datos específicos de estudiantes
      if (user.studentProfile) {
        const studentId = user.studentProfile.id

        // Intentos
        const deletedAttempts = await prisma.activityAttempt.deleteMany({
          where: { studentProfileId: studentId }
        })
        console.log(`✓ Intentos de actividades eliminados: ${deletedAttempts.count}`)

        // Progreso (Fases/Subfases)
        const deletedProgress = await prisma.progress.deleteMany({
          where: { studentProfileId: studentId }
        })
        console.log(`✓ Registros de progreso eliminados: ${deletedProgress.count}`)

        // Checklists (Planificación)
        const deletedChecklists = await prisma.metacognitionChecklist.deleteMany({
          where: { studentProfileId: studentId }
        })
        console.log(`✓ Checklists iniciales eliminados: ${deletedChecklists.count}`)

        // Reflexiones (Meta-Reflexión)
        const deletedReflections = await prisma.reflection.deleteMany({
          where: { studentProfileId: studentId }
        })
        console.log(`✓ Reflexiones post-actividad eliminadas: ${deletedReflections.count}`)

        // Insignias Ganadas
        const deletedBadges = await prisma.earnedBadge.deleteMany({
          where: { studentProfileId: studentId }
        })
        console.log(`✓ Insignias ganadas eliminadas: ${deletedBadges.count}`)

        // Resetear puntos, racha y fecha
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: {
            totalPoints: 0,
            currentStreak: 0,
            lastActivityAt: null
          }
        })
        console.log(`✓ Puntos y racha reseteados a 0`)
      } else {
        console.log(`✓ (No aplica limpieza de progreso por ser Docente)`)
      }
    }

    console.log('\n✅ Proceso de limpieza finalizado con éxito.')

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

resetUsers()
