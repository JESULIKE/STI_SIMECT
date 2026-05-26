import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetStudent() {
  const studentCode = process.argv[2]

  if (!studentCode) {
    console.error('❌ Error: Por favor, proporciona el código del estudiante.')
    console.log('Uso: npx tsx reset-student.ts <codigo_estudiante>')
    console.log('Ejemplo: npx tsx reset-student.ts EST-000')
    process.exit(1)
  }

  try {
    const student = await prisma.studentProfile.findFirst({
      where: {
        codigoEstudiantil: studentCode
      },
      include: { user: true }
    })

    if (!student) {
      console.log(`❌ No se encontró ningún estudiante con el código: ${studentCode}`)
      return
    }

    console.log(`Reseteando estudiante: ${student.user.email} (Código: ${student.codigoEstudiantil})`)

    // Borrar reflexiones
    const deletedReflections = await prisma.reflection.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Reflexiones eliminadas: ${deletedReflections.count}`)

    // Borrar monitoreos metacognitivos
    const deletedMonitorings = await prisma.metacognitionMonitoring.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Monitoreos metacognitivos eliminados: ${deletedMonitorings.count}`)

    // Borrar insignias ganadas
    const deletedBadges = await prisma.earnedBadge.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Insignias ganadas eliminadas: ${deletedBadges.count}`)

    // Borrar patrones de error
    const deletedErrors = await prisma.errorPattern.deleteMany({
      where: { studentProfileId: student.id }
    })
    console.log(`✓ Patrones de error eliminados: ${deletedErrors.count}`)

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

    // Resetear puntos, racha y nivel
    await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        totalPoints: 0,
        currentStreak: 0,
        lastActivityAt: null,
        nivelActual: 'BASIC'
      }
    })
    console.log(`✓ Puntos, racha y nivel actual (BASIC) reseteados`)

    console.log(`\n✅ Estudiante ${studentCode} reseteado correctamente. Puede iniciar el flujo completo desde el principio.`)

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
}

resetStudent()
