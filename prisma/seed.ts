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
      code: 'DOC-000',
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
      code: 'EST-000',
      name: 'Jesus Estudiante',
      password: commonPassword,
      role: Role.STUDENT,
      studentProfile: {
        create: {
          codigoEstudiantil: 'EST-000',
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

  // 3. Sembrar las 14 insignias oficiales (Sección 9.3)
  const badges = [
    { nombre: 'Primer Paso',            descripcion: 'Has comenzado tu viaje de pensamiento crítico. ¡Este es el primer paso hacia la conciencia ambiental!', icono: '🌱', condiciones: { type: 'FIRST_ACTIVITY' } },
    { nombre: 'Analista',               descripcion: 'Dominas el análisis de información. Has demostrado capacidad para identificar hechos relevantes y separar datos de opiniones.', icono: '🔍', condiciones: { type: 'PHASE_COMPLETE', phase: 'ANALYSIS' } },
    { nombre: 'Evaluador Crítico',      descripcion: 'Tu capacidad de evaluar información es sobresaliente. Puedes determinar la credibilidad de las fuentes con precisión.', icono: '⚖️', condiciones: { type: 'PHASE_COMPLETE', phase: 'EVALUATION' } },
    { nombre: 'Juez Razonado',          descripcion: 'Formulas juicios argumentados con excelencia. Tu pensamiento crítico está plenamente desarrollado.', icono: '📝', condiciones: { type: 'PHASE_COMPLETE', phase: 'JUDGMENT' } },
    { nombre: 'Guardián del Bosque',    descripcion: 'Has dominado el pensamiento básico sobre la deforestación y las inundaciones. ¡Eres un guardián de los ecosistemas!', icono: '🌲', condiciones: { type: 'LEVEL_COMPLETE', level: 'BASIC' } },
    { nombre: 'Defensor del Ecosistema', descripcion: 'Tu pensamiento crítico de nivel intermedio te permite analizar complejos problemas ambientales. ¡Eres un verdadero defensor!', icono: '🌿', condiciones: { type: 'LEVEL_COMPLETE', level: 'INTERMEDIATE' } },
    { nombre: 'Héroe Ambiental',        descripcion: '¡Has alcanzado el dominio completo del pensamiento crítico ambiental! Eres un héroe de la conciencia ecológica de Montería.', icono: '🦸', condiciones: { type: 'LEVEL_COMPLETE', level: 'ADVANCED' } },
    { nombre: 'Mente Reflexiva',        descripcion: 'La práctica constante de la metacognición te ha convertido en un pensador más consciente de sus propios procesos mentales.', icono: '🧘', condiciones: { type: 'REFLECTIONS_COUNT', count: 10 } },
    { nombre: 'Constante',              descripcion: 'La disciplina y regularidad son tus fortalezas. Mantuviste 3 días consecutivos de práctica.', icono: '🔥', condiciones: { type: 'STREAK', days: 3 } },
    { nombre: 'Dedicado',               descripcion: 'Tu compromiso sostenido con el aprendizaje es admirable. ¡7 días consecutivos de práctica intelectual!', icono: '💎', condiciones: { type: 'STREAK', days: 7 } },
    { nombre: 'Perfección',             descripcion: 'Obtuviste el máximo desempeño posible en una actividad. ¡El análisis perfecto es una habilidad excepcional!', icono: '⭐', condiciones: { type: 'PERFECT_SCORE' } },
    { nombre: 'Mente Ágil',             descripcion: 'Tu velocidad combinada con precisión es impresionante. Completaste 5 actividades en menos de 90 segundos con más del 85% de acierto.', icono: '⚡', condiciones: { type: 'SPEED_ACCURACY', count: 5, maxSeconds: 90, minScore: 85 } },
    { nombre: 'Persistente',            descripcion: 'Superaste una actividad de refuerzo en tu primer intento. ¡La resiliencia cognitiva es tu poder!', icono: '💪', condiciones: { type: 'REINFORCEMENT_FIRST_TRY', minScore: 80 } },
    { nombre: 'Autoconocimiento',       descripcion: 'Tu calibración metacognitiva precisa y consistente demuestra un alto nivel de autoconocimiento intelectual.', icono: '🪞', condiciones: { type: 'PRECISE_CALIBRATION', count: 5 } },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { nombre: badge.nombre },
      update: { descripcion: badge.descripcion, icono: badge.icono, condiciones: badge.condiciones },
      create: badge
    })
  }
  console.log(`- ${badges.length} insignias oficiales sembradas`)

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

  // 9. Actividad: AN_1.2_B1 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Identificación de Acción',
      descripcion: 'Identifica la propuesta principal o curso de acción defendido en el texto.',
      fase: Phase.ANALYSIS,
      subPhase: '1.2',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Debemos evacuar el barrio para proteger a los niños y ancianos."',
        pregunta: 'Identifica la propuesta o acción principal sugerida:',
        opciones: [
          { 
            id: 'a', 
            texto: 'Evacuar el barrio', 
            justa: '¡Muy bien! Identificaste la acción principal del mensaje. Estás reconociendo propuestas concretas.' 
          },
          { 
            id: 'b', 
            texto: 'Proteger casas', 
            justa: 'Esa idea aparece relacionada, pero revisa cuál es la acción específica sugerida.' 
          },
          { 
            id: 'c', 
            texto: 'Ayudar vecinos', 
            justa: 'Piensa cuál es la medida inmediata planteada en el texto.' 
          },
          { 
            id: 'd', 
            texto: 'Esperar instrucciones', 
            justa: 'La propuesta implica actuar, no esperar.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 10. Actividad: AN_1.2_B2 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Población Prioritaria',
      descripcion: 'Analiza el propósito de protección en las acciones propuestas.',
      fase: Phase.ANALYSIS,
      subPhase: '1.2',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Debemos evacuar para proteger a niños y ancianos prioritariamente."',
        pregunta: '¿A quiénes se busca proteger principalmente según el texto?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Niños y ancianos', 
            justa: '¡Excelente! Identificaste la población prioritaria.' 
          },
          { 
            id: 'b', 
            texto: 'Toda la comunidad', 
            justa: 'La comunidad puede verse afectada, pero revisa quiénes se mencionan específicamente. Observa cuidadosamente los grupos nombrados en el mensaje.' 
          },
          { 
            id: 'c', 
            texto: 'Adultos', 
            justa: 'Observa cuidadosamente los grupos nombrados en el mensaje.' 
          },
          { 
            id: 'd', 
            texto: 'autoridades', 
            justa: 'Las autoridades coordinan la acción, pero no son la población vulnerable a proteger mencionada en el texto.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 11. Actividad: AN_1.2_M1 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Opción Defendida',
      descripcion: 'Identifica la solución o postura principal que defiende el autor.',
      fase: Phase.ANALYSIS,
      subPhase: '1.2',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Poner costales de arena es mejor que salir, porque así cuidamos las casas."',
        pregunta: 'Identifica la opción o solución defendida por el autor:',
        opciones: [
          { 
            id: 'a', 
            texto: 'Poner costales', 
            justa: '¡Correcto! Reconociste la solución defendida.' 
          },
          { 
            id: 'b', 
            texto: 'Evacuar', 
            justa: 'La evacuación es otra alternativa, pero revisa cuál apoya el autor.' 
          },
          { 
            id: 'c', 
            texto: 'Esperar ayuda', 
            justa: 'El texto propone una acción inmediata, no esperar.' 
          },
          { 
            id: 'd', 
            texto: 'Ignorar la situación', 
            justa: 'El autor sí plantea una medida para actuar frente al problema.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 12. Actividad: AN_1.2_M2 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Argumento Justificativo',
      descripcion: 'Identifica la razón o argumento que da peso a la opción elegida.',
      fase: Phase.ANALYSIS,
      subPhase: '1.2',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Poner costales es mejor para evitar que el agua dañe los muebles."',
        pregunta: '¿Cuál es la razón (argumento) que justifica la opción elegida?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Cuidar los bienes', 
            justa: '¡Muy bien! Identificaste el argumento principal.' 
          },
          { 
            id: 'b', 
            texto: 'Salvar vidas', 
            justa: 'Ese sería otro objetivo importante, pero revisa qué justificación menciona el texto.' 
          },
          { 
            id: 'c', 
            texto: 'Evitar evacuación', 
            justa: 'Piensa cuál es la razón directa relacionada con los muebles y las casas.' 
          },
          { 
            id: 'd', 
            texto: 'Seguir instrucciones', 
            justa: 'El argumento se relaciona con proteger pertenencias materiales.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 13. Actividad: AN_1.2_A1 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Opción a Largo Plazo',
      descripcion: 'Identifica soluciones sostenibles y preventivas en el tiempo.',
      fase: Phase.ANALYSIS,
      subPhase: '1.2',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Reubicar familias es costoso hoy, pero evita tragedias cíclicas cada invierno."',
        pregunta: 'Identifica la opción de largo plazo mencionada en el texto:',
        opciones: [
          { 
            id: 'a', 
            texto: 'Reubicar familias', 
            justa: '¡Excelente análisis! Identificaste una solución preventiva de largo plazo.' 
          },
          { 
            id: 'b', 
            texto: 'Evitar el invierno', 
            justa: 'El clima no se puede evitar; piensa en la opción de infraestructura propuesta.' 
          },
          { 
            id: 'c', 
            texto: 'Incurrir en costos', 
            justa: 'Ese es un obstáculo financiero a corto plazo, no la propuesta preventiva a largo plazo.' 
          },
          { 
            id: 'd', 
            texto: 'Tragedias cíclicas', 
            justa: 'Ese es el problema recurrentemente que se busca prevenir, no la opción sugerida.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 14. Actividad: AN_1.2_A2 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Desventaja de Largo Plazo',
      descripcion: 'Evalúa las dificultades y argumentos en contra en las propuestas complejas.',
      fase: Phase.ANALYSIS,
      subPhase: '1.2',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Reubicar familias implica una inversión muy alta en este momento."',
        pregunta: '¿Cuál es el argumento en contra (desventaja) mencionado?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Es costoso hoy', 
            justa: '¡Correcto! Reconociste la desventaja planteada.' 
          },
          { 
            id: 'b', 
            texto: 'Económico', 
            justa: 'Tu respuesta se relaciona con dinero, pero revisa cómo aparece expresado el argumento.' 
          },
          { 
            id: 'c', 
            texto: 'Altamente costoso', 
            justa: 'Vas cerca. Busca la expresión exacta mencionada en el texto.' 
          },
          { 
            id: 'd', 
            texto: 'Barato', 
            justa: 'Revisa nuevamente: el texto presenta una dificultad económica, no una ventaja.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 15. Actividad: EV_2.1_B1 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Firma Institucional',
      descripcion: 'Identifica qué fuentes poseen respaldo formal y responsable.',
      fase: Phase.EVALUATION,
      subPhase: '2.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Audio WhatsApp: \'Se rompió la represa\'. Boletín Alcaldía: \'Estable\'."',
        pregunta: '¿Cuál fuente tiene una firma institucional y responsable?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Boletín oficial de la Alcaldía', 
            justa: '¡Excelente! Identificaste la fuente con respaldo institucional. Estás aprendiendo a verificar información confiable.' 
          },
          { 
            id: 'b', 
            texto: 'Audio de WhatsApp', 
            justa: 'El audio de WhatsApp no tiene firma institucional responsable y carece de verificación oficial.' 
          },
          { 
            id: 'c', 
            texto: 'Entidad gubernamental', 
            justa: 'Vas cerca, pero busca el tipo específico de fuente mencionado en el reporte.' 
          },
          { 
            id: 'd', 
            texto: 'Comunicado', 
            justa: 'Revisa cuál opción representa un documento emitido oficialmente en el texto.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 16. Actividad: EV_2.1_B2 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Fuente sin Respaldo',
      descripcion: 'Evalúa la veracidad de mensajes informales sin autoría.',
      fase: Phase.EVALUATION,
      subPhase: '2.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"WhatsApp anónimo vs Comunicado Oficial de Montería."',
        pregunta: '¿Cuál de las dos fuentes es anónima y sin respaldo?',
        opciones: [
          { 
            id: 'a', 
            texto: 'WhatsApp', 
            justa: '¡Correcto! Reconociste la fuente sin verificación oficial. Cada vez evalúas mejor la credibilidad.' 
          },
          { 
            id: 'b', 
            texto: 'Mensaje anónimo', 
            justa: 'La idea es correcta, pero identifica específicamente la fuente mencionada.' 
          },
          { 
            id: 'c', 
            texto: 'Cadena de WhatsApp', 
            justa: 'Vas por buen camino. Busca la opción más directa.' 
          },
          { 
            id: 'd', 
            texto: 'Chat sin autor', 
            justa: 'Piensa en qué medio circulaba originalmente el mensaje.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 17. Actividad: EV_2.1_M1 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Experto Técnico',
      descripcion: 'Compara opiniones no calificadas contra reportes de especialistas.',
      fase: Phase.EVALUATION,
      subPhase: '2.1',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Testimonio de un vecino afectado vs Informe de un ingeniero."',
        pregunta: '¿Quién es el experto técnico capacitado en el tema?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Ingeniero', 
            justa: '¡Muy bien! Identificaste al profesional con formación técnica. Estás diferenciando experiencia de conocimiento especializado.' 
          },
          { 
            id: 'b', 
            texto: 'Profesional técnico', 
            justa: 'La idea es correcta, pero revisa qué profesión específica aparece en el texto.' 
          },
          { 
            id: 'c', 
            texto: 'Especialista', 
            justa: 'Busca el cargo técnico exacto mencionado.' 
          },
          { 
            id: 'd', 
            texto: 'Vecino afectado', 
            justa: 'Vivir la situación no necesariamente significa tener conocimientos técnicos.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 18. Actividad: EV_2.1_M2 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Emociones vs Datos',
      descripcion: 'Distingue juicios impulsados por la emoción de reportes fácticos.',
      fase: Phase.EVALUATION,
      subPhase: '2.1',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Vecino: \'El agua subió por culpa de las obras\'. Ingeniero: \'Por lluvia\'."',
        pregunta: '¿Cuál fuente se basa principalmente en la emoción del momento?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Vecino afectado', 
            justa: '¡Correcto! Reconociste una opinión influenciada por la experiencia personal. Tu análisis crítico está mejorando.' 
          },
          { 
            id: 'b', 
            texto: 'Ingeniero', 
            justa: 'El ingeniero basa su explicación en datos técnicos. Revisa quién habla desde la experiencia emocional.' 
          },
          { 
            id: 'c', 
            texto: 'Opinión', 
            justa: 'La respuesta describe el tipo de mensaje, pero identifica quién lo expresa.' 
          },
          { 
            id: 'd', 
            texto: 'Persona afectada', 
            justa: 'Vas cerca. Busca la opción exacta relacionada con el testimonio.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 19. Actividad: EV_2.1_A1 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Interés Electoral',
      descripcion: 'Evalúa sesgos motivados por intereses políticos en las laderas.',
      fase: Phase.EVALUATION,
      subPhase: '2.1',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Científico de la Universidad vs Candidato a la Alcaldía en barrio."',
        pregunta: '¿Cuál fuente podría tener un interés electoral en su discurso?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Candidato', 
            justa: '¡Excelente análisis! Detectaste un posible interés político. Estás evaluando intenciones detrás del discurso.' 
          },
          { 
            id: 'b', 
            texto: 'Político', 
            justa: 'Tu respuesta se relaciona con el tema, pero revisa quién participa directamente en campaña.' 
          },
          { 
            id: 'c', 
            texto: 'Aspirante', 
            justa: 'Vas bien. Busca el término exacto utilizado.' 
          },
          { 
            id: 'd', 
            texto: 'Campaña electoral', 
            justa: 'La campaña es el contexto, pero identifica la persona involucrada.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 20. Actividad: EV_2.1_A2 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Neutralidad Académica',
      descripcion: 'Compara la objetividad universitaria contra discursos de proselitismo.',
      fase: Phase.EVALUATION,
      subPhase: '2.1',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Estudio hidrológico de un científico vs Discurso de político en zona afectada."',
        pregunta: '¿Cuál de las fuentes ofrece mayor neutralidad académica?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Científico', 
            justa: '¡Muy bien! Reconociste la fuente más objetiva y técnica. Estás fortaleciendo tu evaluación crítica.' 
          },
          { 
            id: 'b', 
            texto: 'Universidad', 
            justa: 'La universidad respalda el estudio, pero revisa quién realiza directamente la investigación.' 
          },
          { 
            id: 'c', 
            texto: 'Estudio hidrológico', 
            justa: 'El estudio contiene la información, pero identifica quién aporta la neutralidad académica.' 
          },
          { 
            id: 'd', 
            texto: 'Investigador', 
            justa: 'Tu respuesta es cercana, pero busca el término exacto usado en el texto.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 21. Actividad: EV_2.2_B1 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Causa y Efecto Simple',
      descripcion: 'Identifica y evalúa relaciones lógicas básicas de causa y efecto.',
      fase: Phase.EVALUATION,
      subPhase: '2.2',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Llovió mucho en la parte alta, por eso el río se desbordó."',
        pregunta: '¿La lluvia intensa explica lógicamente el desborde del río?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Sí', 
            justa: '¡Correcto! Identificaste una relación lógica de causa y efecto. Estás comprendiendo conexiones entre fenómenos.' 
          },
          { 
            id: 'b', 
            texto: 'No', 
            justa: 'Piensa cómo el aumento de lluvia puede afectar el nivel del río.' 
          },
          { 
            id: 'c', 
            texto: 'Tal vez, depende del día', 
            justa: 'La lógica física de causa-efecto se mantiene, la lluvia directa incrementa el caudal del río. Analiza con mayor rigurosidad.' 
          },
          { 
            id: 'd', 
            texto: 'No hay relación alguna', 
            justa: 'La lluvia y el caudal de los ríos están conectados directamente. Revisa los principios físicos elementales.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 22. Actividad: EV_2.2_B2 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Identificar la Causa',
      descripcion: 'Extrae la causa en argumentos de flujo simple.',
      fase: Phase.EVALUATION,
      subPhase: '2.2',
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Lluvias intensas -> Inundación de calles."',
        pregunta: 'Identifica la causa en este argumento simple.',
        opciones: [
          { 
            id: 'a', 
            texto: 'Lluvias intensas', 
            justa: '¡Muy bien! Reconociste la causa principal del argumento. Estás identificando relaciones lógicas correctamente.' 
          },
          { 
            id: 'b', 
            texto: 'Fuertes lluvias', 
            justa: 'Tu respuesta es cercana. Busca la expresión exacta presentada.' 
          },
          { 
            id: 'c', 
            texto: 'Precipitaciones intensas.', 
            justa: 'La idea es correcta, pero revisa cómo aparece redactada en el texto.' 
          },
          { 
            id: 'd', 
            texto: 'Inundación de calles', 
            justa: 'Ese es el efecto resultante (consecuencia), no la causa que lo origina.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 23. Actividad: EV_2.2_M1 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Garantía Temporal',
      descripcion: 'Evalúa la validez de proyecciones basadas únicamente en el pasado.',
      fase: Phase.EVALUATION,
      subPhase: '2.2',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"En 2010 no se inundó mi casa, así que ahora tampoco pasará nada."',
        pregunta: '¿El hecho de que no pasara antes asegura que no pasará hoy?',
        opciones: [
          { 
            id: 'a', 
            texto: 'No', 
            justa: '¡Excelente! Reconociste que el pasado no garantiza el futuro. Tu razonamiento está siendo más crítico.' 
          },
          { 
            id: 'b', 
            texto: 'Sí', 
            justa: 'Las condiciones pueden cambiar con el tiempo. Revisa si existe evidencia suficiente para estar seguro.' 
          },
          { 
            id: 'c', 
            texto: 'Es muy probable que sí', 
            justa: 'El clima y la infraestructura urbana varían considerablemente. No te fíes de la inercia temporal.' 
          },
          { 
            id: 'd', 
            texto: 'Depende solo de la suerte', 
            justa: 'El análisis de riesgo se basa en variables medibles, no en el azar. Busca una respuesta con mayor rigor crítico.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 24. Actividad: EV_2.2_M2 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Falla Lógica y Confianza',
      descripcion: 'Detecta el sesgo de falsa seguridad en razonamientos de autoprotección.',
      fase: Phase.EVALUATION,
      subPhase: '2.2',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Mi casa es alta, nunca le llegará el agua."',
        pregunta: '¿Cuál es la falla lógica: basarse en datos o en falsa seguridad?',
        opciones: [
          { 
            id: 'a', 
            texto: 'Falsa seguridad', 
            justa: '¡Correcto! Detectaste exceso de confianza en el razonamiento. Cada vez identificas mejor los errores lógicos.' 
          },
          { 
            id: 'b', 
            texto: 'Exceso de confianza', 
            justa: 'Tu respuesta se relaciona con la idea correcta. Revisa cuál concepto engloba esa actitud.' 
          },
          { 
            id: 'c', 
            texto: 'Suposición sin evidencia', 
            justa: 'La afirmación tiene poca evidencia, pero piensa especialmente en la confianza absoluta del hablante.' 
          },
          { 
            id: 'd', 
            texto: 'Basarse en datos históricos', 
            justa: 'El argumento carece de datos o registros históricos objetivos de niveles de inundación.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 25. Actividad: EV_2.2_A1 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Identificación de Conclusión',
      descripcion: 'Extrae conclusiones explícitas en argumentos complejos de falsa correlación.',
      fase: Phase.EVALUATION,
      subPhase: '2.2',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Si no lloviera, no habría pobres; por tanto, la lluvia causa pobreza."',
        pregunta: 'Identifica la conclusión final del argumento expuesto.',
        opciones: [
          { 
            id: 'a', 
            texto: 'Lluvia causa pobreza', 
            justa: '¡Excelente análisis! Identificaste la conclusión principal del argumento. Estás comprendiendo estructuras argumentativas complejas.' 
          },
          { 
            id: 'b', 
            texto: 'La pobreza fue causada por la lluvia', 
            justa: 'Tu respuesta es cercana, pero revisa la conclusión exacta planteada.' 
          },
          { 
            id: 'c', 
            texto: 'La lluvia es mala para la economía', 
            justa: 'El texto no menciona la economía en general, busca la afirmación conclusiva literal.' 
          },
          { 
            id: 'd', 
            texto: 'Si llueve, las personas se empobrecen', 
            justa: 'Revisa la estructura sintáctica exacta del argumento presentado para dar con la conclusión formal.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
    }
  })

  // 26. Actividad: EV_2.2_A2 (Alto)
  await prisma.activity.create({
    data: {
      titulo: 'Causalidad vs Correlación',
      descripcion: 'Evalúa la validez real de nexos causales en argumentos complejos.',
      fase: Phase.EVALUATION,
      subPhase: '2.2',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      puntajeMaximo: 100,
      contenido: {
        texto: '"Lluvia -> Pobreza."',
        pregunta: '¿Existe una conexión real y directa de causa entre estos dos?',
        opciones: [
          { 
            id: 'a', 
            texto: 'No, es una correlación falsa', 
            justa: '¡Excelente razonamiento! Identificaste que asociar lluvia directamente como causa de la pobreza es una falacia (causa falsa / cum hoc ergo propter hoc). Estás demostrando un pensamiento crítico y analítico excepcional.' 
          },
          { 
            id: 'b', 
            texto: 'Sí, es una relación causal directa', 
            justa: 'La pobreza es un fenómeno social multivariable. No se le puede atribuir una sola causa física directa como la lluvia.' 
          },
          { 
            id: 'c', 
            texto: 'Sí, porque la lluvia destruye cultivos', 
            justa: 'Aunque puede afectar la agricultura en ciertos contextos, no existe una conexión causal general y directa.' 
          },
          { 
            id: 'd', 
            texto: 'Es una relación puramente casual', 
            justa: 'Más que una casualidad, es un error lógico de argumentación que confunde correlación con causalidad.' 
          }
        ]
      },
      claveRespuestas: {
        correcta: 'a'
      }
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
