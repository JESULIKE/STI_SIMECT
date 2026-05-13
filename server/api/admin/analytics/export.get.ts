import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
    throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' })
  }

  try {
    const attempts = await prisma.activityAttempt.findMany({
      include: {
        studentProfile: { include: { user: true } },
        activity: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Crear cabecera del CSV
    let csv = 'ID_ESTUDIANTE,NOMBRE,CODIGO,ACTIVIDAD,NIVEL,FASE,PUNTAJE,TIEMPO_SEGUNDOS,FECHA\n'

    // Llenar datos
    attempts.forEach(a => {
      const row = [
        a.studentProfile.id,
        `"${a.studentProfile.user.name}"`,
        a.studentProfile.codigoEstudiantil || 'N/A',
        `"${a.activity.titulo}"`,
        a.activity.nivel,
        a.activity.fase,
        a.puntajeObtenido,
        a.tiempoSegundos,
        a.createdAt.toISOString()
      ]
      csv += row.join(',') + '\n'
    })

    // Configurar cabeceras de respuesta para descarga
    setHeaders(event, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="SIMECT_Investigacion_Datos.csv"'
    })

    return csv

  } catch (error) {
    console.error('Error exportando CSV:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al generar exportación' })
  }
})
