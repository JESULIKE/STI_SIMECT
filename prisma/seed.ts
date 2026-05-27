import { PrismaClient, Role, Level, Phase, ActivityType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de la base de datos...')

  // 1. Limpiar base de datos (DESACTIVADO PARA EVITAR PÉRDIDA DE DATOS EN PRODUCCIÓN)

  // 2. Crear usuarios base
  const commonPassword = await bcrypt.hash('Jesu123', 10)

  // 2. Crear usuario docente
  const teacherUser = await prisma.user.upsert({
    where: { email: 'jesus@simect.com' },
    update: { password: commonPassword, name: 'Jesus Gonzalez', code: 'DOC-000', role: Role.TEACHER },
    create: {
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
  const studentUser = await prisma.user.upsert({
    where: { email: 'jesus.estudiante@simect.com' },
    update: { password: commonPassword, name: 'Jesus Estudiante', code: 'EST-000', role: Role.STUDENT },
    create: {
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


  // 3. Actividad Reestructurada: Identificación de hechos (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Identificación de hechos",
      fase: Phase.ANALYSIS,
      subPhase: "1.1",
      nivel: Level.BASIC,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      contenido: {
        "contexto": "El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana.",
        "pregunta": "Completa el espacio en blanco con el dato exacto del texto.",
        "plantilla": "El nivel del río Sinú en Montería alcanzó los _____ esta mañana.",
        "opciones": [
                "7.5 metros",
                "7 metros",
                "Nivel alto",
                "8.5 metros"
        ],
        "pista": "El dato que buscas es un número con decimales seguido de una unidad de medida de longitud."
},
      claveRespuestas: {
        "respuestaExacta": "7.5 metros"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 4. Actividad Reestructurada: Unidades de medida (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Unidades de medida",
      fase: Phase.ANALYSIS,
      subPhase: "1.1",
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      contenido: {
        "contexto": "El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana.",
        "pregunta": "Selecciona la unidad de medida utilizada en el reporte.",
        "opciones": [
                {
                        "id": "1",
                        "texto": "Metros",
                        "esCorrecta": true,
                        "feedback": "¡Muy bien! Reconociste correctamente la unidad de medida. Estás identificando datos técnicos con mayor precisión."
                },
                {
                        "id": "2",
                        "texto": "Litros",
                        "esCorrecta": false,
                        "feedback": "Los litros miden volumen. Revisa qué unidad se usa para medir altura o nivel. Sigue analizando cuidadosamente."
                },
                {
                        "id": "3",
                        "texto": "Kilómetros",
                        "esCorrecta": false,
                        "feedback": "Los kilómetros se usan para distancias largas. Piensa cómo se mide el nivel de un río."
                },
                {
                        "id": "4",
                        "texto": "Nivel",
                        "esCorrecta": false,
                        "feedback": "\"Nivel\" describe una condición, pero no es una unidad de medida. Observa con atención los términos técnicos."
                }
        ],
        "pista": "Las unidades acompañan a los números para decirnos qué se está midiendo (ej. kilos, horas, o en este caso de altura, metros)."
},
      claveRespuestas: {
        "correcta": "1"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 5. Actividad Reestructurada: Datos técnicos vs Generales (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Datos técnicos vs Generales",
      fase: Phase.ANALYSIS,
      subPhase: "1.1",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.TEXT_MARKUP,
      contenido: {
        "contexto": "El boletín del IDEAM indica lluvias de 40mm/h; el cielo se observa 'muy cargado'.",
        "pregunta": "Lee el siguiente texto y subraya únicamente el dato técnico que indica la intensidad de lluvia.",
        "texto": "El boletín del IDEAM indica lluvias de 40mm/h; el cielo se observa muy cargado.",
        "opciones": [
                "40mm/h",
                "muy cargado",
                "El boletín del IDEAM",
                "cielo se observa"
        ],
        "respuestaEsperada": "40mm/h",
        "pista": "Un dato técnico suele llevar números y unidades estandarizadas (como mm/h), a diferencia de las descripciones subjetivas como \"muy cargado\"."
},
      claveRespuestas: {
        "respuestaExacta": "40mm/h"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 6. Actividad Reestructurada: Entidad emisora (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Entidad emisora",
      fase: Phase.ANALYSIS,
      subPhase: "1.1",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MATCHING,
      contenido: {
        "contexto": "El boletín del IDEAM indica lluvias de 40mm/h.",
        "pregunta": "Empareja cada fuente de información con su función principal.",
        "pares": [
                {
                        "id": "A",
                        "izquierda": "IDEAM",
                        "derecha": "Genera datos científicos oficiales"
                },
                {
                        "id": "B",
                        "izquierda": "Alcaldía",
                        "derecha": "Comunica decisiones administrativas"
                },
                {
                        "id": "C",
                        "izquierda": "Medios de comunicación",
                        "derecha": "Difunde información masivamente"
                },
                {
                        "id": "D",
                        "izquierda": "Comunidad",
                        "derecha": "Comparte experiencias locales"
                }
        ],
        "pista": "Identifica las siglas o el nombre de la organización institucional/gubernamental encargada de emitir el boletín."
},
      claveRespuestas: {
        "matching": {
                "A": "Genera datos científicos oficiales",
                "B": "Comunica decisiones administrativas",
                "C": "Difunde información masivamente",
                "D": "Comparte experiencias locales"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 7. Actividad Reestructurada: Medidas complejas (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Medidas complejas",
      fase: Phase.ANALYSIS,
      subPhase: "1.1",
      nivel: Level.ADVANCED,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      contenido: {
        "contexto": "La presión de 1012 hPa y la saturación del suelo al 90% sugieren riesgo.",
        "pregunta": "Completa el espacio con la medida exacta de presión atmosférica.",
        "plantilla": "La presión atmosférica registrada es de _____ y la saturación del suelo es del 90%.",
        "opciones": [
                "1012 hPa",
                "90%",
                "1000 hPa",
                "Alta presión"
        ],
        "pista": "\"hPa\" es la unidad de presión (hectopascales), mientras que el \"%\" se usa para la saturación del suelo."
},
      claveRespuestas: {
        "respuestaExacta": "1012 hPa"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 8. Actividad Reestructurada: Porcentaje de saturación (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Porcentaje de saturación",
      fase: Phase.ANALYSIS,
      subPhase: "1.1",
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      contenido: {
        "contexto": "La saturación del suelo ha llegado al 90% en las laderas.",
        "pregunta": "¿Qué porcentaje de saturación tiene el suelo?",
        "opciones": [
                {
                        "id": "1",
                        "texto": "90%",
                        "esCorrecta": true,
                        "feedback": "¡Correcto! Reconociste el porcentaje exacto. Estás interpretando datos técnicos con precisión."
                },
                {
                        "id": "2",
                        "texto": "100%",
                        "esCorrecta": false,
                        "feedback": "Revisa nuevamente el porcentaje mencionado en el texto."
                },
                {
                        "id": "3",
                        "texto": "50%",
                        "esCorrecta": false,
                        "feedback": "Observa cuidadosamente el valor numérico presentado."
                },
                {
                        "id": "4",
                        "texto": "Alta",
                        "esCorrecta": false,
                        "feedback": "La pregunta pide un porcentaje específico, no una descripción cualitativa."
                }
        ],
        "pista": "Revisa detenidamente cuál de los dos valores numéricos viene acompañado explícitamente del símbolo de porcentaje (%)."
},
      claveRespuestas: {
        "correcta": "1"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 9. Actividad Reestructurada: Acciones principales (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Acciones principales",
      fase: Phase.ANALYSIS,
      subPhase: "1.2",
      nivel: Level.BASIC,
      tipo: ActivityType.TEXT_MARKUP,
      contenido: {
        "contexto": "Debemos evacuar el barrio para proteger a los niños y ancianos.",
        "pregunta": "Lee el mensaje y subraya la acción principal que se propone.",
        "texto": "Debemos evacuar el barrio para proteger a los niños y ancianos.",
        "opciones": [
                "evacuar el barrio",
                "Debemos",
                "proteger a los niños",
                "y ancianos"
        ],
        "respuestaEsperada": "evacuar el barrio",
        "pista": "Pregúntate: ¿Qué es la acción concreta e inmediata que el autor afirma que \"debemos\" hacer?"
},
      claveRespuestas: {
        "respuestaExacta": "evacuar el barrio"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 10. Actividad Reestructurada: Población prioritaria (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Población prioritaria",
      fase: Phase.ANALYSIS,
      subPhase: "1.2",
      nivel: Level.BASIC,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      contenido: {
        "contexto": "Debemos evacuar para proteger a niños y ancianos prioritariamente.",
        "pregunta": "¿A quiénes se busca proteger principalmente según el texto?",
        "opciones": [
                {
                        "id": "1",
                        "texto": "Niños y ancianos",
                        "esCorrecta": true,
                        "feedback": "¡Excelente! Identificaste la población prioritaria."
                },
                {
                        "id": "2",
                        "texto": "Toda la comunidad",
                        "esCorrecta": false,
                        "feedback": "La comunidad puede verse afectada, pero revisa quiénes se mencionan específicamente."
                },
                {
                        "id": "3",
                        "texto": "Adultos",
                        "esCorrecta": false,
                        "feedback": "Observa cuidadosamente los grupos nombrados en el mensaje."
                },
                {
                        "id": "4",
                        "texto": "Autoridades",
                        "esCorrecta": false,
                        "feedback": "Las autoridades coordinan, pero el texto habla de quiénes se busca proteger, no quiénes actúan."
                }
        ],
        "pista": "Lee atentamente el final de la oración para encontrar a los dos grupos de personas que se mencionan explícitamente."
},
      claveRespuestas: {
        "correcta": "1"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 11. Actividad Reestructurada: Identificar soluciones (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Identificar soluciones",
      fase: Phase.ANALYSIS,
      subPhase: "1.2",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.DRAG_AND_DROP,
      contenido: {
        "contexto": "Poner costales de arena es mejor que salir, porque así cuidamos las casas.",
        "pregunta": "Arrastra cada elemento al cuadro correcto.",
        "categorias": [
                {
                        "id": "cat1",
                        "label": "Solución defendida por el autor"
                },
                {
                        "id": "cat2",
                        "label": "Alternativa mencionada pero rechazada"
                }
        ],
        "items": [
                {
                        "id": "i1",
                        "texto": "Poner costales de arena",
                        "categoriaCorrecta": "cat1"
                },
                {
                        "id": "i2",
                        "texto": "Evacuar el barrio",
                        "categoriaCorrecta": "cat2"
                }
        ],
        "pista": "El autor compara dos acciones y afirma que una es \"mejor\". Identifica la que él está apoyando."
},
      claveRespuestas: {
        "mapping": {
                "i1": "cat1",
                "i2": "cat2"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 12. Actividad Reestructurada: Argumento de justificación (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Argumento de justificación",
      fase: Phase.ANALYSIS,
      subPhase: "1.2",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.ARROW_MATCHING,
      contenido: {
        "contexto": "Poner costales es mejor para evitar que el agua dañe los muebles.",
        "pregunta": "Une con una flecha cada solución con el argumento que la justifica.",
        "izquierda": [
                {
                        "id": "iz1",
                        "texto": "Poner costales de arena"
                }
        ],
        "derecha": [
                {
                        "id": "de1",
                        "texto": "Salvar vidas"
                },
                {
                        "id": "de2",
                        "texto": "Cuidar los bienes materiales"
                },
                {
                        "id": "de3",
                        "texto": "Seguir instrucciones oficiales"
                }
        ],
        "pista": "Los argumentos justifican la decisión y suelen aparecer para explicar un beneficio (\"para evitar que...\")."
},
      claveRespuestas: {
        "arrows": [
                {
                        "from": "iz1",
                        "to": "de2"
                }
        ]
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 13. Actividad Reestructurada: Largo plazo vs Corto plazo (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Largo plazo vs Corto plazo",
      fase: Phase.ANALYSIS,
      subPhase: "1.2",
      nivel: Level.ADVANCED,
      tipo: ActivityType.CLASSIFICATION,
      contenido: {
        "contexto": "Reubicar familias es costoso hoy, pero evita tragedias cíclicas cada invierno.",
        "pregunta": "Clasifica los siguientes elementos según su horizonte de impacto.",
        "columnas": [
                {
                        "id": "col1",
                        "label": "Solución de corto plazo",
                        "color": "orange"
                },
                {
                        "id": "col2",
                        "label": "Solución de largo plazo",
                        "color": "blue"
                }
        ],
        "items": [
                {
                        "id": "it1",
                        "texto": "Poner costales"
                },
                {
                        "id": "it2",
                        "texto": "Evacuar el barrio temporalmente"
                },
                {
                        "id": "it3",
                        "texto": "Reubicar familias"
                },
                {
                        "id": "it4",
                        "texto": "Cerrar vías temporalmente"
                }
        ],
        "pista": "Busca una acción que, aunque difícil y costosa hoy, tiene un efecto preventivo duradero \"cada invierno\"."
},
      claveRespuestas: {
        "classification": {
                "it1": "col1",
                "it2": "col1",
                "it3": "col2",
                "it4": "col1"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 14. Actividad Reestructurada: Argumento en contra (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Argumento en contra",
      fase: Phase.ANALYSIS,
      subPhase: "1.2",
      nivel: Level.ADVANCED,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      contenido: {
        "contexto": "Reubicar familias implica una inversión muy alta en este momento.",
        "pregunta": "Completa el espacio en blanco según el texto.",
        "plantilla": "Según el texto, el argumento en contra de reubicar familias es que _____.",
        "opciones": [
                "es costoso hoy",
                "toma mucho tiempo",
                "no funciona",
                "es impopular"
        ],
        "pista": "Identifica la dificultad económica explícita que el texto señala como un obstáculo en el tiempo presente."
},
      claveRespuestas: {
        "respuestaExacta": "es costoso hoy"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 15. Actividad Reestructurada: Fuentes Oficiales vs Informales (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Fuentes Oficiales vs Informales",
      fase: Phase.EVALUATION,
      subPhase: "2.1",
      nivel: Level.BASIC,
      tipo: ActivityType.TRAFFIC_LIGHT,
      contenido: {
        "contexto": "Audio WhatsApp: 'Se rompió la represa'. Boletín Alcaldía: 'Estable'.",
        "pregunta": "Evalúa cada fuente y asígnale un color de semáforo según su confiabilidad.",
        "fuentes": [
                {
                        "id": "f1",
                        "nombre": "Audio de WhatsApp anónimo"
                },
                {
                        "id": "f2",
                        "nombre": "Boletín oficial de la Alcaldía de Montería"
                }
        ],
        "pista": "Piensa en cuál de las dos fuentes representa a un ente gubernamental constituido y verificable, frente a un chat privado."
},
      claveRespuestas: {
        "trafficLight": {
                "f1": "red",
                "f2": "green"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 16. Actividad Reestructurada: Fuentes anónimas (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Fuentes anónimas",
      fase: Phase.EVALUATION,
      subPhase: "2.1",
      nivel: Level.BASIC,
      tipo: ActivityType.MATCHING,
      contenido: {
        "contexto": "WhatsApp anónimo vs Comunicado Oficial de Montería.",
        "pregunta": "Empareja cada fuente con su característica principal.",
        "pares": [
                {
                        "id": "A",
                        "izquierda": "WhatsApp anónimo",
                        "derecha": "No tiene autor verificable ni respaldo oficial"
                },
                {
                        "id": "B",
                        "izquierda": "Comunicado Oficial",
                        "derecha": "Tiene autor y respaldo institucional"
                }
        ],
        "pista": "Una fuente anónima es aquella que circula sin el nombre del autor responsable y puede ser creada por cualquiera."
},
      claveRespuestas: {
        "matching": {
                "A": "No tiene autor verificable ni respaldo oficial",
                "B": "Tiene autor y respaldo institucional"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 17. Actividad Reestructurada: Experiencia vs Conocimiento Técnico (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Experiencia vs Conocimiento Técnico",
      fase: Phase.EVALUATION,
      subPhase: "2.1",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      contenido: {
        "contexto": "Testimonio de un vecino afectado vs Informe de un ingeniero.",
        "pregunta": "¿Quién es el experto técnico capacitado en el tema?",
        "opciones": [
                {
                        "id": "1",
                        "texto": "Ingeniero hidráulico",
                        "esCorrecta": true,
                        "feedback": "¡Muy bien! Identificaste al profesional con formación técnica. Estás diferenciando experiencia de conocimiento especializado."
                },
                {
                        "id": "2",
                        "texto": "Vecino afectado",
                        "esCorrecta": false,
                        "feedback": "Vivir la situación no necesariamente significa tener conocimientos técnicos sobre el comportamiento del agua."
                },
                {
                        "id": "3",
                        "texto": "Ambos por igual",
                        "esCorrecta": false,
                        "feedback": "Aunque ambas perspectivas son valiosas, revisa quién tiene formación técnica específica."
                },
                {
                        "id": "4",
                        "texto": "Ninguno es confiable",
                        "esCorrecta": false,
                        "feedback": "El informe técnico de un profesional sí es una fuente confiable en este contexto."
                }
        ],
        "pista": "El experto es quien posee formación académica y técnica comprobable para evaluar estructuras físicas."
},
      claveRespuestas: {
        "correcta": "1"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 18. Actividad Reestructurada: Emoción vs Datos (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Emoción vs Datos",
      fase: Phase.EVALUATION,
      subPhase: "2.1",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.CLASSIFICATION,
      contenido: {
        "contexto": "Vecino: 'El agua subió por culpa de las obras'. Ingeniero: 'Por lluvia'.",
        "pregunta": "Clasifica las siguientes afirmaciones según su tipo.",
        "columnas": [
                {
                        "id": "col1",
                        "label": "Basada en emoción/experiencia personal",
                        "color": "orange"
                },
                {
                        "id": "col2",
                        "label": "Basada en datos técnicos",
                        "color": "blue"
                }
        ],
        "items": [
                {
                        "id": "it1",
                        "texto": "\"El agua subió por las obras\""
                },
                {
                        "id": "it2",
                        "texto": "\"Lluvia acumulada de 40mm/h\""
                },
                {
                        "id": "it3",
                        "texto": "\"Nunca había pasado esto\""
                },
                {
                        "id": "it4",
                        "texto": "\"Saturación del suelo al 90%\""
                }
        ],
        "pista": "El testimonio personal suele generar opiniones válidas pero basadas en la experiencia emocional, no en estudios o mediciones."
},
      claveRespuestas: {
        "classification": {
                "it1": "col1",
                "it2": "col2",
                "it3": "col1",
                "it4": "col2"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 19. Actividad Reestructurada: Intereses Ocultos (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Intereses Ocultos",
      fase: Phase.EVALUATION,
      subPhase: "2.1",
      nivel: Level.ADVANCED,
      tipo: ActivityType.TRAFFIC_LIGHT,
      contenido: {
        "contexto": "Científico de la Universidad vs Candidato a la Alcaldía en barrio.",
        "pregunta": "Evalúa el nivel de neutralidad de cada fuente.",
        "fuentes": [
                {
                        "id": "f1",
                        "nombre": "Candidato político en zona afectada"
                },
                {
                        "id": "f2",
                        "nombre": "Científico universitario (U. de Córdoba)"
                },
                {
                        "id": "f3",
                        "nombre": "Líder comunitario del barrio"
                },
                {
                        "id": "f4",
                        "nombre": "Vocero de ONG internacional"
                }
        ],
        "pista": "Evalúa quién de los personajes tiene un interés particular en ganar la simpatía o los votos de la gente en el barrio."
},
      claveRespuestas: {
        "trafficLight": {
                "f1": "red",
                "f2": "green",
                "f3": "yellow",
                "f4": "yellow"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 20. Actividad Reestructurada: Neutralidad académica (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Neutralidad académica",
      fase: Phase.EVALUATION,
      subPhase: "2.1",
      nivel: Level.ADVANCED,
      tipo: ActivityType.DRAG_AND_DROP,
      contenido: {
        "contexto": "Estudio hidrológico vs Discurso de político en zona afectada.",
        "pregunta": "Arrastra cada fuente al cuadrante que le corresponde según su objetividad y propósito.",
        "categorias": [
                {
                        "id": "cat1",
                        "label": "Alta objetividad / Propósito técnico"
                },
                {
                        "id": "cat2",
                        "label": "Alta subjetividad / Propósito político o emocional"
                }
        ],
        "items": [
                {
                        "id": "i1",
                        "texto": "Estudio hidrológico",
                        "categoriaCorrecta": "cat1"
                },
                {
                        "id": "i2",
                        "texto": "Discurso político en zona",
                        "categoriaCorrecta": "cat2"
                },
                {
                        "id": "i3",
                        "texto": "Testimonio de vecino afectado",
                        "categoriaCorrecta": "cat2"
                },
                {
                        "id": "i4",
                        "texto": "Boletín oficial de la Alcaldía",
                        "categoriaCorrecta": "cat1"
                }
        ],
        "pista": "La neutralidad proviene de investigaciones y mediciones sistemáticas (como un estudio), ajenas a intereses de campaña política."
},
      claveRespuestas: {
        "mapping": {
                "i1": "cat1",
                "i2": "cat2",
                "i3": "cat2",
                "i4": "cat1"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 21. Actividad Reestructurada: Causa y Efecto (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Causa y Efecto",
      fase: Phase.EVALUATION,
      subPhase: "2.2",
      nivel: Level.BASIC,
      tipo: ActivityType.ARROW_MATCHING,
      contenido: {
        "contexto": "Llovió mucho en la parte alta, por eso el río se desbordó.",
        "pregunta": "Une con una flecha cada causa con su efecto lógico.",
        "izquierda": [
                {
                        "id": "iz1",
                        "texto": "Lluvias intensas en zona alta"
                },
                {
                        "id": "iz2",
                        "texto": "Saturación del suelo"
                },
                {
                        "id": "iz3",
                        "texto": "Obstrucción de drenajes"
                }
        ],
        "derecha": [
                {
                        "id": "de1",
                        "texto": "Desborde del río"
                },
                {
                        "id": "de2",
                        "texto": "Mayor riesgo de deslizamiento"
                },
                {
                        "id": "de3",
                        "texto": "Inundación de calles"
                }
        ],
        "pista": "El exceso de agua de lluvia baja por gravedad. ¿Tiene lógica que el nivel del río crezca si llueve mucho?"
},
      claveRespuestas: {
        "arrows": [
                {
                        "from": "iz1",
                        "to": "de1"
                },
                {
                        "from": "iz2",
                        "to": "de2"
                },
                {
                        "from": "iz3",
                        "to": "de3"
                }
        ]
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 22. Actividad Reestructurada: Identificar causa (BASIC)
  await prisma.activity.create({
    data: {
      titulo: "Identificar causa",
      fase: Phase.EVALUATION,
      subPhase: "2.2",
      nivel: Level.BASIC,
      tipo: ActivityType.SEQUENCE_ORDER,
      contenido: {
        "contexto": "Lluvias intensas -> Inundación de calles.",
        "pregunta": "Ordena los siguientes eventos de acuerdo con la secuencia lógica de causa a efecto.",
        "items": [
                {
                        "id": "s1",
                        "texto": "Lluvia intensa"
                },
                {
                        "id": "s2",
                        "texto": "Saturación del suelo"
                },
                {
                        "id": "s3",
                        "texto": "Desborde del río"
                },
                {
                        "id": "s4",
                        "texto": "Calles inundadas"
                }
        ],
        "pista": "La causa es el evento natural original que desencadena el problema. ¿Qué suceso climático produce el agua?"
},
      claveRespuestas: {
        "sequence": [
                "s1",
                "s2",
                "s3",
                "s4"
        ]
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 23. Actividad Reestructurada: Pasado vs Futuro (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Pasado vs Futuro",
      fase: Phase.EVALUATION,
      subPhase: "2.2",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      contenido: {
        "contexto": "En 2010 no se inundó mi casa, así que ahora tampoco pasará nada.",
        "pregunta": "¿El hecho de que no pasara antes asegura que no pasará hoy?",
        "opciones": [
                {
                        "id": "1",
                        "texto": "No, las condiciones pueden cambiar",
                        "esCorrecta": true,
                        "feedback": "¡Excelente! Reconociste que el pasado no garantiza el futuro. Tu razonamiento está siendo más crítico."
                },
                {
                        "id": "2",
                        "texto": "Sí, si no pasó antes no pasará ahora",
                        "esCorrecta": false,
                        "feedback": "Las condiciones climáticas y el nivel del río cambian cada año. Revisa si existe evidencia suficiente para estar seguro."
                }
        ],
        "pista": "Las condiciones climáticas y geográficas cambian con los años. Una experiencia que no ocurrió en el pasado no es garantía para el presente."
},
      claveRespuestas: {
        "correcta": "1"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 24. Actividad Reestructurada: Fallas lógicas (INTERMEDIATE)
  await prisma.activity.create({
    data: {
      titulo: "Fallas lógicas",
      fase: Phase.EVALUATION,
      subPhase: "2.2",
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.MATCHING,
      contenido: {
        "contexto": "Mi casa es alta, nunca le llegará el agua.",
        "pregunta": "Empareja cada afirmación con el tipo de error lógico que representa.",
        "pares": [
                {
                        "id": "A",
                        "izquierda": "\"Mi casa es alta, nunca le llegará el agua\"",
                        "derecha": "Falsa seguridad"
                },
                {
                        "id": "B",
                        "izquierda": "\"En 2010 no pasó nada, hoy tampoco\"",
                        "derecha": "Generalización del pasado"
                },
                {
                        "id": "C",
                        "izquierda": "\"Si no llueve, no hay ningún riesgo\"",
                        "derecha": "Causa única"
                }
        ],
        "pista": "Afirmar que \"nunca le llegará el agua\" sin medir topográficamente cuántos metros subirá el nivel, es asumir una certeza absoluta sin pruebas."
},
      claveRespuestas: {
        "matching": {
                "A": "Falsa seguridad",
                "B": "Generalización del pasado",
                "C": "Causa única"
        }
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 25. Actividad Reestructurada: Conclusiones y Falacias (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Conclusiones y Falacias",
      fase: Phase.EVALUATION,
      subPhase: "2.2",
      nivel: Level.ADVANCED,
      tipo: ActivityType.SEQUENCE_ORDER,
      contenido: {
        "contexto": "Si no lloviera, no habría pobres; por tanto, la lluvia causa pobreza.",
        "pregunta": "Ordena los pasos del argumento según la secuencia lógica en que aparecen.",
        "items": [
                {
                        "id": "p1",
                        "texto": "Premisa condicional: \"Si no lloviera, no habría pobres\""
                },
                {
                        "id": "p2",
                        "texto": "Afirmación implícita: \"La pobreza depende de factores climáticos\""
                },
                {
                        "id": "p3",
                        "texto": "Conclusión: \"La lluvia causa pobreza\""
                }
        ],
        "pista": "La conclusión es la afirmación definitiva o el veredicto que el autor intenta demostrar. Suele aparecer después de un conector como \"por tanto\"."
},
      claveRespuestas: {
        "sequence": [
                "p1",
                "p2",
                "p3"
        ]
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 26. Actividad Reestructurada: Conexión real y directa (ADVANCED)
  await prisma.activity.create({
    data: {
      titulo: "Conexión real y directa",
      fase: Phase.EVALUATION,
      subPhase: "2.2",
      nivel: Level.ADVANCED,
      tipo: ActivityType.MULTIPLE_CHOICE_REASONED,
      contenido: {
        "contexto": "Lluvia -> Pobreza.",
        "pregunta": "¿Existe una conexión real y directa de causa entre estos dos fenómenos?",
        "opciones": [
                {
                        "id": "1",
                        "texto": "No, la pobreza tiene múltiples causas socioeconómicas",
                        "esCorrecta": true,
                        "feedback": "¡Excelente análisis! La pobreza es producto de múltiples factores históricos, económicos y sociales que van mucho más allá del clima."
                },
                {
                        "id": "2",
                        "texto": "Sí, la lluvia puede generar pérdidas y empobrecimiento",
                        "esCorrecta": false,
                        "feedback": "Aunque las inundaciones generan daños, eso no convierte a la lluvia en la causa directa de la pobreza como fenómeno estructural."
                },
                {
                        "id": "3",
                        "texto": "Solo si las lluvias son muy intensas",
                        "esCorrecta": false,
                        "feedback": "La intensidad de la lluvia no establece una causalidad directa con la pobreza como condición social."
                }
        ],
        "pista": "Considera si la pobreza es un problema socioeconómico complejo provocado por múltiples factores, o si de verdad se debe únicamente a que llueva."
},
      claveRespuestas: {
        "correcta": "1"
},
      puntajeMaximo: 100,
      isPublished: true
    }
  })

  // 27. Actividad: JU_3.1_B1 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Priorización de Supervivencia',
      descripcion: 'Asigna a cada elemento su grado de urgencia o prioridad vital en situaciones extremas.',
      fase: Phase.JUDGMENT,
      subPhase: '3.1',
      nivel: Level.BASIC,
      tipo: ActivityType.MATCHING,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Debo decidir entre comprar agua potable o comida para hoy.",
        pregunta: 'Asigna a cada elemento su grado de urgencia o prioridad vital en situaciones extremas.',
        pares: [
          { id: 'a1', izquierda: 'Agua potable', derecha: 'Prioridad vital inmediata' },
          { id: 'a2', izquierda: 'Comida', derecha: 'Nutrición indispensable a mediano plazo' },
          { id: 'a3', izquierda: 'Baterías', derecha: 'Apoyo logístico de comunicación' },
          { id: 'a4', izquierda: 'Ropa extra', derecha: 'Protección secundaria' }
        ]
      },
      claveRespuestas: {
        matching: {
          'a1': 'Prioridad vital inmediata',
          'a2': 'Nutrición indispensable a mediano plazo',
          'a3': 'Apoyo logístico de comunicación',
          'a4': 'Protección secundaria'
        }
      }
    }
  })

  // 28. Actividad: JU_3.1_B2 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Tipos de Necesidades y Decisiones',
      descripcion: 'Clasifica los diferentes conceptos en su correspondiente tipo de urgencia.',
      fase: Phase.JUDGMENT,
      subPhase: '3.1',
      nivel: Level.BASIC,
      tipo: ActivityType.CLASSIFICATION,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Agua o Comida: Solo tengo dinero para una cosa.",
        pregunta: 'Clasifica los siguientes enunciados según representen una "Urgencia Vital" o una "Necesidad de Apoyo".',
        columnas: [
          { id: 'urgencia', label: 'Urgencia Vital / Supervivencia', color: 'red' },
          { id: 'apoyo', label: 'Necesidad de Apoyo / Preferencia', color: 'blue' }
        ],
        items: [
          { id: 'i1', texto: 'Comprar agua potable inmediata en inundación' },
          { id: 'i2', texto: 'Decidir si comer o hidratarse por falta de dinero' },
          { id: 'i3', texto: 'Reunir baterías para la linterna del albergue' },
          { id: 'i4', texto: 'Comprar ropa nueva para después de la tormenta' }
        ]
      },
      claveRespuestas: {
        classification: {
          'i1': 'urgencia',
          'i2': 'urgencia',
          'i3': 'apoyo',
          'i4': 'apoyo'
        }
      }
    }
  })

  // 29. Actividad: JU_3.1_M1 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Valor Humano vs Bienes',
      descripcion: 'Evalúa la racionalidad y prioridad ética de las siguientes decisiones de resguardo.',
      fase: Phase.JUDGMENT,
      subPhase: '3.1',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.TRAFFIC_LIGHT,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Prefiero quedarme en el techo cuidando mi televisor que ir al albergue.",
        pregunta: 'Califica la prioridad y confiabilidad ética de cada decisión frente a un riesgo inminente.',
        fuentes: [
          { id: 'f1', nombre: 'Quedarse en el techo de una casa inundada cuidando el televisor por miedo al robo.' },
          { id: 'f2', nombre: 'Evacuar de inmediato al albergue priorizando la vida humana sobre los bienes.' },
          { id: 'f3', nombre: 'Esperar a que el agua suba más antes de decidir evacuar para no dejar las cosas solas.' }
        ]
      },
      claveRespuestas: {
        trafficLight: {
          'f1': 'red',
          'f2': 'green',
          'f3': 'yellow'
        }
      }
    }
  })

  // 30. Actividad: JU_3.1_M2 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Lógica Técnica vs Miedo',
      descripcion: 'Completa el análisis sobre la toma de decisiones en momentos de pánico.',
      fase: Phase.JUDGMENT,
      subPhase: '3.1',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Decidir quedarse en casa inundada por miedo al robo.",
        pregunta: 'Completa el enunciado identificando el factor principal que guía la decisión.',
        plantilla: 'Decidir quedarse en casa inundada por miedo al robo es un juicio guiado principalmente por _____.',
        opciones: ['En el miedo', 'La razón técnica', 'La prudencia', 'El sentido común']
      },
      claveRespuestas: {
        respuestaExacta: 'En el miedo'
      }
    }
  })

  // 31. Actividad: JU_3.1_A1 (Avanzado)
  await prisma.activity.create({
    data: {
      titulo: 'Inversión Preventiva vs Inmediata',
      descripcion: 'Organiza los beneficios de la infraestructura hidráulica y de las ayudas inmediatas.',
      fase: Phase.JUDGMENT,
      subPhase: '3.1',
      nivel: Level.ADVANCED,
      tipo: ActivityType.DRAG_AND_DROP,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Invertir en canales de drenaje definitivos vs. dar mercados hoy.",
        pregunta: 'Clasifica los beneficios y características de cada tipo de respuesta ante inundaciones.',
        categorias: [
          { id: 'sostenible', label: 'Estrategia Sostenible y de Raíz (Canales)' },
          { id: 'temporal', label: 'Estrategia de Alivio Temporal (Mercados)' }
        ],
        items: [
          { id: 'i1', texto: 'Previene inundaciones futuras de manera definitiva' },
          { id: 'i2', texto: 'Soluciona la causa raíz del problema del sector' },
          { id: 'i3', texto: 'Mitiga el hambre de forma inmediata y corta' },
          { id: 'i4', texto: 'Es una medida paliativa que no evita la próxima inundación' }
        ]
      },
      claveRespuestas: {
        mapping: {
          'i1': 'sostenible',
          'i2': 'sostenible',
          'i3': 'temporal',
          'i4': 'temporal'
        }
      }
    }
  })

  // 32. Actividad: JU_3.1_A2 (Avanzado)
  await prisma.activity.create({
    data: {
      titulo: 'Propuestas de Infraestructura',
      descripcion: 'Completa el juicio crítico sobre propuestas de mitigación a largo plazo.',
      fase: Phase.JUDGMENT,
      subPhase: '3.1',
      nivel: Level.ADVANCED,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      puntajeMaximo: 100,
      contenido: {
        pregunta: 'Completa la evaluación sobre las posturas ciudadanas frente a las crisis climáticas.',
        plantilla: 'Una propuesta ciudadana enfocada en construir infraestructura definitiva contra inundaciones representa una postura de tipo _____.',
        opciones: ['Responsable y Sostenible', 'Preventiva y Solidaria', 'Comprometida y de Acción ciudadana', 'Medida preventiva comunitaria'],
        contexto: "Propuesta ciudadana: Infraestructura contra inundaciones.",
      },
      claveRespuestas: {
        respuestaExacta: 'Responsable y Sostenible'
      }
    }
  })

  // 33. Actividad: JU_3.2_B1 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'Identificación de Perspectivas',
      descripcion: 'Empareja a cada actor de la crisis con su perspectiva y motivación principal.',
      fase: Phase.JUDGMENT,
      subPhase: '3.2',
      nivel: Level.BASIC,
      tipo: ActivityType.MATCHING,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Alcalde: 'Evacuen'. Niño: 'Tengo miedo de dejar mi perro'.",
        pregunta: 'Relaciona a cada actor de la situación de emergencia con su enfoque principal.',
        pares: [
          { id: 'p1', izquierda: 'Alcalde / Institución', derecha: 'Autoridad y seguridad colectiva ("Evacuen")' },
          { id: 'p2', izquierda: 'Niño / Afectado', derecha: 'Sentimiento, apego y temor por su mascota' }
        ]
      },
      claveRespuestas: {
        matching: {
          'p1': 'Autoridad y seguridad colectiva ("Evacuen")',
          'p2': 'Sentimiento, apego y temor por su mascota'
        }
      }
    }
  })

  // 34. Actividad: JU_3.2_B2 (Básico)
  await prisma.activity.create({
    data: {
      titulo: 'La Perspectiva Emocional',
      descripcion: 'Identifica el actor detrás del apego afectivo durante una evacuación.',
      fase: Phase.JUDGMENT,
      subPhase: '3.2',
      nivel: Level.BASIC,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      puntajeMaximo: 100,
      contenido: {
        contexto: "El niño llora porque no quiere dejar su mascota.",
        pregunta: 'Completa el enunciado identificando al sujeto con la perspectiva afectiva descrita.',
        plantilla: 'El llanto por no querer dejar a una mascota durante una orden de evacuación representa la perspectiva emocional del _____.',
        opciones: ['Niño', 'Alcalde', 'Vecino', 'Tutor']
      },
      claveRespuestas: {
        respuestaExacta: 'Niño'
      }
    }
  })

  // 35. Actividad: JU_3.2_M1 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Amenaza del Frente Frío',
      descripcion: 'Conecta a cada personaje con su respectiva percepción del impacto de las lluvias.',
      fase: Phase.JUDGMENT,
      subPhase: '3.2',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.ARROW_MATCHING,
      puntajeMaximo: 100,
      contenido: {
        contexto: "El vecino de la orilla pide que cierren las compuertas ya. Teme perder su hogar",
        pregunta: 'Asocia a cada actor con la principal preocupación que guía su perspectiva en esta emergencia.',
        izquierda: [
          { id: 'iz1', texto: 'Ribereño (vecino de la orilla)' },
          { id: 'iz2', texto: 'Comerciante de botas plásticas' }
        ],
        derecha: [
          { id: 'de1', texto: 'Pérdida de hogar e inundación de vivienda' },
          { id: 'de2', texto: 'Oportunidad de incremento de ventas' }
        ]
      },
      claveRespuestas: {
        arrows: [
          { from: 'iz1', to: 'de1' },
          { from: 'iz2', to: 'de2' }
        ]
      }
    }
  })

  // 36. Actividad: JU_3.2_M2 (Medio)
  await prisma.activity.create({
    data: {
      titulo: 'Pluralidad de Perspectivas',
      descripcion: 'Completa el juicio sobre la validez de múltiples perspectivas ante un mismo hecho.',
      fase: Phase.JUDGMENT,
      subPhase: '3.2',
      nivel: Level.INTERMEDIATE,
      tipo: ActivityType.FILL_IN_THE_BLANK,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Un mismo fenómeno (lluvia) visto por dos personas distintas.",
        pregunta: 'Analiza la posibilidad de que dos personas tengan perspectivas válidas pero opuestas.',
        plantilla: '¿Es posible que dos personas tengan la razón al mismo tiempo ante un mismo fenómeno climático? _____',
        opciones: ['Sí (por su contexto)', 'No, solo una tiene razón', 'Depende de quién hable', 'La lluvia afecta igual a todos']
      },
      claveRespuestas: {
        respuestaExacta: 'Sí (por su contexto)'
      }
    }
  })

  // 37. Actividad: JU_3.2_A1 (Avanzado)
  await prisma.activity.create({
    data: {
      titulo: 'Conflicto de Derechos',
      descripcion: 'Clasifica los intereses en juego en una situación de conflicto social y salud.',
      fase: Phase.JUDGMENT,
      subPhase: '3.2',
      nivel: Level.ADVANCED,
      tipo: ActivityType.CLASSIFICATION,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Cerrar la vía por protesta ayuda al pueblo, pero frena ambulancias.",
        pregunta: 'Clasifica cada derecho en conflicto según corresponda a una perspectiva de Interés Colectivo o Vital/Humana.',
        columnas: [
          { id: 'colectivo', label: 'Interés Colectivo / Social', color: 'blue' },
          { id: 'vital', label: 'Prioridad Vital / Humana Inmediata', color: 'red' }
        ],
        items: [
          { id: 'i1', texto: 'Paso libre de ambulancias de urgencias' },
          { id: 'i2', texto: 'Derecho a la salud y a la vida de pacientes' },
          { id: 'i3', texto: 'Protesta social comunitaria por abandono' },
          { id: 'i4', texto: 'Libertad de manifestación colectiva' }
        ]
      },
      claveRespuestas: {
        classification: {
          'i1': 'vital',
          'i2': 'vital',
          'i3': 'colectivo',
          'i4': 'colectivo'
        }
      }
    }
  })

  // 38. Actividad: JU_3.2_A2 (Avanzado)
  await prisma.activity.create({
    data: {
      titulo: 'Perspectiva y Tipos de Derechos',
      descripcion: 'Relaciona la manifestación de cada derecho con su respectivo tipo de prioridad ética.',
      fase: Phase.JUDGMENT,
      subPhase: '3.2',
      nivel: Level.ADVANCED,
      tipo: ActivityType.MATCHING,
      puntajeMaximo: 100,
      contenido: {
        contexto: "Derecho a la protesta vs Derecho a la salud/vida.",
        pregunta: 'Relaciona los derechos en tensión con su clasificación según el estándar de justicia.',
        pares: [
          { id: 'p1', izquierda: 'Derecho a la Protesta', derecha: 'Protesta (Col) / Interés colectivo' },
          { id: 'p2', izquierda: 'Derecho a la Vida y Salud', derecha: 'Vida (Vit) / Prioridad vital' }
        ]
      },
      claveRespuestas: {
        matching: {
          'p1': 'Protesta (Col) / Interés colectivo',
          'p2': 'Vida (Vit) / Prioridad vital'
        }
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
