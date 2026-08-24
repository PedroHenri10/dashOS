import { FastifyPluginAsync } from 'fastify'
import { Perfil } from '../../shared/enums/perfil.enum'
import { autenticar, exigirPerfil } from '../../shared/middlewares/auth.middleware'
import { fornecedoresController } from './fornecedores.controller'

export const fornecedoresRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: autenticar }, fornecedoresController.listar)
  app.get<{ Params: { id: string } }>('/:id', { preHandler: autenticar }, fornecedoresController.buscar)

  app.post('/', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, fornecedoresController.criar)
  app.put<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, fornecedoresController.atualizar)
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, fornecedoresController.desativar)
  app.patch<{ Params: { id: string } }>('/:id/reativar', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, fornecedoresController.reativar)
}
