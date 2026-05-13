import { PrismaClient } from '@prisma/client'
import { evaluateActivity } from './server/utils/pedagogicalEngine'

const prisma = new PrismaClient()

async function test() {
  const studentProfileId = '6aa64f46-d23b-4272-be3d-189a2d17482b' // del log anterior
  
  const activities = await prisma.activity.findMany()
  if (activities.length === 0) {
    console.log("No hay actividades en DB.")
    return
  }
  
  const activityId = activities[0].id
  console.log("Activity ID:", activityId)
  
  try {
    const [activity, profile] = await Promise.all([
      prisma.activity.findUnique({ where: { id: activityId } }),
      prisma.studentProfile.findUnique({ 
        where: { id: studentProfileId },
        include: { progresses: true } 
      })
    ])

    if (!activity || !profile) {
      console.log('Actividad o Perfil no encontrado')
      return
    }
    
    console.log("Profile found:", profile.id)
    console.log("Activity found:", activity.id)

  } catch (error) {
    console.error("Error:", error)
  }
}

test().finally(() => prisma.$disconnect())
