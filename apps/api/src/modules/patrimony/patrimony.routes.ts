import { FastifyInstance } from 'fastify'
// TODO: Implementar rotas de patrimony — Semana 3+
export default async function patrimonyRoutes(app: FastifyInstance) {
  app.get('/', async () => ({ module: 'patrimony', status: 'em desenvolvimento' }))
}
