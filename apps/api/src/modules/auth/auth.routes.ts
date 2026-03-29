import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AuthService } from './auth.service'
import { requirePermission } from '../../lib/permissions'
import { Role } from '@prisma/client'

const registerClinicSchema = z.object({
  clinicName:      z.string().min(2),
  clinicCnpj:      z.string().length(14),
  clinicSlug:      z.string().min(2).regex(/^[a-z0-9-]+$/),
  clinicPhone:     z.string().optional(),
  clinicEmail:     z.string().email().optional(),
  adminName:       z.string().min(2),
  adminEmail:      z.string().email(),
  adminPassword:   z.string().min(8),
})

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

const createUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['ADMIN', 'MEDICO', 'FINANCEIRO', 'ATENDENTE']),
})

export async function authRoutes(app: FastifyInstance) {

  // POST /auth/register-clinic
  // Apenas SUPER_ADMIN pode criar novas clínicas
  app.post('/auth/register-clinic', {
    preHandler: [app.authenticate, requirePermission('clinicas:manage')],
  }, async (request, reply) => {
    const body = registerClinicSchema.parse(request.body)
    const result = await AuthService.registerClinic(body)
    return reply.status(201).send(result)
  })

  // POST /auth/login
  app.post('/auth/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body)
    const user = await AuthService.login({ email, password })

    const accessToken = app.jwt.sign(
      { id: user.id, role: user.role, clinicId: user.clinic?.id },
      { expiresIn: '15m' }
    )

    const refreshToken = app.jwt.sign(
      { id: user.id, type: 'refresh' },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await AuthService.saveRefreshToken(user.id, refreshToken, expiresAt)

    return reply.send({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinic: user.clinic,
      },
    })
  })

  // POST /auth/refresh
  app.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }

    let payload: any
    try {
      payload = app.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })
    } catch {
      return reply.status(401).send({ error: 'Refresh token inválido' })
    }

    const stored = await AuthService.findRefreshToken(refreshToken)
    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Refresh token expirado' })
    }

    await AuthService.revokeRefreshToken(refreshToken)

    const user = stored.user
    const newAccess = app.jwt.sign(
      { id: user.id, role: user.role, clinicId: user.clinicId },
      { expiresIn: '15m' }
    )
    const newRefresh = app.jwt.sign(
      { id: user.id, type: 'refresh' },
      { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await AuthService.saveRefreshToken(user.id, newRefresh, expiresAt)

    return reply.send({ accessToken: newAccess, refreshToken: newRefresh })
  })

  // POST /auth/logout
  app.post('/auth/logout', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }
    await AuthService.revokeRefreshToken(refreshToken).catch(() => {})
    return reply.send({ message: 'Logout realizado' })
  })

  // POST /users — Admin cria usuários na própria clínica
  app.post('/users', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const body = createUserSchema.parse(request.body)
    const currentUser = request.user as { role: Role; clinicId?: string }

    // Admin só pode criar para a própria clínica
    const clinicId = currentUser.role === 'SUPER_ADMIN'
      ? (request.body as any).clinicId
      : currentUser.clinicId

    if (!clinicId) {
      return reply.status(400).send({ error: 'clinicId obrigatório' })
    }

    const user = await AuthService.createUser({
      ...body,
      role: body.role as Role,
      clinicId,
    })

    return reply.status(201).send(user)
  })

  // GET /auth/me
  app.get('/auth/me', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    return reply.send(request.user)
  })
}
