import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, code: true, role: true } })
  console.log('Users:', JSON.stringify(users, null, 2))
  const profiles = await prisma.studentProfile.findMany({ select: { id: true, codigoEstudiantil: true } })
  console.log('StudentProfiles:', JSON.stringify(profiles, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
