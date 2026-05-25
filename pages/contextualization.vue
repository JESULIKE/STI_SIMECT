<script setup lang="ts">
definePageMeta({ layout: 'main' })

// Historia completa de Mateo (inicio + nudo + desenlace)
const historyChapters = [
  {
    tag: 'Inicio',
    emoji: '🌊',
    color: 'bg-blue-50 border-blue-200',
    tagColor: 'bg-blue-100 text-blue-700',
    title: 'Mateo analiza los hechos',
    content: `A inicios de febrero de 2026, los efectos de un frente frío persistente hicieron que el río Sinú creciera peligrosamente en Córdoba. Mateo, un joven estudiante de la región, asumió el rol de líder en el centro de mando local con la misión de organizar la respuesta comunitaria basada en la ciencia y no en el pánico.

Mientras algunos vecinos se dejaban llevar por la impresión visual diciendo que el cielo solo se veía "muy cargado", Mateo entendió que para coordinar una ayuda real necesitaba hechos exactos. Al revisar los reportes oficiales, identificó que el nivel del río en Montería alcanzó los 7.5 metros esa mañana y que el boletín del IDEAM indicaba lluvias intensas de 40mm/h.

Al cruzar estos datos con la saturación del suelo al 90%, calculó un riesgo inminente de inundación para las zonas ribereñas. Con este panorama técnico claro, Mateo construyó su primera gran propuesta: defender y organizar una evacuación preventiva enfocada en proteger prioritariamente a los niños y ancianos del sector, poniendo a salvo las vidas antes que los objetos materiales.`
  },
  {
    tag: 'Nudo',
    emoji: '📱',
    color: 'bg-orange-50 border-orange-200',
    tagColor: 'bg-orange-100 text-orange-700',
    title: 'La desinformación y las falacias',
    content: `El pánico comenzó a crecer cuando la desinformación inundó los grupos de WhatsApp. Mateo asumió el papel de verificador de datos para decidir en quién confiar. Recibió un audio anónimo que decía que la represa se había roto, pero lo comparó con el boletín oficial de la Alcaldía que decía "estable" y decidió creerle a la fuente institucional por ser más responsable.

También tuvo que corregir a quienes usaban ideas equivocadas; un vecino decía que si en 2010 su casa no se había inundado, esta vez tampoco pasaría nada. Mateo le explicó que eso era una falsa información y que no se podía confiar en la suerte, pues el clima había cambiado. Incluso detectó que algunos políticos daban discursos con intereses electorales, por lo que prefirió seguir los datos científicos de la Universidad.`
  },
  {
    tag: 'Desenlace',
    emoji: '🎯',
    color: 'bg-emerald-50 border-emerald-200',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: 'Decisiones y soluciones de raíz',
    content: `Llegó el momento de tomar decisiones finales para ayudar a la comunidad de Montería. En lugar de dejarse llevar por el desespero de la emergencia, Mateo utilizó la lógica de datos que traía desde el centro de mando para asesorar al comité del barrio.

Primero, ayudó a decidir las prioridades de asistencia: demostró que, debido al colapso de las redes de alcantarillado, la prioridad absoluta debía ser asegurar agua potable antes que alimentos, protegiendo la salud contra infecciones por agua sucia. Luego, enfrentó un dilema de argumentos: un grupo de vecinos quería bloquear la vía principal en protesta por la lentitud de las ayudas, lo que impediría el paso de los organismos de socorro y ambulancias.

Aplicando su pensamiento crítico, Mateo los convenció de que el derecho a la vida y el acceso de las brigadas médicas eran superiores a cualquier protesta, logrando que se mantuviera un corredor libre. Finalmente, propuso que la solución real no era solo repartir mercados, sino exigir proyectos de largo plazo como canales de drenaje definitivos y la reubicación de las familias en zonas de riesgo.

Al terminar el día, Mateo reflexionó sobre cómo la planeación, el monitoreo de los datos y una lógica precisa lograron salvar al barrio, demostrando que el pensamiento crítico es la mejor herramienta ante una emergencia.`
  }
]

const activeChapter = ref(0)
</script>

