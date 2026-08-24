import { FastifyPluginAsync } from 'fastify'
import { autenticar, exigirPerfil } from '../../shared/middlewares/auth.middleware'
import { usuariosController } from './usuarios.controller'

import { Perfil } from '../../shared/enums/perfil.enum'

export const usuariosRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, usuariosController.listar)
  app.get('/perfis', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, usuariosController.perfis)
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, usuariosController.buscar)
  app.post('/', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, usuariosController.criar)
  app.put<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, usuariosController.atualizar)
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [autenticar, exigirPerfil(Perfil.ADMINISTRADOR)] }, usuariosController.desativar)
}