import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: unknown; password?: unknown }
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''
    if (!token || !password) {
      return Response.json({ error: 'Token dan password wajib diisi.' }, { status: 400 })
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } })
    if (!reset || reset.expiresAt.getTime() < Date.now()) {
      return Response.json({ error: 'Token tidak valid atau sudah kadaluarsa.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } })
    await prisma.passwordReset.deleteMany({ where: { userId: reset.userId } })
    return Response.json({ ok: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
