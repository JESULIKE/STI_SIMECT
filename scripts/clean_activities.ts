import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpieza de actividades duplicadas...')

  // Obtener todas las actividades
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'asc' }
  })

  // Agrupar por subfase y nivel
  const groups: Record<string, string[]> = {}

  for (const act of activities) {
    if (!act.subPhase) continue
    const key = `${act.subPhase}-${act.nivel}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(act.id)
  }

  const idsToDelete: string[] = []

  for (const [key, ids] of Object.entries(groups)) {
    // Si hay más de 1 actividad para este (subfase + nivel), mantenemos el primero y borramos el resto
    if (ids.length > 1) {
      console.log(`Grupo ${key}: tiene ${ids.length} actividades. Conservando 1, borrando ${ids.length - 1}.`)
      // Añadimos del índice 1 en adelante a la lista de borrado
      idsToDelete.push(...ids.slice(1))
    } else {
      console.log(`Grupo ${key}: tiene ${ids.length} actividad. Todo correcto.`)
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`Borrando ${idsToDelete.length} actividades sobrantes...`)
    const result = await prisma.activity.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    })
    console.log(`¡Limpieza completada! ${result.count} actividades eliminadas.`)
  } else {
    console.log('No se encontraron actividades sobrantes. Todo limpio.')
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
