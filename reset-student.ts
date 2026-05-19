import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetStudent() {
  try {
    const student = await prisma.studentProfile.findFirst({
      include: { user: true }
    })

    if (!student) {
      console.log('No se encontró ningún estudiante.')
      return
    }

    console.log(`Reseteando estudiante: ${student.user.email}`)

    // Borrar todos los intentos
    const deletedAttempts = await prisma.activityAttempt.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Intentos eliminados: ${deletedAttempts.count}`)

    // Borrar todos los progresos
    const deletedProgress = await prisma.progress.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Registros de progreso eliminados: ${deletedProgress.count}`)

    // Borrar checklists de metacognición
    const deletedChecklists = await prisma.metacognitionChecklist.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Checklists eliminados: ${deletedChecklists.count}`)

    // Resetear puntos y racha
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        totalPoints: 0,
        currentStreak: 0,
        lastActivityAt: null
      }
    })
    console.log(`✓ Puntos y racha reseteados a 0`)

    console.log('\n✅ Estudiante reseteado correctamente. Puede iniciar el flujo completo desde el principio.')

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

resetStudent()
