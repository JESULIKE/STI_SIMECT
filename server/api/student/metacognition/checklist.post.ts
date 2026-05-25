import { prisma } from '~/server/utils/prisma'
import { calcularNivelDesdeJOL, NIVEL_LABELS } from '~/server/utils/levelEngine'
import type { Level } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }

  const studentProfileId = session.user.studentProfileId
  const body = await readBody(event)

  try {
    // ── Calcular nivel desde las respuestas JOL ──────────────────────────
    const nivelAsignado: Level = calcularNivelDesdeJOL({
      seguridadSinAyuda:    body.seguridadSinAyuda    ? parseInt(body.seguridadSinAyuda)    : null,
      seguridadTema:        body.seguridadTema        ? parseInt(body.seguridadTema)        : null,
      atencionNumeros:      body.atencionNumeros      ? parseInt(body.atencionNumeros)      : null,
      separacionArgumentos: body.separacionArgumentos ? parseInt(body.separacionArgumentos) : null,
    })

    // ── Guardar checklist + nivel asignado en la BD ──────────────────────
    const checklist = await prisma.metacognitionChecklist.create({
      data: {
        studentProfileId,

        // Datos del Onboarding (primera sesión)
        comprensionSIMECT:  body.comprensionSIMECT  ? parseInt(body.comprensionSIMECT)  : null,
        familiaridadTema:   body.familiaridadTema    ? parseInt(body.familiaridadTema)    : null,

        // Nivel calculado
        nivelAsignado,

        // Preguntas JOL de Planeación Metacognitiva
        seguridadSinAyuda:      body.seguridadSinAyuda      ? parseInt(body.seguridadSinAyuda)      : null,
        seguridadTema:          body.seguridadTema          ? parseInt(body.seguridadTema)          : null,
        tiempoEstimadoFase1:    body.tiempoEstimadoFase1    ? parseInt(body.tiempoEstimadoFase1)    : null,
        atencionNumeros:        body.atencionNumeros        ? parseInt(body.atencionNumeros)        : null,
        separacionArgumentos:   body.separacionArgumentos   ? parseInt(body.separacionArgumentos)   : null,

        // Campos legacy
        queSe:                   body.q1 || null,
        queEsperoAprender:       body.q2 || null,
        confianzaInicial:        body.q3 ? parseInt(body.q3) : null,
        estrategias:             body.q4 ? [body.q4] : null,
        entornoSinDistracciones: body.q5 === true
      }
    })

    // ── Actualizar el nivel actual del estudiante en su perfil ───────────
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { nivelActual: nivelAsignado }
    })

    const nivelInfo = NIVEL_LABELS[nivelAsignado]

    return {
      success: true,
      checklist,
      nivel: {
        code: nivelAsignado,
        label: nivelInfo.label,
        emoji: nivelInfo.emoji,
        color: nivelInfo.color,
        description: nivelInfo.description
      }
    }
  } catch (error) {
    console.error('Error al guardar checklist:', error)
    throw createError({ statusCode: 500, statusMessage: 'Error al guardar planificación' })
  }
})