<template>
  <div class="min-h-screen p-6 lg:p-12">
    <div class="max-w-5xl mx-auto space-y-12">

      <!-- Header -->
      <header class="space-y-2">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">SIMECT — Contextualización</span>
        <h1 class="text-4xl font-black text-black italic uppercase tracking-tighter">El Sistema y el Tema</h1>
        <p class="text-black font-medium italic">Consulta esta información cuando quieras para recordar el contexto del sistema.</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- ── Columna izquierda: Info del sistema ── -->
        <div class="space-y-6">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black">¿Qué es y cómo funciona SIMECT?</h2>

          <!-- Qué es -->
          <div class="bg-white rounded-[40px] p-8 shadow-xl border-2 border-white">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">🤖</div>
              <div>
                <h3 class="font-black text-black uppercase tracking-tight text-base">Sistema Tutor Inteligente</h3>
                <p class="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  SIMECT está diseñado para alumnos de <strong>grado octavo y noveno</strong>.
                  En lugar de evaluar de forma tradicional, estimula el <strong>pensamiento crítico</strong>,
                  la <strong>metacognición</strong> y la <strong>toma de decisiones</strong>.
                </p>
              </div>
            </div>
          </div>

          <!-- Cómo funciona -->
          <div class="bg-white rounded-[40px] p-8 shadow-xl border-2 border-white">
            <div class="flex items-start gap-4 mb-6">
              <div class="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">⚙️</div>
              <div>
                <h3 class="font-black text-black uppercase tracking-tight text-base">Estructura del Sistema</h3>
                <p class="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  <strong>3 fases</strong> · <strong>6 subfases</strong> · <strong>12 actividades</strong> obligatorias
                </p>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div v-for="(f, i) in [
                { num: '1', name: 'Análisis', emoji: '🔍', subs: '2 subfases' },
                { num: '2', name: 'Evaluación', emoji: '⚖️', subs: '2 subfases' },
                { num: '3', name: 'Juicio', emoji: '🎯', subs: '2 subfases' }
              ]" :key="i"
                class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 text-center"
              >
                <span class="block text-2xl mb-1">{{ f.emoji }}</span>
                <span class="block text-xs font-black text-black uppercase">Fase {{ f.num }}</span>
                <span class="block text-[10px] font-bold text-indigo-600 uppercase tracking-wide">{{ f.name }}</span>
                <span class="block text-[9px] text-slate-400 font-bold mt-1">{{ f.subs }}</span>
              </div>
            </div>
          </div>

          <!-- Datos del tema -->
          <div class="bg-white rounded-[40px] p-8 shadow-xl border-2 border-white">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">🌊</div>
              <div>
                <h3 class="font-black text-black uppercase tracking-tight text-base">El Tema: Inundaciones en Córdoba</h3>
                <p class="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Febrero 2026 · Frente frío persistente · Río Sinú
                </p>
              </div>
            </div>

            <!-- Imagen de Contexto -->
            <div class="mb-6 rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-sm">
              <img src="/Contexto.png" alt="Inundaciones en Córdoba" class="w-full object-cover h-48 md:h-64 transition-transform hover:scale-105 duration-700" />
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div class="bg-blue-50 border-2 border-blue-100 rounded-3xl p-4 text-center">
                <span class="block text-xl font-black text-blue-700">7.5 m</span>
                <span class="block text-[9px] font-black uppercase tracking-widest text-blue-600 mt-1">Nivel del río</span>
              </div>
              <div class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 text-center">
                <span class="block text-xl font-black text-slate-700">40mm/h</span>
                <span class="block text-[9px] font-black uppercase tracking-widest text-slate-600 mt-1">Lluvia IDEAM</span>
              </div>
              <div class="bg-amber-50 border-2 border-amber-100 rounded-3xl p-4 text-center">
                <span class="block text-xl font-black text-amber-700">90%</span>
                <span class="block text-[9px] font-black uppercase tracking-widest text-amber-600 mt-1">Saturación suelo</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Columna derecha: Historia de Mateo ── -->
        <div class="space-y-6">
          <h2 class="text-xs font-black uppercase tracking-[0.4em] text-black">La Historia — Mateo en Montería</h2>

          <!-- Tabs -->
          <div class="flex gap-2 bg-white rounded-2xl p-1.5 shadow-md border-2 border-white">
            <button
              v-for="(ch, i) in historyChapters" :key="i"
              @click="activeChapter = i"
              class="flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              :class="activeChapter === i ? 'bg-indigo-600 text-white shadow-md' : 'text-black hover:bg-slate-50'"
            >
              {{ ch.emoji }} {{ ch.tag }}
            </button>
          </div>

          <!-- Contenido del capítulo activo -->
          <div
            v-for="(ch, i) in historyChapters" :key="i"
            v-show="activeChapter === i"
            class="bg-white rounded-[40px] p-8 shadow-xl border-2 border-white animate-in fade-in duration-300"
          >
            <div class="flex items-center gap-3 mb-6">
              <span class="text-3xl">{{ ch.emoji }}</span>
              <div>
                <span class="text-[10px] font-black uppercase tracking-widest" :class="ch.tagColor.split(' ')[1]">{{ ch.tag }}</span>
                <h3 class="font-black text-black uppercase tracking-tight text-base leading-tight">{{ ch.title }}</h3>
              </div>
            </div>

            <div class="space-y-4">
              <p
                v-for="(paragraph, pi) in ch.content.split('\n\n').filter(p => p.trim())"
                :key="pi"
                class="text-slate-700 text-sm font-medium leading-relaxed"
                :class="pi === 0 ? 'first-letter:text-3xl first-letter:font-black first-letter:mr-1 first-letter:float-left first-letter:text-indigo-600 first-letter:leading-none' : ''"
              >
                {{ paragraph }}
              </p>
            </div>
          </div>

          <!-- Datos clave del capítulo 0 -->
          <div v-if="activeChapter === 0" class="grid grid-cols-3 gap-3">
            <div class="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-4 text-center">
              <span class="block text-lg font-black text-indigo-700">7.5 m</span>
              <span class="block text-[9px] font-black uppercase text-indigo-600 mt-1">Nivel río</span>
            </div>
            <div class="bg-slate-50 border-2 border-slate-100 rounded-3xl p-4 text-center">
              <span class="block text-lg font-black text-slate-700">40mm/h</span>
              <span class="block text-[9px] font-black uppercase text-slate-600 mt-1">Lluvia</span>
            </div>
            <div class="bg-amber-50 border-2 border-amber-100 rounded-3xl p-4 text-center">
              <span class="block text-lg font-black text-amber-700">90%</span>
              <span class="block text-[9px] font-black uppercase text-amber-600 mt-1">Saturación</span>
            </div>
          </div>

          <!-- Botón volver al dashboard -->
          <NuxtLink to="/dashboard" class="flex items-center justify-center gap-3 w-full py-5 rounded-[32px] border-2 border-slate-200 text-sm font-black uppercase tracking-widest text-black hover:border-indigo-300 hover:bg-indigo-50 transition-all">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver al Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
