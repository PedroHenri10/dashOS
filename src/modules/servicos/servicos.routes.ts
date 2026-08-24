import { FastifyPluginAsync } from 'fastify'
import { Perfil } from '../../shared/enums/perfil.enum'
import { autenticar, exigirPerfil } from '../../shared/middlewares/auth.middleware'
import { servicosController } from './servicos.controller'

export const servicosRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: autenticar }, servicosController.listar)
  app.get<{ Params: { id: string } }>('/:id', { preHandler: autenticar }, servicosController.buscar)
  app.post('/', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, servicosController.criar)
  app.put<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, servicosController.atualizar)
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, servicosController.desativar)
  app.patch<{ Params: { id: string } }>('/:id/reativar', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, servicosController.reativar)
}
