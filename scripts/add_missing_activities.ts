import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newActivities = [
  // FASE 1.1 - Las número 2
  {
    fase: 'ANALYSIS', subPhase: '1.1', nivel: 'BASIC',
    titulo: 'Unidades de medida',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana.",
      pregunta: "Selecciona la unidad de medida utilizada en el reporte.",
      opciones: [
        { id: '1', texto: "Metros", esCorrecta: true, feedback: "¡Muy bien! Reconociste correctamente la unidad de medida. Estás identificando datos técnicos con mayor precisión." },
        { id: '2', texto: "Litros", esCorrecta: false, feedback: "Los litros miden volumen. Revisa qué unidad se usa para medir altura o nivel. Sigue analizando cuidadosamente." },
        { id: '3', texto: "Kilómetros", esCorrecta: false, feedback: "Los kilómetros se usan para distancias largas. Piensa cómo se mide el nivel de un río. Cada intento mejora tu análisis." },
        { id: '4', texto: "Nivel", esCorrecta: false, feedback: "'Nivel' describe una condición, pero no es una unidad de medida. Observa con atención los términos técnicos." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.1', nivel: 'INTERMEDIATE',
    titulo: 'Entidad emisora',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "El boletín del IDEAM indica lluvias de 40mm/h.",
      pregunta: "¿Qué entidad emite la información técnica?",
      opciones: [
        { id: '1', texto: "IDEAM", esCorrecta: true, feedback: "¡Muy bien! Reconociste la fuente técnica oficial. Identificar fuentes confiables fortalece tu análisis." },
        { id: '2', texto: "Alcaldía", esCorrecta: false, feedback: "La alcaldía puede comunicar información, pero revisa quién genera el reporte técnico climático." },
        { id: '3', texto: "Noticias", esCorrecta: false, feedback: "Los medios difunden información, pero no siempre producen los datos científicos." },
        { id: '4', texto: "Comunidad", esCorrecta: false, feedback: "La comunidad comparte experiencias, pero revisa qué entidad realiza mediciones oficiales." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.1', nivel: 'ADVANCED',
    titulo: 'Porcentaje de saturación',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "La saturación del suelo ha llegado al 90% en las laderas.",
      pregunta: "¿Qué porcentaje de saturación tiene el suelo?",
      opciones: [
        { id: '1', texto: "90%", esCorrecta: true, feedback: "¡Correcto! Reconociste el porcentaje exacto. Estás interpretando datos técnicos con precisión." },
        { id: '2', texto: "100%", esCorrecta: false, feedback: "Revisa nuevamente el porcentaje mencionado en el texto." },
        { id: '3', texto: "50%", esCorrecta: false, feedback: "Observa cuidadosamente el valor numérico presentado." },
        { id: '4', texto: "Alta", esCorrecta: false, feedback: "La pregunta pide un porcentaje específico, no una descripción." }
      ]
    }
  },
  // FASE 1.2 - Las número 2
  {
    fase: 'ANALYSIS', subPhase: '1.2', nivel: 'BASIC',
    titulo: 'Población prioritaria',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Debemos evacuar para proteger a niños y ancianos prioritariamente.",
      pregunta: "¿A quiénes se busca proteger principalmente según el texto?",
      opciones: [
        { id: '1', texto: "Niños y ancianos", esCorrecta: true, feedback: "¡Excelente! Identificaste la población prioritaria." },
        { id: '2', texto: "Toda la comunidad", esCorrecta: false, feedback: "La comunidad puede verse afectada, pero revisa quiénes se mencionan específicamente." },
        { id: '3', texto: "Adultos", esCorrecta: false, feedback: "Observa cuidadosamente los grupos nombrados en el mensaje." },
        { id: '4', texto: "Autoridades", esCorrecta: false, feedback: "Las autoridades organizan, pero no son la población objetivo a proteger en el texto." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.2', nivel: 'INTERMEDIATE',
    titulo: 'Argumento de justificación',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Poner costales es mejor para evitar que el agua dañe los muebles.",
      pregunta: "¿Cuál es la razón (argumento) que justifica la opción elegida?",
      opciones: [
        { id: '1', texto: "Cuidar los bienes", esCorrecta: true, feedback: "¡Muy bien! Identificaste el argumento principal." },
        { id: '2', texto: "Salvar vidas", esCorrecta: false, feedback: "Ese sería otro objetivo importante, pero revisa qué justificación menciona el texto." },
        { id: '3', texto: "Evitar evacuación", esCorrecta: false, feedback: "Piensa cuál es la razón directa relacionada con los muebles y las casas." },
        { id: '4', texto: "Seguir instrucciones", esCorrecta: false, feedback: "El argumento se relaciona con proteger pertenencias materiales." }
      ]
    }
  },
  {
    fase: 'ANALYSIS', subPhase: '1.2', nivel: 'ADVANCED',
    titulo: 'Argumento en contra',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Reubicar familias implica una inversión muy alta en este momento.",
      pregunta: "¿Cuál es el argumento en contra (desventaja) mencionado?",
      opciones: [
        { id: '1', texto: "Es costoso hoy", esCorrecta: true, feedback: "¡Correcto! Reconociste la desventaja planteada." },
        { id: '2', texto: "Económico", esCorrecta: false, feedback: "Tu respuesta se relaciona con dinero, pero revisa cómo aparece expresado el argumento." },
        { id: '3', texto: "Altamente costoso", esCorrecta: false, feedback: "Vas cerca. Busca la expresión exacta mencionada en el texto." },
        { id: '4', texto: "Barato", esCorrecta: false, feedback: "Revisa nuevamente: el texto presenta una dificultad económica, no una ventaja." }
      ]
    }
  },
  // FASE 2.1 - Las número 2
  {
    fase: 'EVALUATION', subPhase: '2.1', nivel: 'BASIC',
    titulo: 'Fuentes anónimas',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "WhatsApp anónimo vs Comunicado Oficial de Montería.",
      pregunta: "¿Cuál de las dos fuentes es anónima y sin respaldo?",
      opciones: [
        { id: '1', texto: "WhatsApp", esCorrecta: true, feedback: "¡Correcto! Reconociste la fuente sin verificación oficial. Cada vez evalúas mejor la credibilidad." },
        { id: '2', texto: "Mensaje anónimo", esCorrecta: false, feedback: "La idea es correcta, pero identifica específicamente la fuente mencionada." },
        { id: '3', texto: "Cadena de WhatsApp", esCorrecta: false, feedback: "Vas por buen camino. Busca la opción más directa." },
        { id: '4', texto: "Chat sin autor", esCorrecta: false, feedback: "Piensa en qué medio circulaba originalmente el mensaje." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.1', nivel: 'INTERMEDIATE',
    titulo: 'Emoción vs Datos',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Vecino: 'El agua subió por culpa de las obras'. Ingeniero: 'Por lluvia'.",
      pregunta: "¿Cuál fuente se basa principalmente en la emoción del momento?",
      opciones: [
        { id: '1', texto: "Vecino afectado", esCorrecta: true, feedback: "¡Correcto! Reconociste una opinión influenciada por la experiencia personal. Tu análisis crítico está mejorando." },
        { id: '2', texto: "Ingeniero", esCorrecta: false, feedback: "El ingeniero basa su explicación en datos técnicos. Revisa quién habla desde la experiencia emocional." },
        { id: '3', texto: "Opinión", esCorrecta: false, feedback: "La respuesta describe el tipo de mensaje, pero identifica quién lo expresa." },
        { id: '4', texto: "Persona afectada", esCorrecta: false, feedback: "Vas cerca. Busca la opción exacta relacionada con el testimonio." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.1', nivel: 'ADVANCED',
    titulo: 'Neutralidad académica',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Estudio hidrológico vs Discurso de político en zona afectada.",
      pregunta: "¿Cuál de las fuentes ofrece mayor neutralidad académica?",
      opciones: [
        { id: '1', texto: "Científico", esCorrecta: true, feedback: "¡Muy bien! Reconociste la fuente más objetiva y técnica. Estás fortaleciendo tu evaluación crítica." },
        { id: '2', texto: "Universidad", esCorrecta: false, feedback: "La universidad respalda el estudio, pero revisa quién realiza directamente la investigación." },
        { id: '3', texto: "Estudio hidrológico", esCorrecta: false, feedback: "El estudio contiene la información, pero identifica quién aporta la neutralidad académica." },
        { id: '4', texto: "Investigador", esCorrecta: false, feedback: "Tu respuesta es cercana, pero busca el término exacto usado en el texto." }
      ]
    }
  },
  // FASE 2.2 - Las número 2
  {
    fase: 'EVALUATION', subPhase: '2.2', nivel: 'BASIC',
    titulo: 'Identificar causa',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Lluvias intensas -> Inundación de calles.",
      pregunta: "Identifica la causa en este argumento simple.",
      opciones: [
        { id: '1', texto: "Lluvias intensas", esCorrecta: true, feedback: "¡Muy bien! Reconociste la causa principal del argumento. Estás identificando relaciones lógicas correctamente." },
        { id: '2', texto: "Fuertes lluvias", esCorrecta: false, feedback: "Tu respuesta es cercana. Busca la expresión exacta presentada." },
        { id: '3', texto: "Precipitaciones intensas", esCorrecta: false, feedback: "La idea es correcta, pero revisa cómo aparece redactada en el texto." },
        { id: '4', texto: "Inundación de calles", esCorrecta: false, feedback: "Esa es la consecuencia o efecto, no la causa." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.2', nivel: 'INTERMEDIATE',
    titulo: 'Fallas lógicas',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Mi casa es alta, nunca le llegará el agua.",
      pregunta: "¿Cuál es la falla lógica: basarse en datos o en falsa seguridad?",
      opciones: [
        { id: '1', texto: "Falsa seguridad", esCorrecta: true, feedback: "¡Correcto! Detectaste exceso de confianza en el razonamiento. Cada vez identificas mejor los errores lógicos." },
        { id: '2', texto: "Basarse en datos", esCorrecta: false, feedback: "No hay datos numéricos o estudios aquí que soporten la conclusión." },
        { id: '3', texto: "Exceso de confianza", esCorrecta: false, feedback: "Tu respuesta se relaciona con la idea correcta. Revisa cuál concepto pide la pregunta." },
        { id: '4', texto: "Suposición sin evidencia", esCorrecta: false, feedback: "La afirmación tiene poca evidencia, pero piensa especialmente en la opción solicitada por la pregunta." }
      ]
    }
  },
  {
    fase: 'EVALUATION', subPhase: '2.2', nivel: 'ADVANCED',
    titulo: 'Conexión real y directa',
    contenido: {
      tipo: 'multiple_choice',
      contexto: "Lluvia -> Pobreza.",
      pregunta: "¿Existe una conexión real y directa de causa entre estos dos?",
      opciones: [
        { id: '1', texto: "No", esCorrecta: true, feedback: "¡Excelente! Has detectado que no existe una relación de causalidad directa válida, sino una correlación falsa o falacia." },
        { id: '2', texto: "Sí", esCorrecta: false, feedback: "Piensa en todos los demás factores económicos y sociales que causan pobreza; la lluvia por sí sola no lo explica directamente." },
        { id: '3', texto: "A veces", esCorrecta: false, feedback: "Puede haber desastres, pero la 'pobreza' como estado social no es causada directamente por el clima." },
        { id: '4', texto: "Es una relación comprobada", esCorrecta: false, feedback: "No existe evidencia científica que vincule directamente un fenómeno meteorológico como causa única de un fenómeno socioeconómico." }
      ]
    }
  }
]

async function addMissingActivities() {
  console.log('Iniciando inserción de las preguntas secundarias (las "número 2")...')
  
  for (const act of newActivities) {
    await prisma.activity.create({
      data: {
        titulo: act.titulo,
        descripcion: 'Actividad secundaria del tutor SIMECT',
        fase: act.fase as any,
        subPhase: act.subPhase,
        nivel: act.nivel as any,
        tipo: 'MULTIPLE_CHOICE_REASONED',
        isPublished: true,
        contenido: act.contenido,
        claveRespuestas: { correctOptionId: '1' }
      }
    })
    console.log(`[CREADO] ${act.subPhase} - ${act.nivel} (${act.titulo})`)
  }

  console.log('Inserción completada.')
}

addMissingActivities()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
