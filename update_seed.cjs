const fs = require('fs');

const map = {
  "Identificación de hechos": "El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana.",
  "Unidades de medida": "El nivel del río Sinú en Montería alcanzó los 7.5 metros esta mañana.",
  "Datos técnicos vs Generales": "El boletín del IDEAM indica lluvias de 40mm/h; el cielo se observa 'muy cargado'.",
  "Entidad emisora": "El boletín del IDEAM indica lluvias de 40mm/h.",
  "Medidas complejas": "La presión de 1012 hPa y la saturación del suelo al 90% sugieren riesgo.",
  "Porcentaje de saturación": "La saturación del suelo ha llegado al 90% en las laderas.",
  "Acciones principales": "Debemos evacuar el barrio para proteger a los niños y ancianos.",
  "Población prioritaria": "Debemos evacuar para proteger a niños y ancianos prioritariamente.",
  "Identificar soluciones": "Poner costales de arena es mejor que salir, porque así cuidamos las casas.",
  "Argumento de justificación": "Poner costales es mejor para evitar que el agua dañe los muebles.",
  "Largo plazo vs Corto plazo": "Reubicar familias es costoso hoy, pero evita tragedias cíclicas cada invierno.",
  "Argumento en contra": "Reubicar familias implica una inversión muy alta en este momento.",
  "Fuentes Oficiales vs Informales": "Audio WhatsApp: 'Se rompió la represa'. Boletín Alcaldía: 'Estable'.",
  "Fuentes anónimas": "WhatsApp anónimo vs Comunicado Oficial de Montería.",
  "Experiencia vs Conocimiento Técnico": "Testimonio de un vecino afectado vs Informe de un ingeniero.",
  "Emoción vs Datos": "Vecino: 'El agua subió por culpa de las obras'. Ingeniero: 'Por lluvia'.",
  "Intereses Ocultos": "Científico de la Universidad vs Candidato a la Alcaldía en barrio.",
  "Neutralidad académica": "Estudio hidrológico vs Discurso de político en zona afectada.",
  "Causa y Efecto": "Llovió mucho en la parte alta, por eso el río se desbordó.",
  "Identificar causa": "Lluvias intensas -> Inundación de calles.",
  "Pasado vs Futuro": "En 2010 no se inundó mi casa, así que ahora tampoco pasará nada.",
  "Fallas lógicas": "Mi casa es alta, nunca le llegará el agua.",
  "Conclusiones y Falacias": "Si no lloviera, no habría pobres; por tanto, la lluvia causa pobreza.",
  "Conexión real y directa": "Lluvia -> Pobreza.",
  "Priorización de Supervivencia": "Debo decidir entre comprar agua potable o comida para hoy.",
  "Tipos de Necesidades y Decisiones": "Agua o Comida: Solo tengo dinero para una cosa.",
  "Valor Humano vs Bienes": "Prefiero quedarme en el techo cuidando mi televisor que ir al albergue.",
  "Lógica Técnica vs Miedo": "Decidir quedarse en casa inundada por miedo al robo.",
  "Inversión Preventiva vs Inmediata": "Invertir en canales de drenaje definitivos vs. dar mercados hoy.",
  "Propuestas de Infraestructura": "Propuesta ciudadana: Infraestructura contra inundaciones.",
  "Identificación de Perspectivas": "Alcalde: 'Evacuen'. Niño: 'Tengo miedo de dejar mi perro'.",
  "La Perspectiva Emocional": "El niño llora porque no quiere dejar su mascota.",
  "Amenaza del Frente Frío": "El vecino de la orilla pide que cierren las compuertas ya. Teme perder su hogar",
  "Pluralidad de Perspectivas": "Un mismo fenómeno (lluvia) visto por dos personas distintas.",
  "Conflicto de Derechos": "Cerrar la vía por protesta ayuda al pueblo, pero frena ambulancias.",
  "Perspectiva y Tipos de Derechos": "Derecho a la protesta vs Derecho a la salud/vida."
};

let content = fs.readFileSync('prisma/seed.ts', 'utf8');

// The file has blocks like:
// titulo: "Identificación de hechos",
// ...
// contenido: {
//   "contexto": null,

// We will split the content line by line, keep track of the last seen title, and replace "contexto": null if we have a mapping.

let lines = content.split('\n');
let currentTitle = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const titleMatch = line.match(/titulo:\s*['"](.+)['"],/);
  if (titleMatch) {
    currentTitle = titleMatch[1];
  }

  if (line.includes('"contexto": null,') || line.includes("'contexto': null,")) {
    if (currentTitle && map[currentTitle]) {
      lines[i] = line.replace(/("contexto":\s*)null,/, `$1"${map[currentTitle]}",`);
      lines[i] = lines[i].replace(/('contexto':\s*)null,/, `$1"${map[currentTitle]}",`);
    }
  }
}

fs.writeFileSync('prisma/seed.ts', lines.join('\n'), 'utf8');
console.log('Seed file updated successfully');
