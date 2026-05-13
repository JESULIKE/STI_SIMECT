import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("USERS:", await prisma.user.findMany())
  console.log("PROFILES:", await prisma.studentProfile.findMany())
}

main().finally(() => prisma.$disconnect())
