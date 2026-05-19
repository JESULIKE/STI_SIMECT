import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // 1. Update Student User and Profile
    const studentUser = await prisma.user.findUnique({
      where: { email: 'jesus.estudiante@simect.com' },
      include: { studentProfile: true }
    })

    if (studentUser) {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: { code: 'EST-000' }
      })

      if (studentUser.studentProfile) {
        await prisma.studentProfile.update({
          where: { id: studentUser.studentProfile.id },
          data: { codigoEstudiantil: 'EST-000' }
        })
      }
      console.log('✓ Código del estudiante actualizado exitosamente a EST-000.')
    } else {
      console.log('⚠ No se encontró el estudiante jesus.estudiante@simect.com')
    }

    // 2. Update Teacher User
    const teacherUser = await prisma.user.findUnique({
      where: { email: 'jesus@simect.com' }
    })

    if (teacherUser) {
      await prisma.user.update({
        where: { id: teacherUser.id },
        data: { code: 'DOC-000' }
      })
      console.log('✓ Código del docente actualizado exitosamente a DOC-000.')
    } else {
      console.log('⚠ No se encontró el docente jesus@simect.com')
    }

  } catch (error) {
    console.error('Error al actualizar códigos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
