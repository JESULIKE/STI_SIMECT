import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const student = await prisma.studentProfile.findFirst()
    if (!student) {
      console.log('No student found')
      return
    }
    console.log('Testing with student:', student.id)
    
    const checklist = await prisma.metacognitionChecklist.create({
      data: {
        studentProfileId: student.id,
        fase: 'ANALYSIS',
        comprensionSIMECT: 5,
        familiaridadTema: 5,
        nivelAsignado: 'BASIC',
        jol1: 1,
        jol2: 2,
        jol3: 3,
        jol4: 4,
        jol5: 5,
        queSe: null,
        queEsperoAprender: null,
        confianzaInicial: null,
        estrategias: null,
        entornoSinDistracciones: false
      }
    })
    
    console.log('Success:', checklist.id)
    
    // Cleanup
    await prisma.metacognitionChecklist.delete({ where: { id: checklist.id } })
  } catch (e: any) {
    console.error('Error in create:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
