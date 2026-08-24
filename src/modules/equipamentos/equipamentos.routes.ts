import { FastifyPluginAsync } from 'fastify'
import { Perfil } from '../../shared/enums/perfil.enum'
import { autenticar, exigirPerfil } from '../../shared/middlewares/auth.middleware'
import { equipamentosController } from './equipamentos.controller'

export const equipamentosRoutes: FastifyPluginAsync = async (app) => {
  app.get('/tipos', { preHandler: autenticar }, equipamentosController.tipos)
  app.post('/tipos', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, equipamentosController.criarTipo)

  app.get('/', { preHandler: autenticar }, equipamentosController.listar)
  app.get<{ Params: { id: string } }>('/:id', { preHandler: autenticar }, equipamentosController.buscar)
  app.post('/', { preHandler: autenticar }, equipamentosController.criar)
  app.put<{ Params: { id: string } }>('/:id', { preHandler: autenticar }, equipamentosController.atualizar)
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: autenticar }, equipamentosController.desativar)
  app.patch<{ Params: { id: string } }>('/:id/reativar', { preHandler: autenticar }, equipamentosController.reativar)
}
