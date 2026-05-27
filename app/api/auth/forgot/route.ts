import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string }
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email tidak valid.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ ok: true })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60)
    await prisma.passwordReset.create({ data: { token, userId: user.id, expiresAt } })

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset token for ${email}: ${token}`)
      return Response.json({ ok: true, token })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
