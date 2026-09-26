import { FastifyPluginAsync } from 'fastify'
import { authController } from './auth.controller'
import { autenticar } from '../../shared/middlewares/auth.middleware'

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, authController.login)
  app.post('/refresh', authController.refresh)
  app.get('/me', { preHandler: autenticar }, authController.me)
  app.patch('/password', { preHandler: autenticar }, authController.alterarSenha)
  app.post('/logout', { preHandler: autenticar }, authController.logout)
} 