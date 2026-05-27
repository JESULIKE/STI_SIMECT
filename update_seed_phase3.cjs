const fs = require('fs');

const map = {
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
let lines = content.split('\n');
let currentTitle = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const titleMatch = line.match(/titulo:\s*['"](.+)['"],/);
  if (titleMatch) {
    currentTitle = titleMatch[1];
  }

  // Find the start of the `contenido` object to inject the `contexto` property
  if (line.includes('contenido: {')) {
    if (currentTitle && map[currentTitle]) {
      // Avoid inserting if it already has 'contexto' on the next few lines
      let hasContexto = false;
      for (let j = 1; j < 5; j++) {
        if (lines[i+j] && lines[i+j].includes('contexto:')) {
          hasContexto = true;
        }
      }
      
      if (!hasContexto) {
        // Insert right after `contenido: {`
        lines.splice(i + 1, 0, `        contexto: "${map[currentTitle]}",`);
      } else {
         // Replace existing
         for (let j = 1; j < 5; j++) {
           if (lines[i+j] && lines[i+j].includes('contexto:')) {
             lines[i+j] = `        contexto: "${map[currentTitle]}",`;
           }
         }
      }
    }
  }
}

fs.writeFileSync('prisma/seed.ts', lines.join('\n'), 'utf8');
console.log('Phase 3 context added successfully');
