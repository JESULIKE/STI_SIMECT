import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const activities = await prisma.activity.findMany({
    orderBy: [
      { fase: 'asc' },
      { subPhase: 'asc' },
      { nivel: 'asc' }
    ],
    include: {
      opciones: true
    }
  })

  console.log(`Encontradas ${activities.length} actividades.`)
  for (const a of activities) {
    console.log(`\n--- ${a.subPhase} - Nivel ${a.nivel} ---`)
    console.log(`ID: ${a.id}`)
    console.log(`Pregunta: ${a.pregunta}`)
    console.log(`Titulo: ${a.titulo}`)
    console.log(`Contenido: ${a.contenido || ''}`)
    console.log(`Opciones:`)
    for (const o of a.opciones) {
      console.log(`  - [${o.esCorrecta ? 'X' : ' '}] ${o.texto} (Feedback: ${o.feedback || 'none'})`)
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
