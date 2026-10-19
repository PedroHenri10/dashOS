import { FastifyPluginAsync } from 'fastify'
import { autenticar } from '../../shared/middlewares/auth.middleware'
import { ordensServicoController } from './ordens-servico.controller'

export const ordensServicoRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: autenticar }, ordensServicoController.listar)
  app.get<{ Params: { id: string } }>('/:id', { preHandler: autenticar }, ordensServicoController.buscar)
  app.post<{ Body: unknown }>('/orcamento', { preHandler: autenticar }, ordensServicoController.criarOrcamento)
  app.post<{ Body: unknown }>('/servico', { preHandler: autenticar }, ordensServicoController.criarServico)
}
