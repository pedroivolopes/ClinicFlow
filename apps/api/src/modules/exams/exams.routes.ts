import { FastifyInstance } from 'fastify'
// TODO: Implementar rotas de exams — Semana 3+
export default async function examsRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ module: 'exams', status: 'em desenvolvimento' }))
}
