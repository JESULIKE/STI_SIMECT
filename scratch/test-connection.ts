import { PrismaClient } from '@prisma/client'

const passwords = [
  'gA!DkxcGwAX9Uv?',
  'gA!DkxcGwAX9Uv'
]

async function test() {
  for (const pw of passwords) {
    const encodedPw = encodeURIComponent(pw)
    
    // Test 1: Pooler URL
    const poolerUrl = `postgresql://postgres.pyawufaajaeiisiptqvm:${encodedPw}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
    console.log(`[POOLER] Testing "${pw}"...`)
    let prisma = new PrismaClient({ datasources: { db: { url: poolerUrl } } })
    try {
      await prisma.$connect()
      console.log(`✅ SUCCESS on Pooler with password: "${pw}"`)
      await prisma.$disconnect()
      return
    } catch (err: any) {
      console.log(`❌ FAILED Pooler: ${err.message.split('\n')[0]}`)
    }

    // Test 2: Direct URL via Supabase Direct Host
    const directUrl = `postgresql://postgres:${encodedPw}@db.pyawufaajaeiisiptqvm.supabase.co:5432/postgres`
    console.log(`[DIRECT] Testing "${pw}"...`)
    prisma = new PrismaClient({ datasources: { db: { url: directUrl } } })
    try {
      await prisma.$connect()
      console.log(`✅ SUCCESS on Direct with password: "${pw}"`)
      await prisma.$disconnect()
      return
    } catch (err: any) {
      console.log(`❌ FAILED Direct: ${err.message.split('\n')[0]}`)
    }
    console.log("-----------------------------------------")
  }
  console.log("All connection attempts failed.")
}

test()
