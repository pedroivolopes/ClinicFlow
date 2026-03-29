import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './modules/auth/auth.routes'
import { usersRoutes } from './modules/users/users.routes'
import { doctorsRoutes } from './modules/doctors/doctors.routes'

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
})

// ── Plugins ──
app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET!,
})

// ── Decorator de autenticação ──
app.decorate('authenticate', async (request: any, reply: any) => {
  try {
    await request.jwtVerify()
  } catch {
    reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
})

// ── Rotas ──
app.register(authRoutes,    { prefix: '/api' })
app.register(usersRoutes,   { prefix: '/api' })
app.register(doctorsRoutes, { prefix: '/api' })

// ── Health check ──
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  service: 'ClinicFlow API',
}))

// ── Start ──
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 ClinicFlow API rodando em http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

// ── Type declarations ──
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>
  }
}
