/**
 * Fragmentos de contexto narrativo por subfase.
 * Cada subfase tiene su propio fragmento de la historia de Mateo en Córdoba (2026),
 * que se muestra al estudiante ANTES de comenzar las actividades de esa subfase.
 * Esto le da el contexto necesario para responder con mayor comprensión.
 */
const CONTEXT_BY_SUBPHASE: Record<string, { titulo: string; subtitulo: string; contenido: string }> = {
  '1.1': {
    titulo: 'Inicio',
    subtitulo: 'Mateo analiza los hechos',
    contenido: `A inicios de febrero de 2026, un frente frío persistente hizo que el río Sinú creciera peligrosamente en Córdoba. Mateo, un joven estudiante con rol de líder, se encontraba en el centro de mando local analizando boletines meteorológicos para entender la situación real.

Mientras algunos vecinos decían que el cielo se veía "muy cargado", Mateo se enfocó en los hechos exactos: el nivel del río en Montería alcanzó los 7.5 metros esa mañana y el reporte del IDEAM indicaba lluvias intensas de 40mm/h.

Al notar que el suelo tenía una saturación del 90%, comprendió que había un riesgo inminente de inundación en zonas ribereñas.`
  },
  '1.2': {
    titulo: 'Inicio',
    subtitulo: 'Mateo toma una posición',
    contenido: `Con la información clara en sus manos — el nivel del río en 7.5 metros, lluvias de 40mm/h registradas por el IDEAM y un suelo saturado al 90% — Mateo debía actuar.

Tenía varias opciones sobre la mesa: esperar, reforzar las barreras, o evacuar. Analizando cada alternativa con calma, Mateo defendió la idea de realizar una evacuación preventiva para proteger a los niños y ancianos, priorizando salvar vidas sobre cualquier otra opción.

Su argumento era claro: ante un riesgo inminente y medido con datos reales, la acción preventiva era la más responsable.`
  },
  '2.1': {
    titulo: 'Nudo',
    subtitulo: 'La desinformación llega',
    contenido: `El pánico comenzó a crecer cuando la desinformación inundó los grupos de WhatsApp. Mateo asumió el papel de verificador de datos para decidir en quién confiar.

Recibió un audio anónimo que decía que la represa se había roto, pero lo comparó con el boletín oficial de la Alcaldía que decía "estable" y decidió creerle a la fuente institucional por ser más responsable.

También tuvo que corregir mensajes que mezclaban emociones con hechos: un vecino afectado culpaba a las obras del municipio, mientras que un ingeniero explicaba que la causa era la lluvia acumulada. Incluso detectó que algunos políticos daban discursos con intereses electorales, por lo que prefirió seguir los datos científicos de la Universidad.`
  },
  '2.2': {
    titulo: 'Nudo',
    subtitulo: 'Falacias que ponen vidas en riesgo',
    contenido: `Mientras coordinaba la respuesta, Mateo se enfrentó a argumentos que sonaban lógicos pero que escondían errores graves de razonamiento.

Un vecino decía que si en 2010 su casa no se había inundado, esta vez tampoco pasaría nada. Mateo le explicó que eso era una falsa información: las condiciones climáticas habían cambiado y no se podía confiar en la suerte. El pasado no garantiza el futuro cuando las variables son diferentes.

Otro insistía en que su casa era alta y "nunca le llegaría el agua". Mateo señaló que esa era una falsa seguridad: sin datos reales de nivel del río y proyecciones técnicas, esa confianza era peligrosa.`
  },
  '3.1': {
    titulo: 'Desenlace',
    subtitulo: 'Decisiones bajo presión',
    contenido: `Llegó el momento de tomar decisiones finales para ayudar a la comunidad. Mateo tuvo que elegir sus suministros con cuidado: decidió comprar agua potable en lugar de comida, priorizando la salud y la higiene para evitar infecciones por el agua sucia, ya que los canales de aguas residuales habían colapsado.

Luego, enfrentó un dilema difícil: un grupo de personas bloqueaba la vía como protesta, lo que impedía el paso de las ambulancias. Aplicando la justicia y la imparcialidad, Mateo ayudó a organizar un corredor humanitario, entendiendo que el derecho a la vida es superior a cualquier protesta.`
  },
  '3.2': {
    titulo: 'Desenlace',
    subtitulo: 'Soluciones de raíz',
    contenido: `Al terminar el día, Mateo reflexionó sobre todo lo que había vivido. Las decisiones inmediatas estaban tomadas: el corredor humanitario funcionaba, el agua potable llegaba a las familias, y la evacuación había sido ordenada.

Pero quedaba una pregunta más profunda: ¿cómo evitar que esto se repitiera? Mateo propuso que en lugar de solo dar mercados, el pueblo debería invertir en canales de drenaje definitivos para atacar el problema de raíz.

Al final, reflexionó sobre cómo había planeado y monitoreado sus propias decisiones durante toda la crisis, asegurándose de que su lógica fuera precisa y no basada en el miedo o en suposiciones sin evidencia.`
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const subPhase = query.subPhase as string | undefined

  const session = await getUserSession(event)
  const studentName = session.user?.name || 'Estudiante'

  if (subPhase && CONTEXT_BY_SUBPHASE[subPhase]) {
    const ctx = CONTEXT_BY_SUBPHASE[subPhase]
    return {
      success: true,
      isContext: true,
      data: {
        titulo: ctx.titulo,
        subtitulo: ctx.subtitulo,
        contenido: ctx.contenido.replace(/\[NOMBRE\]/g, studentName),
        subPhase
      }
    }
  }

  return {
    success: false,
    message: 'Contexto no encontrado para la subfase especificada'
  }
})
