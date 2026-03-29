import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do ClinicFlow...')

  // Super Admin (RothaDigital)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@rothadigital.online' },
    update: {},
    create: {
      name: 'Super Admin RothaDigital',
      email: 'admin@rothadigital.online',
      password: await bcrypt.hash('RothaDigital@2026', 12),
      role: Role.SUPER_ADMIN,
      clinicId: null,
    },
  })

  // Clínica de exemplo
  const clinic = await prisma.clinic.upsert({
    where: { slug: 'clinica-sao-lucas' },
    update: {},
    create: {
      name: 'Clínica São Lucas',
      cnpj: '12345678000190',
      slug: 'clinica-sao-lucas',
      phone: '(11) 3333-4444',
      email: 'contato@saulucas.com.br',
    },
  })

  // Admin da clínica
  await prisma.user.upsert({
    where: { email: 'admin@saulucas.com.br' },
    update: {},
    create: {
      name: 'Administrador São Lucas',
      email: 'admin@saulucas.com.br',
      password: await bcrypt.hash('Admin@2026', 12),
      role: Role.ADMIN,
      clinicId: clinic.id,
    },
  })

  // Médico
  const medicoUser = await prisma.user.upsert({
    where: { email: 'dr.carlos@saulucas.com.br' },
    update: {},
    create: {
      name: 'Dr. Carlos Silva',
      email: 'dr.carlos@saulucas.com.br',
      password: await bcrypt.hash('Medico@2026', 12),
      role: Role.MEDICO,
      clinicId: clinic.id,
    },
  })

  await prisma.doctor.upsert({
    where: { userId: medicoUser.id },
    update: {},
    create: {
      userId: medicoUser.id,
      clinicId: clinic.id,
      crm: 'CRM/SP 123456',
      specialty: 'Clínica Geral',
    },
  })

  // Atendente
  await prisma.user.upsert({
    where: { email: 'recepcao@saulucas.com.br' },
    update: {},
    create: {
      name: 'Ana Recepção',
      email: 'recepcao@saulucas.com.br',
      password: await bcrypt.hash('Recepcao@2026', 12),
      role: Role.ATENDENTE,
      clinicId: clinic.id,
    },
  })

  // Financeiro
  await prisma.user.upsert({
    where: { email: 'financeiro@saulucas.com.br' },
    update: {},
    create: {
      name: 'Maria Financeiro',
      email: 'financeiro@saulucas.com.br',
      password: await bcrypt.hash('Financeiro@2026', 12),
      role: Role.FINANCEIRO,
      clinicId: clinic.id,
    },
  })

  console.log('✅ Seed concluído!')
  console.log('─────────────────────────────────')
  console.log('👤 Super Admin: admin@rothadigital.online / RothaDigital@2026')
  console.log('👤 Admin:       admin@saulucas.com.br / Admin@2026')
  console.log('👤 Médico:      dr.carlos@saulucas.com.br / Medico@2026')
  console.log('👤 Atendente:   recepcao@saulucas.com.br / Recepcao@2026')
  console.log('👤 Financeiro:  financeiro@saulucas.com.br / Financeiro@2026')
  console.log('─────────────────────────────────')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
