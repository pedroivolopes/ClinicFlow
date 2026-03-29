import { Role } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'

export type Permission =
  | 'dashboard:view' | 'dashboard:financeiro'
  | 'agenda:view' | 'agenda:create' | 'agenda:edit' | 'agenda:cancel'
  | 'pacientes:view' | 'pacientes:create' | 'pacientes:edit'
  | 'financeiro:view' | 'financeiro:create' | 'financeiro:export'
  | 'exames:view' | 'exames:create'
  | 'whatsapp:view' | 'whatsapp:send'
  | 'patrimonio:view' | 'patrimonio:create'
  | 'usuarios:create' | 'clinicas:manage'

export const PERMISSIONS: Record<Role, Permission[] | ['*']> = {
  SUPER_ADMIN: ['*'],

  ADMIN: [
    'dashboard:view', 'dashboard:financeiro',
    'agenda:view', 'agenda:create', 'agenda:edit', 'agenda:cancel',
    'pacientes:view', 'pacientes:create', 'pacientes:edit',
    'financeiro:view', 'financeiro:create', 'financeiro:export',
    'exames:view', 'exames:create',
    'whatsapp:view', 'whatsapp:send',
    'patrimonio:view', 'patrimonio:create',
    'usuarios:create',
  ],

  MEDICO: [
    'dashboard:view',
    'agenda:view', 'agenda:create',
    'pacientes:view',
    'exames:view', 'exames:create',
    'whatsapp:view', 'whatsapp:send',
  ],

  FINANCEIRO: [
    'dashboard:view', 'dashboard:financeiro',
    'pacientes:view',
    'financeiro:view', 'financeiro:create', 'financeiro:export',
    'exames:view',
    'whatsapp:view', 'whatsapp:send',
    'patrimonio:view',
  ],

  ATENDENTE: [
    'dashboard:view',
    'agenda:view', 'agenda:create', 'agenda:edit', 'agenda:cancel',
    'pacientes:view', 'pacientes:create', 'pacientes:edit',
    'exames:view', 'exames:create',
    'whatsapp:view', 'whatsapp:send',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = PERMISSIONS[role]
  if (perms[0] === '*') return true
  return (perms as Permission[]).includes(permission)
}

export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: Role; clinicId?: string }

    if (!user) {
      return reply.status(401).send({ error: 'Não autenticado' })
    }

    // SUPER_ADMIN passa direto
    if (user.role === 'SUPER_ADMIN') return

    // Outros roles precisam ter clinicId
    if (!user.clinicId) {
      return reply.status(403).send({ error: 'Sem vínculo com clínica' })
    }

    if (!hasPermission(user.role, permission)) {
      return reply.status(403).send({
        error: 'Sem permissão',
        required: permission,
        role: user.role,
      })
    }
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: Role }
    if (!roles.includes(user.role)) {
      return reply.status(403).send({ error: 'Acesso negado para este perfil' })
    }
  }
}
