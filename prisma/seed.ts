import { PrismaClient, Role, Level, Phase, ActivityType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de la base de datos...')

  // 1. Limpiar base de datos
  await prisma.errorPattern.deleteMany()
  await prisma.earnedBadge.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.reflection.deleteMany()
  await prisma.metacognitionChecklist.deleteMany()
  await prisma.activityAttempt.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.sessionLog.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.user.deleteMany()

  // 2. Crear usuarios base
  const commonPassword = await bcrypt.hash('Jesu123', 10)

  // 2. Crear usuario docente
  const teacherUser = await prisma.user.create({
    data: {
      email: 'jesus@simect.com',
      code: 'DOC-001',
      name: 'Jesus Gonzalez',
      password: commonPassword,
      role: Role.TEACHER,
    },
    include: { studentProfile: false }
  })
  console.log(`- Docente: Email: ${teacherUser.email} / Code: ${teacherUser.code} / Pass: Jesu123`)

  // 2. Crear usuario estudiante
  const studentUser = await prisma.user.create({
    data: {
      email: 'jesus.estudiante@simect.com',
      code: 'EST-001',
      name: 'Jesus Estudiante',
      password: commonPassword,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          codigoEstudiantil: 'EST-001',
          institucion: 'Colegio Experimental SIMECT',
          totalPoints: 0,
          currentStreak: 0
        }
      }
    },
    include: {
      studentProfile: true
    }
  })
  console.log(`- Estudiante: Email: ${studentUser.email} / Code: ${studentUser.code} / Pass: Jesu123`)


  // 3. Crear Primera Actividad: AN_1.1_B1 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Identificación de Datos',
      descripcion: 'Lee el siguiente reporte y responde con precisión.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana."',
        pregunta: 'Identifica la cifra exacta del nivel del río:',
        opciones: [
          { 
            id: 'a', 
            texto: '7.5 metros', 
            justa: '¡Excelente! Identificaste correctamente el dato exacto del reporte. Vas fortaleciendo tu precisión al analizar información.' 
          },
          { 
            id: 'b', 
            texto: '7 metros', 
            justa: 'Revisa cuidadosamente el número decimal mencionado en el texto. Los detalles hacen la diferencia.' 
          },
          { 
            id: 'c', 
            texto: '7.5', 
            justa: 'La cifra es correcta, pero falta incluir la unidad de medida. Ya casi lo logras.' 
          },
          { 
            id: 'd', 
            texto: 'Nivel crítico', 
            justa: 'La pregunta solicita un dato exacto, no una interpretación de la situación. Busca siempre información verificable.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 4. Crear Segunda Actividad: AN_1.1_B2 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Unidad de Medida',
      descripcion: 'Identifica los aspectos técnicos del reporte.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana."',
        pregunta: 'Selecciona la unidad de medida utilizada en el reporte:',
        opciones: [
          { 
            id: 'a', 
            texto: 'Metros', 
            justa: '¡Muy bien! Reconociste correctamente la unidad de medida. Estás identificando datos técnicos con mayor precisión.' 
          },
          { 
            id: 'b', 
            texto: 'Litros', 
            justa: 'Los litros miden volumen. Revisa qué unidad se usa para medir altura o nivel. Sigue analizando cuidadosamente.' 
          },
          { 
            id: 'c', 
            texto: 'Kilómetros', 
            justa: 'Los kilómetros se usan para distancias largas. Piensa cómo se mide el nivel de un río. Cada intento mejora tu análisis.' 
          },
          { 
            id: 'd', 
            texto: 'Nivel', 
            justa: "\"'Nivel' describe una condición, pero no es una unidad de medida. Observa con atención los términos técnicos.\"" 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 5. Crear Tercera Actividad: AN_1.1_M1 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Diferenciación de Datos',
      descripcion: 'Extrae información técnica de reportes meteorológicos.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"El boletín del IDEAM indica lluvias de 40mm/h; el cielo se observa \'muy cargado\'."',
        pregunta: 'Extrae el dato técnico de intensidad de lluvia:',
        opciones: [
          { 
            id: 'a', 
            texto: '40mm/h', 
            justa: '¡Excelente! Identificaste el dato técnico exacto. Estás diferenciando datos objetivos de descripciones generales.' 
          },
          { 
            id: 'b', 
            texto: '40 mm', 
            justa: 'La cifra es correcta, pero revisa cómo aparece expresada la intensidad de lluvia. Vas por buen camino.' 
          },
          { 
            id: 'c', 
            texto: 'Lluvia fuerte', 
            justa: 'Busca el dato técnico medible, no la descripción del clima. Sigue analizando los detalles.' 
          },
          { 
            id: 'd', 
            texto: 'IDEAM', 
            justa: 'IDEAM es la entidad que informa, pero la pregunta pide la intensidad de lluvia. Lee cuidadosamente qué solicita la pregunta.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 6. Crear Cuarta Actividad: AN_1.1_M2 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Identificación de la Fuente',
      descripcion: 'Identifica la autoridad técnica detrás de la información.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"El boletín del IDEAM indica lluvias de 40mm/h."',
        pregunta: '¿Qué entidad emite la información técnica?',
        opciones: [
          { 
            id: 'a', 
            texto: 'IDEAM', 
            justa: '¡Muy bien! Reconociste la fuente técnica oficial. Identificar fuentes confiables fortalece tu análisis.' 
          },
          { 
            id: 'b', 
            texto: 'Alcaldía', 
            justa: 'La alcaldía puede comunicar información, pero revisa quién genera el reporte técnico climático.' 
          },
          { 
            id: 'c', 
            texto: 'Noticias', 
            justa: 'Los medios difunden información, pero no siempre producen los datos científicos.' 
          },
          { 
            id: 'd', 
            texto: 'Comunidad', 
            justa: 'La comunidad comparte experiencias, pero revisa qué entidad realiza mediciones oficiales.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 7. Crear Quinta Actividad: AN_1.1_A1 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Presión Atmosférica',
      descripcion: 'Identifica datos científicos complejos en reportes técnicos.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"La presión de 1012 hPa y la saturación del suelo al 90% sugieren riesgo."',
        pregunta: 'Identifica la medida exacta de presión atmosférica:',
        opciones: [
          { 
            id: 'a', 
            texto: '1012 hPa', 
            justa: '¡Excelente precisión! Identificaste correctamente la medida atmosférica. Tu análisis técnico está avanzando.' 
          },
          { 
            id: 'b', 
            texto: '1012', 
            justa: 'La cifra es correcta, pero revisa la unidad científica utilizada.' 
          },
          { 
            id: 'c', 
            texto: '90%', 
            justa: 'Ese dato corresponde a la saturación del suelo, no a la presión atmosférica.' 
          },
          { 
            id: 'd', 
            texto: 'Presión alta', 
            justa: 'La pregunta solicita el valor exacto, no una conclusión.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 8. Crear Sexta Actividad: AN_1.1_A2 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Saturación del Suelo',
      descripcion: 'Analiza porcentajes técnicos en terrenos de riesgo.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"La saturación del suelo ha llegado al 90% en las laderas."',
        pregunta: '¿Qué porcentaje de saturación tiene el suelo?',
        opciones: [
          { 
            id: 'a', 
            texto: '90%', 
            justa: '¡Correcto! Reconociste el porcentaje exacto. Estás interpretando datos técnicos con precisión.' 
          },
          { 
            id: 'b', 
            texto: '100%', 
            justa: 'Revisa nuevamente el porcentaje mencionado en el texto.' 
          },
          { 
            id: 'c', 
            texto: '50%', 
            justa: 'Observa cuidadosamente el valor numérico presentado.' 
          },
          { 
            id: 'd', 
            texto: 'Alta', 
            justa: 'La pregunta pide un porcentaje específico, no una descripción.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 9. Actividad B3 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Registro de Temperatura',
      descripcion: 'Identifica los valores térmicos del reporte.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"La temperatura en el Valle del Sinú alcanzó los 38°C a las 2 p.m."',
        pregunta: '¿Cuál es el valor numérico de la temperatura reportada?',
        opciones: [
          { id: 'a', texto: '38°C', justa: '¡Excelente! Identificaste el dato preciso con su unidad térmica.' },
          { id: 'b', texto: '2 p.m.', justa: 'Esa es la hora del registro, no el valor de la temperatura.' },
          { id: 'c', texto: '38', justa: 'La cifra es correcta, pero recuerda que en ciencia la unidad (°C) es vital.' },
          { id: 'd', texto: 'Calor extremo', justa: 'Busca el dato técnico numérico, no una descripción del clima.' }
        ]
      },
      claveRespuestas: { correcta: 'a' }
    }
  })

  // 10. Actividad B4 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Nivel de Alerta',
      descripcion: 'Identifica la gravedad de la situación reportada.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"El IDEAM mantiene la alerta roja por incendios en el Caribe."',
        pregunta: '¿Qué tipo de alerta menciona el reporte?',
        opciones: [
          { id: 'a', justa: '¡Correcto! Identificaste el código de color de la alerta máxima.', texto: 'Roja' },
          { id: 'b', justa: 'Revisa el texto, el reporte menciona una alerta más crítica.', texto: 'Amarilla' },
          { id: 'c', justa: 'Ese es el fenómeno (incendios), pero la pregunta pide el tipo de alerta.', texto: 'Incendios' },
          { id: 'd', justa: 'Busca el color específico que define la alerta en el boletín.', texto: 'Informativa' }
        ]
      },
      claveRespuestas: { correcta: 'a' }
    }
  })

  // 11. Actividad B5 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Velocidad del Viento',
      descripcion: 'Extrae datos de movimiento atmosférico.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Se registran vientos de 25 km/h con ráfagas ocasionales."',
        pregunta: 'Identifica la velocidad de los vientos reportada:',
        opciones: [
          { id: 'a', justa: '¡Muy bien! Capturaste la velocidad exacta del viento.', texto: '25 km/h' },
          { id: 'b', justa: 'Ese término describe ráfagas, pero no da el valor de la velocidad constante.', texto: 'Ráfagas' },
          { id: 'c', justa: 'La cifra es correcta, pero falta la unidad de medida (km/h).', texto: '25' },
          { id: 'd', justa: 'Revisa nuevamente el valor numérico en el reporte.', texto: '50 km/h' }
        ]
      },
      claveRespuestas: { correcta: 'a' }
    }
  })

  // 12. Actividad B6 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Humedad Relativa',
      descripcion: 'Identifica la cantidad de vapor de agua en el aire.',
      fase: Phase.ANALYSIS,
      subPhase: '1.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"La humedad relativa en Montería se sitúa en el 85%."',
        pregunta: '¿Cuál es el porcentaje de humedad mencionado?',
        opciones: [
          { id: 'a', justa: '¡Exacto! El 85% es el valor de humedad reportado.', texto: '85%' },
          { id: 'b', justa: 'Ese es el nombre del indicador, no su valor.', texto: 'Humedad' },
          { id: 'c', justa: 'Revisa el número exacto que acompaña al símbolo de porcentaje.', texto: '100%' },
          { id: 'd', justa: 'Busca el valor numérico específico en el texto.', texto: 'Alta' }
        ]
      },
      claveRespuestas: { correcta: 'a' }
    }
  })

  console.log(`Seed completado:`)
  console.log(`- Docente: ${teacherUser.email} / Jesu123`)
  console.log(`- Estudiante: ${studentUser.email} / Jesu123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
