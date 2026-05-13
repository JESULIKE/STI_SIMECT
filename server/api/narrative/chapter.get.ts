import { PrismaClient, Level, Phase } from '@prisma/client'

const prisma = new PrismaClient()

// Base de datos de la narrativa según Manual Sección 4.2
const NARRATIVE_DB = [
  {
    numero: 1,
    titulo: 'El inicio del viaje',
    contenido: 'Bienvenido(a) [NOMBRE]. Has dado el primer paso en tu camino de aprendizaje. Cada reto que superes desbloqueará una nueva parte de esta historia que estamos construyendo juntos.',
    desbloqueadoEnNivel: 'BASIC',
    desbloqueadoEnFase: 'ANALYSIS'
  },
  {
    numero: 2,
    titulo: 'Fortaleciendo las bases',
    contenido: 'Tu capacidad de análisis está creciendo, [NOMBRE]. Entender los hechos es la base de todo juicio sólido. Sigue adelante para descubrir más sobre cómo el pensamiento crítico transforma nuestra visión del mundo.',
    desbloqueadoEnNivel: 'BASIC',
    desbloqueadoEnFase: 'EVALUATION'
  },
  {
    numero: 3,
    titulo: 'La voz de la razón',
    contenido: 'Has aprendido a identificar lo relevante. Ahora, [NOMBRE], es momento de empezar a evaluar la información con criterios de verdad y lógica.',
    desbloqueadoEnNivel: 'BASIC',
    desbloqueadoEnFase: 'JUDGMENT'
  },
  {
    numero: 4,
    titulo: 'Primeras conclusiones',
    contenido: 'Completaste tu primer gran bloque de aprendizaje. [NOMBRE], ya tienes herramientas para analizar la realidad de forma más precisa.',
    desbloqueadoEnNivel: 'BASIC',
    desbloqueadoEnFase: 'FINISHED'
  },
  {
    numero: 5,
    titulo: 'Nuevos horizontes',
    contenido: 'En este nivel intermedio, los desafíos son mayores. [NOMBRE], prepárate para cuestionar y profundizar en cada dato que encuentres.',
    desbloqueadoEnNivel: 'INTERMEDIATE',
    desbloqueadoEnFase: 'EVALUATION'
  },
  {
    numero: 6,
    titulo: 'Crecimiento intelectual',
    contenido: 'Tu pensamiento se vuelve más complejo y estructurado. [NOMBRE], estás demostrando que el análisis es una habilidad que se cultiva con práctica y atención.',
    desbloqueadoEnNivel: 'INTERMEDIATE',
    desbloqueadoEnFase: 'FINISHED'
  },
  {
    numero: 7,
    titulo: 'Hacia la maestría',
    contenido: 'Estás en el nivel avanzado. [NOMBRE], tu capacidad para evaluar perspectivas múltiples es fundamental para un liderazgo basado en la verdad.',
    desbloqueadoEnNivel: 'ADVANCED',
    desbloqueadoEnFase: 'EVALUATION'
  },
  {
    numero: 8,
    titulo: 'El viaje continúa',
    contenido: 'Has llegado al final de este recorrido, pero el aprendizaje nunca termina. [NOMBRE], el pensamiento crítico te acompañará en cada decisión de tu vida.',
    desbloqueadoEnNivel: 'ADVANCED',
    desbloqueadoEnFase: 'FINISHED'
  }
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const level = query.level as Level
  const phase = query.phase as Phase
  const chapterNumber = query.chapter ? parseInt(query.chapter as string) : undefined

  try {
    // Intentar buscar en DB real primero
    const chapterFromDb = await prisma.narrativeChapter.findFirst({
      where: chapterNumber ? { numero: chapterNumber } : { desbloqueadoEnNivel: level, desbloqueadoEnFase: phase }
    })

    if (chapterFromDb) return { success: true, data: chapterFromDb }

    // Fallback a la base de datos estática del manual (Mock dinámico)
    const chapter = chapterNumber 
      ? NARRATIVE_DB.find(c => c.numero === chapterNumber)
      : NARRATIVE_DB.find(c => c.desbloqueadoEnNivel === level && c.desbloqueadoEnFase === phase)

    const session = await getUserSession(event)
    const studentName = session.user?.name || 'Estudiante'

    const finalData = chapterFromDb || chapter
    if (!finalData) {
       return { success: false, message: 'Capítulo no encontrado' }
    }

    // Personalizar el contenido (Sección 4.2)
    const personalizedContent = finalData.contenido.replace(/\[NOMBRE\]/g, studentName)

    return {
      success: true,
      data: {
        ...finalData,
        contenido: personalizedContent
      }
    }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
})
