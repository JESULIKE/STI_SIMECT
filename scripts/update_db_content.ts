import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newActivities = [
  // FASE 1.1
  {
    fase: 'ANALYSIS', subPhase: '1.1', nivel: 'BASIC',
    titulo: 'Identificación de hechos',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana.",
      pregunta: "Identifica la cifra exacta del nivel del río.",
      opciones: [
        { id: '1', texto: "7.5 metros", esCorrecta: true, feedback: "¡Excelente! Identificaste correctamente el dato exacto del reporte. Vas fortaleciendo tu precisión al analizar información." },
        { id: '2', texto: "7 metros", esCorrecta: false, feedback: "Revisa cuidadosamente el número decimal mencionado en el texto. Los detalles hacen la diferencia." },
        { id: '3', texto: "7.5", esCorrecta: false, feedback: "La cifra es correcta, pero falta incluir la unidad de medida. Ya casi lo logras." },
        { id: '4', texto: "Nivel crítico", esCorrecta: false, feedback: "La pregunta solicita un dato exacto, no una interpretación de la situación. Busca siempre información verificable." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.1', nivel: 'INTERMEDIATE',
    titulo: 'Datos técnicos vs Generales',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "El boletín del IDEAM indica lluvias de 40mm/h; el cielo se observa 'muy cargado'.",
      pregunta: "Extrae el dato técnico de intensidad de lluvia.",
      opciones: [
        { id: '1', texto: "40mm/h", esCorrecta: true, feedback: "¡Excelente! Identificaste el dato técnico exacto. Estás diferenciando datos objetivos de descripciones generales." },
        { id: '2', texto: "40 mm", esCorrecta: false, feedback: "La cifra es correcta, pero revisa cómo aparece expresada la intensidad de lluvia. Vas por buen camino." },
        { id: '3', texto: "Lluvia fuerte", esCorrecta: false, feedback: "Busca el dato técnico medible, no la descripción del clima. Sigue analizando los detalles." },
        { id: '4', texto: "IDEAM", esCorrecta: false, feedback: "IDEAM es la entidad que informa, pero la pregunta pide la intensidad de lluvia. Lee cuidadosamente qué solicita la pregunta." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.1', nivel: 'ADVANCED',
    titulo: 'Medidas complejas',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "La presión de 1012 hPa y la saturación del suelo al 90% sugieren riesgo.",
      pregunta: "Identifica la medida exacta de presión atmosférica.",
      opciones: [
        { id: '1', texto: "1012 hPa", esCorrecta: true, feedback: "¡Excelente precisión! Identificaste correctamente la medida atmosférica. Tu análisis técnico está avanzando." },
        { id: '2', texto: "1012", esCorrecta: false, feedback: "La cifra es correcta, pero revisa la unidad científica utilizada." },
        { id: '3', texto: "90%", esCorrecta: false, feedback: "Ese dato corresponde a la saturación del suelo, no a la presión atmosférica." },
        { id: '4', texto: "Presión alta", esCorrecta: false, feedback: "La pregunta solicita el valor exacto, no una conclusión." }
      ]
    }
  },
  // FASE 1.2
  {
    fase: 'ANALYSIS', subPhase: '1.2', nivel: 'BASIC',
    titulo: 'Acciones principales',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Debemos evacuar el barrio para proteger a los niños y ancianos.",
      pregunta: "Identifica la propuesta o acción principal sugerida.",
      opciones: [
        { id: '1', texto: "Evacuar el barrio", esCorrecta: true, feedback: "¡Muy bien! Identificaste la acción principal del mensaje. Estás reconociendo propuestas concretas." },
        { id: '2', texto: "Proteger casas", esCorrecta: false, feedback: "Esa idea aparece relacionada, pero revisa cuál es la acción específica sugerida." },
        { id: '3', texto: "Ayudar vecinos", esCorrecta: false, feedback: "Piensa cuál es la medida inmediata planteada en el texto." },
        { id: '4', texto: "Esperar instrucciones", esCorrecta: false, feedback: "La propuesta implica actuar, no esperar." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.2', nivel: 'INTERMEDIATE',
    titulo: 'Identificar soluciones',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Poner costales de arena es mejor que salir, porque así cuidamos las casas.",
      pregunta: "Identifica la opción o solución defendida por el autor.",
      opciones: [
        { id: '1', texto: "Poner costales", esCorrecta: true, feedback: "¡Correcto! Reconociste la solución defendida." },
        { id: '2', texto: "Evacuar", esCorrecta: false, feedback: "La evacuación es otra alternativa, pero revisa cuál apoya el autor." },
        { id: '3', texto: "Esperar ayuda", esCorrecta: false, feedback: "El texto propone una acción inmediata, no esperar." },
        { id: '4', texto: "Ignorar la situación", esCorrecta: false, feedback: "El autor sí plantea una medida para actuar frente al problema." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.2', nivel: 'ADVANCED',
    titulo: 'Largo plazo vs Corto plazo',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Reubicar familias es costoso hoy, pero evita tragedias cíclicas cada invierno.",
      pregunta: "Identifica la opción de largo plazo mencionada en el texto.",
      opciones: [
        { id: '1', texto: "Reubicar familias", esCorrecta: true, feedback: "¡Excelente análisis! Identificaste una solución preventiva de largo plazo." },
        { id: '2', texto: "Esperar el invierno", esCorrecta: false, feedback: "Revisa qué acción concreta se plantea para evitar tragedias." },
        { id: '3', texto: "Asumir los costos", esCorrecta: false, feedback: "El costo es una consecuencia de la acción, no la solución en sí." },
        { id: '4', texto: "Evitar tragedias", esCorrecta: false, feedback: "Evitar tragedias es el propósito, pero ¿cuál es la acción propuesta?" }
      ]
    }
  },
  // FASE 2.1
  {
    fase: 'EVALUATION', subPhase: '2.1', nivel: 'BASIC',
    titulo: 'Fuentes Oficiales vs Informales',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Audio WhatsApp: 'Se rompió la represa'. Boletín Alcaldía: 'Estable'.",
      pregunta: "¿Cuál fuente tiene una firma institucional y responsable?",
      opciones: [
        { id: '1', texto: "Boletín oficial Alcaldía", esCorrecta: true, feedback: "¡Excelente! Identificaste la fuente con respaldo institucional. Estás aprendiendo a verificar información confiable." },
        { id: '2', texto: "Entidad gubernamental", esCorrecta: false, feedback: "Vas cerca, pero busca el tipo específico de fuente mencionado." },
        { id: '3', texto: "Comunicado", esCorrecta: false, feedback: "Revisa cuál opción representa un documento emitido oficialmente." },
        { id: '4', texto: "Audio WhatsApp", esCorrecta: false, feedback: "Recuerda que los audios de WhatsApp suelen carecer de autoría oficial y pueden ser rumores." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.1', nivel: 'INTERMEDIATE',
    titulo: 'Experiencia vs Conocimiento Técnico',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Testimonio de un vecino afectado vs Informe de un ingeniero.",
      pregunta: "¿Quién es el experto técnico capacitado en el tema?",
      opciones: [
        { id: '1', texto: "Ingeniero", esCorrecta: true, feedback: "¡Muy bien! Identificaste al profesional con formación técnica. Estás diferenciando experiencia de conocimiento especializado." },
        { id: '2', texto: "Profesional técnico", esCorrecta: false, feedback: "La idea es correcta, pero revisa qué profesión específica aparece en el texto." },
        { id: '3', texto: "Especialista", esCorrecta: false, feedback: "Busca el cargo técnico exacto mencionado." },
        { id: '4', texto: "Vecino afectado", esCorrecta: false, feedback: "Vivir la situación no necesariamente significa tener conocimientos técnicos." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.1', nivel: 'ADVANCED',
    titulo: 'Intereses Ocultos',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Científico de la Universidad vs Candidato a la Alcaldía en barrio.",
      pregunta: "¿Cuál fuente podría tener un interés electoral en su discurso?",
      opciones: [
        { id: '1', texto: "Candidato", esCorrecta: true, feedback: "¡Excelente análisis! Detectaste un posible interés político. Estás evaluando intenciones detrás del discurso." },
        { id: '2', texto: "Politico", esCorrecta: false, feedback: "Tu respuesta se relaciona con el tema, pero revisa quién participa directamente en campaña." },
        { id: '3', texto: "Aspirante", esCorrecta: false, feedback: "Vas bien. Busca el término exacto utilizado." },
        { id: '4', texto: "Campaña electoral", esCorrecta: false, feedback: "La campaña es el contexto, pero identifica la persona involucrada." }
      ]
    }
  },
  // FASE 2.2
  {
    fase: 'EVALUATION', subPhase: '2.2', nivel: 'BASIC',
    titulo: 'Causa y Efecto',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Llovió mucho en la parte alta, por eso el río se desbordó.",
      pregunta: "¿La lluvia intensa explica lógicamente el desborde del río?",
      opciones: [
        { id: '1', texto: "Sí", esCorrecta: true, feedback: "¡Correcto! Identificaste una relación lógica de causa y efecto. Estás comprendiendo conexiones entre fenómenos." },
        { id: '2', texto: "No", esCorrecta: false, feedback: "Piensa cómo el aumento de lluvia puede afectar el nivel del río." },
        { id: '3', texto: "Solo a veces", esCorrecta: false, feedback: "Evalúa estrictamente la relación causal que plantea la oración." },
        { id: '4', texto: "Es una coincidencia", esCorrecta: false, feedback: "Existe una relación directa y lógica, no es simple azar." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.2', nivel: 'INTERMEDIATE',
    titulo: 'Pasado vs Futuro',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "En 2010 no se inundó mi casa, así que ahora tampoco pasará nada.",
      pregunta: "¿El hecho de que no pasara antes asegura que no pasará hoy?",
      opciones: [
        { id: '1', texto: "No", esCorrecta: true, feedback: "¡Excelente! Reconociste que el pasado no garantiza el futuro. Tu razonamiento está siendo más crítico." },
        { id: '2', texto: "Sí", esCorrecta: false, feedback: "Las condiciones climáticas cambian constantemente, revisa si hay evidencia firme." },
        { id: '3', texto: "Depende del año", esCorrecta: false, feedback: "Lo importante es si un evento pasado es suficiente para predecir eventos futuros." },
        { id: '4', texto: "Es altamente probable", esCorrecta: false, feedback: "El razonamiento es falaz porque se basa en anécdotas en lugar de datos actuales." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.2', nivel: 'ADVANCED',
    titulo: 'Conclusiones y Falacias',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Si no lloviera, no habría pobres; por tanto, la lluvia causa pobreza.",
      pregunta: "Identifica la conclusión final del argumento expuesto.",
      opciones: [
        { id: '1', texto: "Lluvia causa pobreza", esCorrecta: true, feedback: "¡Excelente análisis! Identificaste la conclusión principal del argumento. Estás comprendiendo estructuras argumentativas complejas." },
        { id: '2', texto: "La pobreza fue causada por la lluvia", esCorrecta: false, feedback: "Tu respuesta es cercana, pero revisa la conclusión exacta planteada." },
        { id: '3', texto: "La lluvia es un problema social", esCorrecta: false, feedback: "Esto es una interpretación, no la conclusión que extrae literalmente el argumento." },
        { id: '4', texto: "No llover acaba la pobreza", esCorrecta: false, feedback: "Esa es la premisa inicial, la conclusión es lo que se deduce ('por tanto')." }
      ]
    }
  }
]

async function updateDB() {
  console.log('Iniciando actualización de la base de datos con las nuevas preguntas...')
  
  for (const newAct of newActivities) {
    // Buscar la actividad correspondiente (1.1 BASIC, etc)
    const act = await prisma.activity.findFirst({
      where: {
        fase: newAct.fase as any,
        subPhase: newAct.subPhase,
        nivel: newAct.nivel as any
      }
    })

    if (act) {
      // Actualizarla
      await prisma.activity.update({
        where: { id: act.id },
        data: {
          titulo: newAct.titulo,
          contenido: newAct.contenido
        }
      })
      console.log(`[ACTUALIZADO] ${newAct.subPhase} - ${newAct.nivel}`)
    } else {
      console.warn(`[NO ENCONTRADO] No se halló actividad para ${newAct.subPhase} - ${newAct.nivel} en BD. Se creará nueva.`)
      await prisma.activity.create({
        data: {
          titulo: newAct.titulo,
          descripcion: 'Actividad del tutor SIMECT',
          fase: newAct.fase as any,
          subPhase: newAct.subPhase,
          nivel: newAct.nivel as any,
          tipo: 'MULTIPLE_CHOICE',
          isPublished: true,
          contenido: newAct.contenido
        }
      })
    }
  }

  console.log('Actualización completada.')
}

updateDB()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
