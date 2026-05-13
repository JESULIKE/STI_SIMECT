export interface BaseActivityContent {
  instrucciones: string
  tiempoEstimadoMinutos?: number
}

export interface DragAndDropContent extends BaseActivityContent {
  elementos: string[]
  categorias: string[]
}

export interface MultipleChoiceReasonedContent extends BaseActivityContent {
  pregunta: string
  opciones: { id: string; texto: string }[]
  requiereJustificacion: boolean
}

export interface TextMarkupContent extends BaseActivityContent {
  textoOriginal: string
  coloresEtiquetas: { id: string; color: string; label: string }[]
}

export interface ArgumentBuilderContent extends BaseActivityContent {
  premisasDisponibles: string[]
  evidenciasDisponibles: string[]
  conclusionesDisponibles: string[]
}

export interface FallacyIdentificationContent extends BaseActivityContent {
  textoFalaz: string
  falaciasPosibles: string[]
}

export interface OpenJudgmentContent extends BaseActivityContent {
  casoDeEstudio: string
  criteriosRubrica: string[]
}

// Un tipo de unión para facilitar el uso en el frontend
export type ActivityContentJSON =
  | DragAndDropContent
  | MultipleChoiceReasonedContent
  | TextMarkupContent
  | ArgumentBuilderContent
  | FallacyIdentificationContent
  | OpenJudgmentContent
