import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../../lib/prisma'
import { requireSuperAdmin } from '../../lib/permissions'

export default async function clinicsRoutes(app: FastifyInstance) {

  // GET /clinics — Lista todas as clínicas (Super Admin)
  app.get('/', { preHandler: requireSuperAdmin() }, async (request, reply) => {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { users: true, patients: true } } },
    })
    return reply.send(clinics)
  })

  // POST /clinics — Cria nova clínica com Admin inicial
  app.post('/', { preHandler: requireSuperAdmin() }, async (request, reply) => {
    const schema = z.object({
      name:     z.string().min(3),
      cnpj:     z.string().min(14),
      slug:     z.string().min(3).regex(/^[a-z0-9-]+$/),
      phone:    z.string().optional(),
      email:    z.string().email().optional(),
      address:  z.string().optional(),
      // Admin inicial da clínica
      adminName:     z.string().min(3),
      adminEmail:    z.string().email(),
      adminPassword: z.string().min(8),
    })

    const data = schema.parse(request.body)

    // Verifica duplicidade
    const existing = await prisma.clinic.findFirst({
      where: { OR: [{ cnpj: data.cnpj }, { slug: data.slug }] },
    })
    if (existing) {
      return reply.status(409).send({ error: 'CNPJ ou slug já cadastrado' })
    }

    const hashedPassword = await bcrypt.hash(data.adminPassword, 12)

    // Cria clínica + admin em transação
    const clinic = await prisma.$transaction(async (tx) => {
      const newClinic = await tx.clinic.create({
        data: {
          name: data.name, cnpj: data.cnpj, slug: data.slug,
          phone: data.phone, email: data.email, address: data.address,
        },
      })

      await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          clinicId: newClinic.id,
        },
      })

      return newClinic
    })

    return reply.status(201).send(clinic)
  })

  // GET /clinics/:id
  app.get('/:id', { preHandler: requireSuperAdmin() }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, active: true } },
        _count: { select: { patients: true, appointments: true } },
      },
    })
    if (!clinic) return reply.status(404).send({ error: 'Clínica não encontrada' })
    return reply.send(clinic)
  })

  // PATCH /clinics/:id/toggle — Ativa/Desativa clínica
  app.patch('/:id/toggle', { preHandler: requireSuperAdmin() }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const clinic = await prisma.clinic.findUnique({ where: { id } })
    if (!clinic) return reply.status(404).send({ error: 'Clínica não encontrada' })

    const updated = await prisma.clinic.update({
      where: { id },
      data: { active: !clinic.active },
    })
    return reply.send(updated)
  })
}
