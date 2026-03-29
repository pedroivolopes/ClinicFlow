import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { DoctorsService } from './doctors.service'
import { requirePermission } from '../../lib/permissions'
import { Role } from '@prisma/client'

const createDoctorSchema = z.object({
  userId:    z.string().uuid(),
  crm:       z.string().min(3),
  specialty: z.string().min(2),
})

const updateDoctorSchema = z.object({
  crm:       z.string().min(3).optional(),
  specialty: z.string().min(2).optional(),
})

const scheduleItemSchema = z.object({
  dayOfWeek:   z.number().int().min(0).max(6),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.number().int().min(10).max(120).default(30),
})

const setSchedulesSchema = z.object({
  schedules: z.array(scheduleItemSchema),
})

export async function doctorsRoutes(app: FastifyInstance) {

  // GET /doctors — lista médicos da clínica
  app.get('/doctors', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const user = request.user as { clinicId?: string; role: Role }

    const clinicId = user.role === 'SUPER_ADMIN'
      ? (request.query as any).clinicId
      : user.clinicId

    if (!clinicId) return reply.status(400).send({ error: 'clinicId obrigatório' })

    const doctors = await DoctorsService.listByClinic(clinicId)
    return reply.send(doctors)
  })

  // GET /doctors/:id — busca médico por ID
  app.get('/doctors/:id', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { clinicId: string }

    const doctor = await DoctorsService.findById(id, user.clinicId)
    if (!doctor) return reply.status(404).send({ error: 'Médico não encontrado' })

    return reply.send(doctor)
  })

  // POST /doctors — cria perfil de médico para um usuário MEDICO
  app.post('/doctors', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const user = request.user as { clinicId: string }
    const body = createDoctorSchema.parse(request.body)

    const doctor = await DoctorsService.create({
      ...body,
      clinicId: user.clinicId,
    })

    return reply.status(201).send(doctor)
  })

  // PATCH /doctors/:id — atualiza CRM e especialidade
  app.patch('/doctors/:id', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { clinicId: string }
    const body = updateDoctorSchema.parse(request.body)

    const doctor = await DoctorsService.update(id, user.clinicId, body)
    return reply.send(doctor)
  })

  // GET /doctors/:id/schedules — lista horários do médico
  app.get('/doctors/:id/schedules', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { clinicId: string }

    const schedules = await DoctorsService.getSchedules(id, user.clinicId)
    return reply.send(schedules)
  })

  // PUT /doctors/:id/schedules — define/substitui todos os horários
  app.put('/doctors/:id/schedules', {
    preHandler: [app.authenticate, requirePermission('usuarios:create')],
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { clinicId: string }
    const { schedules } = setSchedulesSchema.parse(request.body)

    const result = await DoctorsService.setSchedules(id, user.clinicId, schedules)
    return reply.send(result)
  })
}
