import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(){
  const hashed = await bcrypt.hash('oldpassword', 10)
  await prisma.user.create({ data: { email: 'e2e@test.local', name: 'E2E Test', password: hashed, status: 'APPROVED' } })
  console.log('seeded')
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
