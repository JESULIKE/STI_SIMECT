import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testConflict() {
  const name = "Conflict Student"
  const email = "conflict@student.com"
  const password = "password123"
  const studentCode = "EST-001" // ALREADY EXISTS in seed
  const role = "STUDENT"

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Attempting create directly to see Prisma error
    const user = await prisma.user.create({
      data: {
        name,
        email,
        code: studentCode,
        password: hashedPassword,
        role: role as Role,
        studentProfile: {
          create: {
            codigoEstudiantil: studentCode,
            totalPoints: 0,
            currentStreak: 0
          }
        }
      }
    })
    console.log("SUCCESS:", user)
  } catch (error: any) {
    console.error("FAILURE CODE:", error.code)
    console.error("FAILURE MESSAGE:", error.message)
    console.error("FAILURE META:", error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

testConflict()
