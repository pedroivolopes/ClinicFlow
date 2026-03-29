import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { UsersService } from './users.service'
import { requirePermission } from '../../lib/permissions'
import { Role } from '@prisma/client'

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'MEDICO', 'FINANCEIRO', 'ATENDENTE']).optional(),
})

export async function usersRoutes(app: FastifyInstance) {

  // GET /users — lista usuários da clínica
  app.get('/users', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const user = request.user as { clinicId?: string; role: Role }

    const clinicId = user.role === 'SUPER_ADMIN'
      ? (request.query as any).clinicId
      : user.clinicId

    if (!clinicId) {
      return reply.status(400).send({ error: 'clinicId obrigatório' })
    }

    const users = await UsersService.listByClinic(clinicId)
    return reply.send(users)
  })

  // GET /users/:id — busca usuário por ID
  app.get('/users/:id', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const currentUser = request.user as { clinicId?: string; role: Role }

    const clinicId = currentUser.role === 'SUPER_ADMIN' ? undefined : currentUser.clinicId

    const user = await UsersService.findById(id, clinicId)
    if (!user) return reply.status(404).send({ error: 'Usuário não encontrado' })

    return reply.send(user)
  })

  // PATCH /users/:id — atualiza nome e/ou role
  app.patch('/users/:id', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const currentUser = request.user as { clinicId?: string; role: Role }
    const body = updateUserSchema.parse(request.body)

    if (!currentUser.clinicId && currentUser.role !== 'SUPER_ADMIN') {
      return reply.status(400).send({ error: 'clinicId obrigatório' })
    }

    const updated = await UsersService.update(id, currentUser.clinicId!, body as any)
    return reply.send(updated)
  })

  // PATCH /users/:id/activate — ativa usuário
  app.patch('/users/:id/activate', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const currentUser = request.user as { clinicId: string }

    const user = await UsersService.setActive(id, true, currentUser.clinicId)
    return reply.send(user)
  })

  // PATCH /users/:id/deactivate — desativa usuário
  app.patch('/users/:id/deactivate', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const currentUser = request.user as { clinicId: string }

    const user = await UsersService.setActive(id, false, currentUser.clinicId)
    return reply.send(user)
  })
}
