import { FastifyInstance } from 'fastify'
// TODO: Implementar rotas de whatsapp — Semana 3+
export default async function whatsappRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ module: 'whatsapp', status: 'em desenvolvimento' }))
}
