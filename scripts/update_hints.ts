import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const hintsMapping: Record<string, string> = {
  // Las que funcionaron antes
  'Unidades de medida': 'Las unidades acompañan a los números para decirnos qué se está midiendo (ej. kilos, horas, o en este caso de altura, metros).',
  'Entidad emisora': 'Identifica las siglas o el nombre de la organización institucional/gubernamental encargada de emitir el boletín.',
  'Población prioritaria': 'Lee atentamente el final de la oración para encontrar a los dos grupos de personas que se mencionan explícitamente.',
  'Argumento en contra': 'Identifica la dificultad económica explícita que el texto señala como un obstáculo en el tiempo presente.',
  'Emoción vs Datos': 'El testimonio personal suele generar opiniones válidas pero basadas en la experiencia emocional, no en estudios o mediciones.',
  'Neutralidad académica': 'La neutralidad proviene de investigaciones y mediciones sistemáticas (como un estudio), ajenas a intereses de campaña política.',

  // Nuevas mapeadas a los títulos exactos
  'Identificación de hechos': 'Busca el número específico acompañado de la palabra "metros" dentro del texto.',
  'Datos técnicos vs Generales': 'Un dato técnico suele llevar números y unidades estandarizadas (como mm/h), a diferencia de las descripciones subjetivas como "muy cargado".',
  'Medidas complejas': 'Divide la información. "hPa" es la unidad de presión (hectopascales), mientras que el "%" se usa para la saturación.',
  'Porcentaje de saturación': 'Revisa detenidamente cuál de los dos valores numéricos viene acompañado explícitamente del símbolo de porcentaje (%).',

  'Acciones principales': 'Pregúntate: ¿Qué es la acción concreta e inmediata que el autor afirma que "debemos" hacer?',
  'Identificar soluciones': 'El autor compara dos acciones y afirma que una es "mejor". Identifica la que él está apoyando.',
  'Argumento de justificación': 'Los argumentos justifican la decisión y suelen aparecer para explicar un beneficio ("para evitar que...").',
  'Largo plazo vs Corto plazo': 'Busca una acción que, aunque difícil y costosa hoy, tiene un efecto preventivo duradero "cada invierno".',

  'Fuentes Oficiales vs Informales': 'Piensa en cuál de las dos fuentes representa a un ente gubernamental constituido y verificable, frente a un chat privado.',
  'Fuentes anónimas': 'Una fuente anónima es aquella que circula sin el nombre del autor responsable y puede ser creada por cualquiera.',
  'Experiencia vs Conocimiento Técnico': 'El experto es quien posee formación académica y técnica comprobable para evaluar estructuras físicas.',
  'Intereses Ocultos': 'Evalúa quién de los dos personajes tiene un interés particular en ganar la simpatía o los votos de la gente en el barrio.',

  'Causa y Efecto': 'El exceso de agua de lluvia baja por gravedad. ¿Tiene lógica que el nivel del río crezca si llueve mucho?',
  'Identificar causa': 'La causa es el evento natural original que desencadena el problema. ¿Qué suceso climático produce el agua?',
  'Pasado vs Futuro': 'Las condiciones climáticas y geográficas cambian con los años. Una experiencia que no ocurrió en el pasado no es garantía para el presente.',
  'Fallas lógicas': 'Afirmar que "nunca le llegará el agua" sin medir topográficamente cuántos metros subirá el nivel, es asumir una certeza absoluta sin pruebas.',
  'Conclusiones y Falacias': 'La conclusión es la afirmación definitiva o el veredicto que el autor intenta demostrar. Suele aparecer después de un conector como "por tanto".',
  'Conexión real y directa': 'Considera si la pobreza es un problema socioeconómico complejo provocado por múltiples factores, o si de verdad se debe únicamente a que llueva.'
}

async function main() {
  console.log('Iniciando actualización de Pistas (Tutor Hints)...')
  
  const activities = await prisma.activity.findMany()
  let updatedCount = 0

  for (const activity of activities) {
    const titulo = activity.titulo
    const hint = hintsMapping[titulo]

    if (hint) {
      const contenido: any = activity.contenido
      
      // Actualizamos el JSON para incluir la pista
      contenido.pista = hint

      await prisma.activity.update({
        where: { id: activity.id },
        data: { contenido }
      })
      console.log(`✅ Pista añadida a: "${titulo}" -> ${hint.substring(0, 40)}...`)
      updatedCount++
    } else {
      console.log(`⚠️ No se encontró pista para el título: "${titulo}"`)
    }
  }

  console.log(`\n🎉 Proceso completado. ${updatedCount} actividades actualizadas con pistas.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
