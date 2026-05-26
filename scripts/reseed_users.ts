import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Recreando usuarios y badges (sin tocar actividades)...')

  const commonPassword = await bcrypt.hash('Jesu123', 10)

  // Docente
  const teacherUser = await prisma.user.upsert({
    where: { email: 'jesus@simect.com' },
    update: {},
    create: {
      email: 'jesus@simect.com',
      code: 'DOC-000',
      name: 'Jesus Gonzalez',
      password: commonPassword,
      role: Role.TEACHER,
    }
  })
  console.log(`✅ Docente: ${teacherUser.email} / DOC-000 / Pass: Jesu123`)

  // Estudiante
  const studentUser = await prisma.user.upsert({
    where: { email: 'jesus.estudiante@simect.com' },
    update: {},
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
    include: { studentProfile: true }
  })
  console.log(`✅ Estudiante: ${studentUser.email} / EST-000 / Pass: Jesu123`)

  // Badges
  const badges = [
    { nombre: 'Primer Paso', descripcion: 'Has comenzado tu viaje de pensamiento crítico.', icono: '🌱', condiciones: { type: 'FIRST_ACTIVITY' } },
    { nombre: 'Analista', descripcion: 'Dominas el análisis de información.', icono: '🔍', condiciones: { type: 'PHASE_COMPLETE', phase: 'ANALYSIS' } },
    { nombre: 'Evaluador Crítico', descripcion: 'Tu capacidad de evaluar información es sobresaliente.', icono: '⚖️', condiciones: { type: 'PHASE_COMPLETE', phase: 'EVALUATION' } },
    { nombre: 'Juez Razonado', descripcion: 'Formulas juicios argumentados con excelencia.', icono: '📝', condiciones: { type: 'PHASE_COMPLETE', phase: 'JUDGMENT' } },
    { nombre: 'Guardián del Bosque', descripcion: 'Has dominado el pensamiento básico.', icono: '🌲', condiciones: { type: 'LEVEL_COMPLETE', level: 'BASIC' } },
    { nombre: 'Defensor del Ecosistema', descripcion: 'Tu pensamiento crítico de nivel intermedio es sobresaliente.', icono: '🌿', condiciones: { type: 'LEVEL_COMPLETE', level: 'INTERMEDIATE' } },
    { nombre: 'Héroe Ambiental', descripcion: '¡Has alcanzado el dominio completo!', icono: '🦸', condiciones: { type: 'LEVEL_COMPLETE', level: 'ADVANCED' } },
    { nombre: 'Mente Reflexiva', descripcion: 'La práctica constante de la metacognición te ha convertido en un pensador más consciente.', icono: '🧘', condiciones: { type: 'REFLECTIONS_COUNT', count: 10 } },
    { nombre: 'Constante', descripcion: 'Mantuviste 3 días consecutivos de práctica.', icono: '🔥', condiciones: { type: 'STREAK', days: 3 } },
    { nombre: 'Dedicado', descripcion: '7 días consecutivos de práctica intelectual.', icono: '💎', condiciones: { type: 'STREAK', days: 7 } },
    { nombre: 'Perfección', descripcion: 'Obtuviste el máximo desempeño posible en una actividad.', icono: '⭐', condiciones: { type: 'PERFECT_SCORE' } },
    { nombre: 'Mente Ágil', descripcion: 'Tu velocidad combinada con precisión es impresionante.', icono: '⚡', condiciones: { type: 'SPEED_ACCURACY' } },
    { nombre: 'Persistente', descripcion: 'Superaste una actividad de refuerzo en tu primer intento.', icono: '💪', condiciones: { type: 'REINFORCEMENT_FIRST_TRY' } },
    { nombre: 'Autoconocimiento', descripcion: 'Tu calibración metacognitiva precisa demuestra alto autoconocimiento.', icono: '🪞', condiciones: { type: 'PRECISE_CALIBRATION' } },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { nombre: badge.nombre },
      update: {},
      create: badge
    })
  }
  console.log(`✅ ${badges.length} badges sembrados`)

  const actCount = await prisma.activity.count()
  console.log(`\nActividades en DB: ${actCount}`)
  console.log('\n🎉 ¡Base de datos restaurada! Ya puedes iniciar sesión.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
