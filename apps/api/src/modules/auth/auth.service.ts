import bcrypt from 'bcryptjs'
import { prisma } from '../../lib/prisma'
import { Role } from '@prisma/client'

export interface RegisterClinicInput {
  clinicName: string
  clinicCnpj: string
  clinicSlug: string
  clinicPhone?: string
  clinicEmail?: string
  adminName: string
  adminEmail: string
  adminPassword: string
}

export interface LoginInput {
  email: string
  password: string
}

export const AuthService = {

  // Cria clínica + admin em uma transação
  async registerClinic(data: RegisterClinicInput) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    })
    if (emailExists) throw new Error('E-mail já cadastrado')

    const slugExists = await prisma.clinic.findUnique({
      where: { slug: data.clinicSlug },
    })
    if (slugExists) throw new Error('Slug já em uso')

    const cnpjExists = await prisma.clinic.findUnique({
      where: { cnpj: data.clinicCnpj },
    })
    if (cnpjExists) throw new Error('CNPJ já cadastrado')

    const hashedPassword = await bcrypt.hash(data.adminPassword, 12)

    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          name: data.clinicName,
          cnpj: data.clinicCnpj,
          slug: data.clinicSlug,
          phone: data.clinicPhone,
          email: data.clinicEmail,
        },
      })

      const admin = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
          clinicId: clinic.id,
        },
        select: {
          id: true, name: true, email: true, role: true, createdAt: true,
        },
      })

      return { clinic, admin }
    })

    return result
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { clinic: { select: { id: true, name: true, slug: true } } },
    })

    if (!user || !user.active) {
      throw new Error('Credenciais inválidas')
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password)
    if (!passwordMatch) throw new Error('Credenciais inválidas')

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clinic: user.clinic,
    }
  },

  async createUser(data: {
    name: string
    email: string
    password: string
    role: Role
    clinicId: string
  }) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) throw new Error('E-mail já cadastrado')

    const hashed = await bcrypt.hash(data.password, 12)

    return prisma.user.create({
      data: { ...data, password: hashed },
      select: { id: true, name: true, email: true, role: true, clinicId: true, createdAt: true },
    })
  },

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, expiresAt },
    })
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })
  },

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } })
  },
}
