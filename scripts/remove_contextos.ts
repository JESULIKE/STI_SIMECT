import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const activities = await prisma.activity.findMany()
  console.log(`Procesando ${activities.length} actividades...`)

  let updated = 0
  for (const act of activities) {
    const contenido = act.contenido as any
    if (contenido && contenido.contexto !== undefined && contenido.contexto !== null) {
      const newContenido = { ...contenido, contexto: null }
      await prisma.activity.update({
        where: { id: act.id },
        data: { contenido: newContenido }
      })
      updated++
      console.log(`  ✅ Contexto quitado: "${act.titulo}"`)
    }
  }

  console.log(`\n🎉 ${updated} actividades actualizadas. Contextos eliminados.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
