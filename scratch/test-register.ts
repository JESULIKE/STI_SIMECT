import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testRegister() {
  const name = "Test Student"
  const email = "test@student.com"
  const password = "password123"
  const studentCode = "EST-999"
  const role = "STUDENT"

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        code: studentCode || email,
        password: hashedPassword,
        role: role as Role,
        studentProfile: role === 'STUDENT' ? {
          create: {
            codigoEstudiantil: studentCode,
            totalPoints: 0,
            currentStreak: 0
          }
        } : undefined
      },
      include: {
        studentProfile: true
      }
    })
    console.log("SUCCESS:", user)
  } catch (error) {
    console.error("FAILURE:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testRegister()
