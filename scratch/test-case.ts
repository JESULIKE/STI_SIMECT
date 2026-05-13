import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testCaseSensitivity() {
  const email = "case@test.com"
  const studentCode = "est-001" // Lowercase version of existing EST-001

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { code: studentCode }
        ]
      }
    })
    console.log("EXISTING USER FOUND:", existingUser ? existingUser.code : "NONE")
    
    if (!existingUser) {
        console.log("Attempting to create with lowercase code...")
        await prisma.user.create({
            data: {
                name: "Case Test",
                email,
                code: studentCode,
                password: "password",
                role: "STUDENT"
            }
        })
        console.log("SUCCESSFULLY CREATED (This means DB is case-sensitive and allowed duplicate semantic code)")
    }
  } catch (error: any) {
    console.error("FAILURE CODE:", error.code)
    console.error("FAILURE MESSAGE:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testCaseSensitivity()
