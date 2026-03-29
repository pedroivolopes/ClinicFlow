import { FastifyInstance } from 'fastify'
// TODO: Implementar rotas de appointments — Semana 3+
export default async function appointmentsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ module: 'appointments', status: 'em desenvolvimento' }))
}
