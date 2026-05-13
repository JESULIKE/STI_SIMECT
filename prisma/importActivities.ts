import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando carga masiva de actividades...')

  const dataPath = path.join(process.cwd(), 'prisma', 'data', 'activities.json')
  const activities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  for (const activity of activities) {
    try {
      await prisma.activity.upsert({
        where: { id: activity.id || 'temp-id-' + activity.titulo.replace(/\s/g, '-') },
        update: {
          titulo: activity.titulo,
          descripcion: activity.descripcion,
          fase: activity.fase,
          nivel: activity.nivel,
          tipo: activity.tipo,
          contenido: activity.contenido,
          claveRespuestas: activity.claveRespuestas,
          puntajeMaximo: activity.puntajeMaximo
        },
        create: {
          titulo: activity.titulo,
          descripcion: activity.descripcion,
          fase: activity.fase,
          nivel: activity.nivel,
          tipo: activity.tipo,
          contenido: activity.contenido,
          claveRespuestas: activity.claveRespuestas,
          puntajeMaximo: activity.puntajeMaximo
        }
      })
      console.log(`✅ Cargada: ${activity.titulo}`)
    } catch (error) {
      console.error(`❌ Error al cargar ${activity.titulo}:`, error)
    }
  }

  console.log('✨ Importación finalizada con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
