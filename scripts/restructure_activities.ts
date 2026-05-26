import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const activities = [
  // ══════════════════════════════════════════════════════════
  // FASE 1 - ANÁLISIS — Subfase 1.1
  // ══════════════════════════════════════════════════════════
  {
    titulo: 'Identificación de hechos', fase: 'ANALYSIS', subPhase: '1.1', nivel: 'BASIC',
    tipo: 'FILL_IN_THE_BLANK',
    contenido: {
      contexto: null,
      pregunta: 'Completa el espacio en blanco con el dato exacto del texto.',
      plantilla: 'El nivel del río Sinú en Montería alcanzó los _____ esta mañana.',
      opciones: ['7.5 metros', '7 metros', 'Nivel alto', '8.5 metros'],
      pista: 'El dato que buscas es un número con decimales seguido de una unidad de medida de longitud.'
    },
    clave: { respuestaExacta: '7.5 metros' }
  },
  {
    titulo: 'Unidades de medida', fase: 'ANALYSIS', subPhase: '1.1', nivel: 'BASIC',
    tipo: 'MULTIPLE_CHOICE_REASONED',
    contenido: {
      contexto: null,
      pregunta: 'Selecciona la unidad de medida utilizada en el reporte.',
      opciones: [
        { id: '1', texto: 'Metros', esCorrecta: true, feedback: '¡Muy bien! Reconociste correctamente la unidad de medida. Estás identificando datos técnicos con mayor precisión.' },
        { id: '2', texto: 'Litros', esCorrecta: false, feedback: 'Los litros miden volumen. Revisa qué unidad se usa para medir altura o nivel. Sigue analizando cuidadosamente.' },
        { id: '3', texto: 'Kilómetros', esCorrecta: false, feedback: 'Los kilómetros se usan para distancias largas. Piensa cómo se mide el nivel de un río.' },
        { id: '4', texto: 'Nivel', esCorrecta: false, feedback: '"Nivel" describe una condición, pero no es una unidad de medida. Observa con atención los términos técnicos.' }
      ],
      pista: 'Las unidades acompañan a los números para decirnos qué se está midiendo (ej. kilos, horas, o en este caso de altura, metros).'
    },
    clave: { correcta: '1' }
  },
  {
    titulo: 'Datos técnicos vs Generales', fase: 'ANALYSIS', subPhase: '1.1', nivel: 'INTERMEDIATE',
    tipo: 'TEXT_MARKUP',
    contenido: {
      contexto: null,
      pregunta: 'Lee el siguiente texto y subraya únicamente el dato técnico que indica la intensidad de lluvia.',
      texto: 'El boletín del IDEAM indica lluvias de 40mm/h; el cielo se observa muy cargado.',
      opciones: ['40mm/h', 'muy cargado', 'El boletín del IDEAM', 'cielo se observa'],
      respuestaEsperada: '40mm/h',
      pista: 'Un dato técnico suele llevar números y unidades estandarizadas (como mm/h), a diferencia de las descripciones subjetivas como "muy cargado".'
    },
    clave: { respuestaExacta: '40mm/h' }
  },
  {
    titulo: 'Entidad emisora', fase: 'ANALYSIS', subPhase: '1.1', nivel: 'INTERMEDIATE',
    tipo: 'MATCHING',
    contenido: {
      contexto: null,
      pregunta: 'Empareja cada fuente de información con su función principal.',
      pares: [
        { id: 'A', izquierda: 'IDEAM', derecha: 'Genera datos científicos oficiales' },
        { id: 'B', izquierda: 'Alcaldía', derecha: 'Comunica decisiones administrativas' },
        { id: 'C', izquierda: 'Medios de comunicación', derecha: 'Difunde información masivamente' },
        { id: 'D', izquierda: 'Comunidad', derecha: 'Comparte experiencias locales' }
      ],
      pista: 'Identifica las siglas o el nombre de la organización institucional/gubernamental encargada de emitir el boletín.'
    },
    clave: { matching: { A: 'Genera datos científicos oficiales', B: 'Comunica decisiones administrativas', C: 'Difunde información masivamente', D: 'Comparte experiencias locales' } }
  },
  {
    titulo: 'Medidas complejas', fase: 'ANALYSIS', subPhase: '1.1', nivel: 'ADVANCED',
    tipo: 'FILL_IN_THE_BLANK',
    contenido: {
      contexto: null,
      pregunta: 'Completa el espacio con la medida exacta de presión atmosférica.',
      plantilla: 'La presión atmosférica registrada es de _____ y la saturación del suelo es del 90%.',
      opciones: ['1012 hPa', '90%', '1000 hPa', 'Alta presión'],
      pista: '"hPa" es la unidad de presión (hectopascales), mientras que el "%" se usa para la saturación del suelo.'
    },
    clave: { respuestaExacta: '1012 hPa' }
  },
  {
    titulo: 'Porcentaje de saturación', fase: 'ANALYSIS', subPhase: '1.1', nivel: 'ADVANCED',
    tipo: 'MULTIPLE_CHOICE_REASONED',
    contenido: {
      contexto: null,
      pregunta: '¿Qué porcentaje de saturación tiene el suelo?',
      opciones: [
        { id: '1', texto: '90%', esCorrecta: true, feedback: '¡Correcto! Reconociste el porcentaje exacto. Estás interpretando datos técnicos con precisión.' },
        { id: '2', texto: '100%', esCorrecta: false, feedback: 'Revisa nuevamente el porcentaje mencionado en el texto.' },
        { id: '3', texto: '50%', esCorrecta: false, feedback: 'Observa cuidadosamente el valor numérico presentado.' },
        { id: '4', texto: 'Alta', esCorrecta: false, feedback: 'La pregunta pide un porcentaje específico, no una descripción cualitativa.' }
      ],
      pista: 'Revisa detenidamente cuál de los dos valores numéricos viene acompañado explícitamente del símbolo de porcentaje (%).'
    },
    clave: { correcta: '1' }
  },

  // ══════════════════════════════════════════════════════════
  // FASE 1 - ANÁLISIS — Subfase 1.2
  // ══════════════════════════════════════════════════════════
  {
    titulo: 'Acciones principales', fase: 'ANALYSIS', subPhase: '1.2', nivel: 'BASIC',
    tipo: 'TEXT_MARKUP',
    contenido: {
      contexto: null,
      pregunta: 'Lee el mensaje y subraya la acción principal que se propone.',
      texto: 'Debemos evacuar el barrio para proteger a los niños y ancianos.',
      opciones: ['evacuar el barrio', 'Debemos', 'proteger a los niños', 'y ancianos'],
      respuestaEsperada: 'evacuar el barrio',
      pista: 'Pregúntate: ¿Qué es la acción concreta e inmediata que el autor afirma que "debemos" hacer?'
    },
    clave: { respuestaExacta: 'evacuar el barrio' }
  },
  {
    titulo: 'Población prioritaria', fase: 'ANALYSIS', subPhase: '1.2', nivel: 'BASIC',
    tipo: 'MULTIPLE_CHOICE_REASONED',
    contenido: {
      contexto: null,
      pregunta: '¿A quiénes se busca proteger principalmente según el texto?',
      opciones: [
        { id: '1', texto: 'Niños y ancianos', esCorrecta: true, feedback: '¡Excelente! Identificaste la población prioritaria.' },
        { id: '2', texto: 'Toda la comunidad', esCorrecta: false, feedback: 'La comunidad puede verse afectada, pero revisa quiénes se mencionan específicamente.' },
        { id: '3', texto: 'Adultos', esCorrecta: false, feedback: 'Observa cuidadosamente los grupos nombrados en el mensaje.' },
        { id: '4', texto: 'Autoridades', esCorrecta: false, feedback: 'Las autoridades coordinan, pero el texto habla de quiénes se busca proteger, no quiénes actúan.' }
      ],
      pista: 'Lee atentamente el final de la oración para encontrar a los dos grupos de personas que se mencionan explícitamente.'
    },
    clave: { correcta: '1' }
  },
  {
    titulo: 'Identificar soluciones', fase: 'ANALYSIS', subPhase: '1.2', nivel: 'INTERMEDIATE',
    tipo: 'DRAG_AND_DROP',
    contenido: {
      contexto: null,
      pregunta: 'Arrastra cada elemento al cuadro correcto.',
      categorias: [
        { id: 'cat1', label: 'Solución defendida por el autor' },
        { id: 'cat2', label: 'Alternativa mencionada pero rechazada' }
      ],
      items: [
        { id: 'i1', texto: 'Poner costales de arena', categoriaCorrecta: 'cat1' },
        { id: 'i2', texto: 'Evacuar el barrio', categoriaCorrecta: 'cat2' }
      ],
      pista: 'El autor compara dos acciones y afirma que una es "mejor". Identifica la que él está apoyando.'
    },
    clave: { mapping: { i1: 'cat1', i2: 'cat2' } }
  },
  {
    titulo: 'Argumento de justificación', fase: 'ANALYSIS', subPhase: '1.2', nivel: 'INTERMEDIATE',
    tipo: 'ARROW_MATCHING',
    contenido: {
      contexto: null,
      pregunta: 'Une con una flecha cada solución con el argumento que la justifica.',
      izquierda: [
        { id: 'iz1', texto: 'Poner costales de arena' }
      ],
      derecha: [
        { id: 'de1', texto: 'Salvar vidas' },
        { id: 'de2', texto: 'Cuidar los bienes materiales' },
        { id: 'de3', texto: 'Seguir instrucciones oficiales' }
      ],
      pista: 'Los argumentos justifican la decisión y suelen aparecer para explicar un beneficio ("para evitar que...").'
    },
    clave: { arrows: [{ from: 'iz1', to: 'de2' }] }
  },
  {
    titulo: 'Largo plazo vs Corto plazo', fase: 'ANALYSIS', subPhase: '1.2', nivel: 'ADVANCED',
    tipo: 'CLASSIFICATION',
    contenido: {
      contexto: null,
      pregunta: 'Clasifica los siguientes elementos según su horizonte de impacto.',
      columnas: [
        { id: 'col1', label: 'Solución de corto plazo', color: 'orange' },
        { id: 'col2', label: 'Solución de largo plazo', color: 'blue' }
      ],
      items: [
        { id: 'it1', texto: 'Poner costales' },
        { id: 'it2', texto: 'Evacuar el barrio temporalmente' },
        { id: 'it3', texto: 'Reubicar familias' },
        { id: 'it4', texto: 'Cerrar vías temporalmente' }
      ],
      pista: 'Busca una acción que, aunque difícil y costosa hoy, tiene un efecto preventivo duradero "cada invierno".'
    },
    clave: { classification: { it1: 'col1', it2: 'col1', it3: 'col2', it4: 'col1' } }
  },
  {
    titulo: 'Argumento en contra', fase: 'ANALYSIS', subPhase: '1.2', nivel: 'ADVANCED',
    tipo: 'FILL_IN_THE_BLANK',
    contenido: {
      contexto: null,
      pregunta: 'Completa el espacio en blanco según el texto.',
      plantilla: 'Según el texto, el argumento en contra de reubicar familias es que _____.',
      opciones: ['es costoso hoy', 'toma mucho tiempo', 'no funciona', 'es impopular'],
      pista: 'Identifica la dificultad económica explícita que el texto señala como un obstáculo en el tiempo presente.'
    },
    clave: { respuestaExacta: 'es costoso hoy' }
  },

  // ══════════════════════════════════════════════════════════
  // FASE 2 - EVALUACIÓN — Subfase 2.1
  // ══════════════════════════════════════════════════════════
  {
    titulo: 'Fuentes Oficiales vs Informales', fase: 'EVALUATION', subPhase: '2.1', nivel: 'BASIC',
    tipo: 'TRAFFIC_LIGHT',
    contenido: {
      contexto: null,
      pregunta: 'Evalúa cada fuente y asígnale un color de semáforo según su confiabilidad.',
      fuentes: [
        { id: 'f1', nombre: 'Audio de WhatsApp anónimo' },
        { id: 'f2', nombre: 'Boletín oficial de la Alcaldía de Montería' }
      ],
      pista: 'Piensa en cuál de las dos fuentes representa a un ente gubernamental constituido y verificable, frente a un chat privado.'
    },
    clave: { trafficLight: { f1: 'red', f2: 'green' } }
  },
  {
    titulo: 'Fuentes anónimas', fase: 'EVALUATION', subPhase: '2.1', nivel: 'BASIC',
    tipo: 'MATCHING',
    contenido: {
      contexto: null,
      pregunta: 'Empareja cada fuente con su característica principal.',
      pares: [
        { id: 'A', izquierda: 'WhatsApp anónimo', derecha: 'No tiene autor verificable ni respaldo oficial' },
        { id: 'B', izquierda: 'Comunicado Oficial', derecha: 'Tiene autor y respaldo institucional' }
      ],
      pista: 'Una fuente anónima es aquella que circula sin el nombre del autor responsable y puede ser creada por cualquiera.'
    },
    clave: { matching: { A: 'No tiene autor verificable ni respaldo oficial', B: 'Tiene autor y respaldo institucional' } }
  },
  {
    titulo: 'Experiencia vs Conocimiento Técnico', fase: 'EVALUATION', subPhase: '2.1', nivel: 'INTERMEDIATE',
    tipo: 'MULTIPLE_CHOICE_REASONED',
    contenido: {
      contexto: null,
      pregunta: '¿Quién es el experto técnico capacitado en el tema?',
      opciones: [
        { id: '1', texto: 'Ingeniero hidráulico', esCorrecta: true, feedback: '¡Muy bien! Identificaste al profesional con formación técnica. Estás diferenciando experiencia de conocimiento especializado.' },
        { id: '2', texto: 'Vecino afectado', esCorrecta: false, feedback: 'Vivir la situación no necesariamente significa tener conocimientos técnicos sobre el comportamiento del agua.' },
        { id: '3', texto: 'Ambos por igual', esCorrecta: false, feedback: 'Aunque ambas perspectivas son valiosas, revisa quién tiene formación técnica específica.' },
        { id: '4', texto: 'Ninguno es confiable', esCorrecta: false, feedback: 'El informe técnico de un profesional sí es una fuente confiable en este contexto.' }
      ],
      pista: 'El experto es quien posee formación académica y técnica comprobable para evaluar estructuras físicas.'
    },
    clave: { correcta: '1' }
  },
  {
    titulo: 'Emoción vs Datos', fase: 'EVALUATION', subPhase: '2.1', nivel: 'INTERMEDIATE',
    tipo: 'CLASSIFICATION',
    contenido: {
      contexto: null,
      pregunta: 'Clasifica las siguientes afirmaciones según su tipo.',
      columnas: [
        { id: 'col1', label: 'Basada en emoción/experiencia personal', color: 'orange' },
        { id: 'col2', label: 'Basada en datos técnicos', color: 'blue' }
      ],
      items: [
        { id: 'it1', texto: '"El agua subió por las obras"' },
        { id: 'it2', texto: '"Lluvia acumulada de 40mm/h"' },
        { id: 'it3', texto: '"Nunca había pasado esto"' },
        { id: 'it4', texto: '"Saturación del suelo al 90%"' }
      ],
      pista: 'El testimonio personal suele generar opiniones válidas pero basadas en la experiencia emocional, no en estudios o mediciones.'
    },
    clave: { classification: { it1: 'col1', it2: 'col2', it3: 'col1', it4: 'col2' } }
  },
  {
    titulo: 'Intereses Ocultos', fase: 'EVALUATION', subPhase: '2.1', nivel: 'ADVANCED',
    tipo: 'TRAFFIC_LIGHT',
    contenido: {
      contexto: null,
      pregunta: 'Evalúa el nivel de neutralidad de cada fuente.',
      fuentes: [
        { id: 'f1', nombre: 'Candidato político en zona afectada' },
        { id: 'f2', nombre: 'Científico universitario (U. de Córdoba)' },
        { id: 'f3', nombre: 'Líder comunitario del barrio' },
        { id: 'f4', nombre: 'Vocero de ONG internacional' }
      ],
      pista: 'Evalúa quién de los personajes tiene un interés particular en ganar la simpatía o los votos de la gente en el barrio.'
    },
    clave: { trafficLight: { f1: 'red', f2: 'green', f3: 'yellow', f4: 'yellow' } }
  },
  {
    titulo: 'Neutralidad académica', fase: 'EVALUATION', subPhase: '2.1', nivel: 'ADVANCED',
    tipo: 'DRAG_AND_DROP',
    contenido: {
      contexto: null,
      pregunta: 'Arrastra cada fuente al cuadrante que le corresponde según su objetividad y propósito.',
      categorias: [
        { id: 'cat1', label: 'Alta objetividad / Propósito técnico' },
        { id: 'cat2', label: 'Alta subjetividad / Propósito político o emocional' }
      ],
      items: [
        { id: 'i1', texto: 'Estudio hidrológico', categoriaCorrecta: 'cat1' },
        { id: 'i2', texto: 'Discurso político en zona', categoriaCorrecta: 'cat2' },
        { id: 'i3', texto: 'Testimonio de vecino afectado', categoriaCorrecta: 'cat2' },
        { id: 'i4', texto: 'Boletín oficial de la Alcaldía', categoriaCorrecta: 'cat1' }
      ],
      pista: 'La neutralidad proviene de investigaciones y mediciones sistemáticas (como un estudio), ajenas a intereses de campaña política.'
    },
    clave: { mapping: { i1: 'cat1', i2: 'cat2', i3: 'cat2', i4: 'cat1' } }
  },

  // ══════════════════════════════════════════════════════════
  // FASE 2 - EVALUACIÓN — Subfase 2.2
  // ══════════════════════════════════════════════════════════
  {
    titulo: 'Causa y Efecto', fase: 'EVALUATION', subPhase: '2.2', nivel: 'BASIC',
    tipo: 'ARROW_MATCHING',
    contenido: {
      contexto: null,
      pregunta: 'Une con una flecha cada causa con su efecto lógico.',
      izquierda: [
        { id: 'iz1', texto: 'Lluvias intensas en zona alta' },
        { id: 'iz2', texto: 'Saturación del suelo' },
        { id: 'iz3', texto: 'Obstrucción de drenajes' }
      ],
      derecha: [
        { id: 'de1', texto: 'Desborde del río' },
        { id: 'de2', texto: 'Mayor riesgo de deslizamiento' },
        { id: 'de3', texto: 'Inundación de calles' }
      ],
      pista: 'El exceso de agua de lluvia baja por gravedad. ¿Tiene lógica que el nivel del río crezca si llueve mucho?'
    },
    clave: { arrows: [{ from: 'iz1', to: 'de1' }, { from: 'iz2', to: 'de2' }, { from: 'iz3', to: 'de3' }] }
  },
  {
    titulo: 'Identificar causa', fase: 'EVALUATION', subPhase: '2.2', nivel: 'BASIC',
    tipo: 'SEQUENCE_ORDER',
    contenido: {
      contexto: null,
      pregunta: 'Ordena los siguientes eventos de acuerdo con la secuencia lógica de causa a efecto.',
      items: [
        { id: 's1', texto: 'Lluvia intensa' },
        { id: 's2', texto: 'Saturación del suelo' },
        { id: 's3', texto: 'Desborde del río' },
        { id: 's4', texto: 'Calles inundadas' }
      ],
      pista: 'La causa es el evento natural original que desencadena el problema. ¿Qué suceso climático produce el agua?'
    },
    clave: { sequence: ['s1', 's2', 's3', 's4'] }
  },
  {
    titulo: 'Pasado vs Futuro', fase: 'EVALUATION', subPhase: '2.2', nivel: 'INTERMEDIATE',
    tipo: 'MULTIPLE_CHOICE_REASONED',
    contenido: {
      contexto: null,
      pregunta: '¿El hecho de que no pasara antes asegura que no pasará hoy?',
      opciones: [
        { id: '1', texto: 'No, las condiciones pueden cambiar', esCorrecta: true, feedback: '¡Excelente! Reconociste que el pasado no garantiza el futuro. Tu razonamiento está siendo más crítico.' },
        { id: '2', texto: 'Sí, si no pasó antes no pasará ahora', esCorrecta: false, feedback: 'Las condiciones climáticas y el nivel del río cambian cada año. Revisa si existe evidencia suficiente para estar seguro.' }
      ],
      pista: 'Las condiciones climáticas y geográficas cambian con los años. Una experiencia que no ocurrió en el pasado no es garantía para el presente.'
    },
    clave: { correcta: '1' }
  },
  {
    titulo: 'Fallas lógicas', fase: 'EVALUATION', subPhase: '2.2', nivel: 'INTERMEDIATE',
    tipo: 'MATCHING',
    contenido: {
      contexto: null,
      pregunta: 'Empareja cada afirmación con el tipo de error lógico que representa.',
      pares: [
        { id: 'A', izquierda: '"Mi casa es alta, nunca le llegará el agua"', derecha: 'Falsa seguridad' },
        { id: 'B', izquierda: '"En 2010 no pasó nada, hoy tampoco"', derecha: 'Generalización del pasado' },
        { id: 'C', izquierda: '"Si no llueve, no hay ningún riesgo"', derecha: 'Causa única' }
      ],
      pista: 'Afirmar que "nunca le llegará el agua" sin medir topográficamente cuántos metros subirá el nivel, es asumir una certeza absoluta sin pruebas.'
    },
    clave: { matching: { A: 'Falsa seguridad', B: 'Generalización del pasado', C: 'Causa única' } }
  },
  {
    titulo: 'Conclusiones y Falacias', fase: 'EVALUATION', subPhase: '2.2', nivel: 'ADVANCED',
    tipo: 'SEQUENCE_ORDER',
    contenido: {
      contexto: null,
      pregunta: 'Ordena los pasos del argumento según la secuencia lógica en que aparecen.',
      items: [
        { id: 'p1', texto: 'Premisa condicional: "Si no lloviera, no habría pobres"' },
        { id: 'p2', texto: 'Afirmación implícita: "La pobreza depende de factores climáticos"' },
        { id: 'p3', texto: 'Conclusión: "La lluvia causa pobreza"' }
      ],
      pista: 'La conclusión es la afirmación definitiva o el veredicto que el autor intenta demostrar. Suele aparecer después de un conector como "por tanto".'
    },
    clave: { sequence: ['p1', 'p2', 'p3'] }
  },
  {
    titulo: 'Conexión real y directa', fase: 'EVALUATION', subPhase: '2.2', nivel: 'ADVANCED',
    tipo: 'MULTIPLE_CHOICE_REASONED',
    contenido: {
      contexto: null,
      pregunta: '¿Existe una conexión real y directa de causa entre estos dos fenómenos?',
      opciones: [
        { id: '1', texto: 'No, la pobreza tiene múltiples causas socioeconómicas', esCorrecta: true, feedback: '¡Excelente análisis! La pobreza es producto de múltiples factores históricos, económicos y sociales que van mucho más allá del clima.' },
        { id: '2', texto: 'Sí, la lluvia puede generar pérdidas y empobrecimiento', esCorrecta: false, feedback: 'Aunque las inundaciones generan daños, eso no convierte a la lluvia en la causa directa de la pobreza como fenómeno estructural.' },
        { id: '3', texto: 'Solo si las lluvias son muy intensas', esCorrecta: false, feedback: 'La intensidad de la lluvia no establece una causalidad directa con la pobreza como condición social.' }
      ],
      pista: 'Considera si la pobreza es un problema socioeconómico complejo provocado por múltiples factores, o si de verdad se debe únicamente a que llueva.'
    },
    clave: { correcta: '1' }
  }
]

async function main() {
  console.log('🗑️  Eliminando actividades de Fases 1 y 2...')
  await prisma.activity.deleteMany({
    where: { fase: { in: ['ANALYSIS', 'EVALUATION'] } }
  })

  console.log('✨ Insertando 24 actividades reestructuradas...')
  for (const act of activities) {
    await prisma.activity.create({
      data: {
        titulo: act.titulo,
        fase: act.fase as any,
        subPhase: act.subPhase,
        nivel: act.nivel as any,
        tipo: act.tipo as any,
        contenido: act.contenido as any,
        claveRespuestas: act.clave as any,
        isPublished: true,
        puntajeMaximo: 100
      }
    })
    console.log(`  ✅ ${act.titulo} (${act.tipo})`)
  }

  console.log('\n🎉 Las 24 actividades fueron reestructuradas con éxito.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
