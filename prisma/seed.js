const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main(){
  const prisma = new PrismaClient()
  const hashed = await bcrypt.hash('oldpassword', 10)
  await prisma.user.create({ data: { email: 'e2e@test.local', name: 'E2E Test', password: hashed, status: 'APPROVED' } })
  console.log('seeded')
  await prisma.$disconnect()
}

main().catch(e=>{ console.error(e); process.exit(1) })
