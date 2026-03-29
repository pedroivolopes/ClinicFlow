import { prisma } from '../../lib/prisma'

export interface CreateDoctorInput {
  userId: string
  clinicId: string
  crm: string
  specialty: string
}

export interface DoctorScheduleInput {
  dayOfWeek: number   // 0=Dom, 1=Seg ... 6=Sab
  startTime: string   // "08:00"
  endTime: string     // "18:00"
  slotMinutes: number // 30
}

export const DoctorsService = {

  // Lista todos os médicos da clínica
  async listByClinic(clinicId: string) {
    return prisma.doctor.findMany({
      where: { clinicId },
      include: {
        user: {
          select: { id: true, name: true, email: true, active: true },
        },
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
      orderBy: { user: { name: 'asc' } },
    })
  },

  // Busca médico por ID (valida clínica)
  async findById(id: string, clinicId: string) {
    return prisma.doctor.findFirst({
      where: { id, clinicId },
      include: {
        user: {
          select: { id: true, name: true, email: true, active: true },
        },
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    })
  },

  // Cria perfil de médico vinculado a um usuário já existente
  async create(data: CreateDoctorInput) {
    // Verifica se o usuário existe e pertence à clínica
    const user = await prisma.user.findFirst({
      where: { id: data.userId, clinicId: data.clinicId, role: 'MEDICO' },
    })
    if (!user) throw new Error('Usuário não encontrado ou não é MEDICO nesta clínica')

    // Verifica se já tem perfil de médico
    const existing = await prisma.doctor.findUnique({ where: { userId: data.userId } })
    if (existing) throw new Error('Usuário já possui perfil de médico')

    return prisma.doctor.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        schedules: true,
      },
    })
  },

  // Atualiza CRM e especialidade
  async update(id: string, clinicId: string, data: { crm?: string; specialty?: string }) {
    const doctor = await prisma.doctor.findFirst({ where: { id, clinicId } })
    if (!doctor) throw new Error('Médico não encontrado')

    return prisma.doctor.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        schedules: true,
      },
    })
  },

  // ── Horários (DoctorSchedule) ──

  // Substitui todos os horários do médico de uma vez
  async setSchedules(doctorId: string, clinicId: string, schedules: DoctorScheduleInput[]) {
    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } })
    if (!doctor) throw new Error('Médico não encontrado')

    // Deleta os existentes e recria (upsert em bloco)
    await prisma.doctorSchedule.deleteMany({ where: { doctorId } })

    if (schedules.length === 0) return []

    await prisma.doctorSchedule.createMany({
      data: schedules.map((s) => ({ ...s, doctorId })),
    })

    return prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    })
  },

  // Lista horários de um médico
  async getSchedules(doctorId: string, clinicId: string) {
    const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } })
    if (!doctor) throw new Error('Médico não encontrado')

    return prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: 'asc' },
    })
  },
}
