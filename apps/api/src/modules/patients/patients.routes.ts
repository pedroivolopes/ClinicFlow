import { FastifyInstance } from 'fastify'
// TODO: Implementar rotas de patients — Semana 3+
export default async function patientsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ module: 'patients', status: 'em desenvolvimento' }))
}
