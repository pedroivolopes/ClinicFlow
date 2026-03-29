import { prisma } from '../../lib/prisma'
import { Role } from '@prisma/client'

export const UsersService = {

  // Lista todos os usuários da clínica
  async listByClinic(clinicId: string) {
    return prisma.user.findMany({
      where: { clinicId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        doctor: {
          select: { crm: true, specialty: true },
        },
      },
      orderBy: { name: 'asc' },
    })
  },

  // Busca um usuário por ID (valida que pertence à clínica)
  async findById(id: string, clinicId?: string) {
    return prisma.user.findFirst({
      where: {
        id,
        ...(clinicId ? { clinicId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        clinicId: true,
        createdAt: true,
        doctor: {
          select: { id: true, crm: true, specialty: true },
        },
      },
    })
  },

  // Ativa ou desativa um usuário
  async setActive(id: string, active: boolean, clinicId: string) {
    // Garante que o usuário pertence à clínica
    const user = await prisma.user.findFirst({ where: { id, clinicId } })
    if (!user) throw new Error('Usuário não encontrado')
    if (user.role === 'SUPER_ADMIN') throw new Error('Não é possível alterar o Super Admin')

    return prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, name: true, email: true, role: true, active: true },
    })
  },

  // Atualiza nome e/ou role de um usuário
  async update(id: string, clinicId: string, data: { name?: string; role?: Role }) {
    const user = await prisma.user.findFirst({ where: { id, clinicId } })
    if (!user) throw new Error('Usuário não encontrado')
    if (user.role === 'SUPER_ADMIN') throw new Error('Não é possível alterar o Super Admin')

    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true },
    })
  },
}
