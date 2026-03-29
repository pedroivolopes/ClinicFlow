import { FastifyInstance } from 'fastify'
// TODO: Implementar rotas de financial — Semana 3+
export default async function financialRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ module: 'financial', status: 'em desenvolvimento' }))
}
