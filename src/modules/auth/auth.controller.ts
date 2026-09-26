import { FastifyReply, FastifyRequest } from 'fastify'
import { authService } from './auth.service'
import { AlterarSenhaSchema, LoginSchema, LogoutSchema, RefreshSchema } from './auth.dto'
import { ok, semConteudo } from '../../shared/types/response.types'

type LoginRequest = FastifyRequest<{ Body: { email: string; senha: string } }>
type RefreshRequest = FastifyRequest<{ Body: { refreshToken: string } }>
type MeRequest = FastifyRequest

export const authController = {
  async login(request: LoginRequest, reply: FastifyReply) {
    const dto = LoginSchema.parse(request.body)
    const resultado = await authService.login(dto)
    return ok(reply, resultado, 'Login realizado com sucesso')
  },

  async refresh(request: RefreshRequest, reply: FastifyReply) {
    const { refreshToken } = RefreshSchema.parse(request.body)
    const resultado = await authService.refresh(refreshToken)
    return ok(reply, resultado)
  },

  async me(request: MeRequest, reply: FastifyReply) {
    const resultado = await authService.me(request.user!.sub)
    return ok(reply, resultado)
  },

  async alterarSenha(request: MeRequest, reply: FastifyReply) {
    const dto = AlterarSenhaSchema.parse(request.body)
    await authService.alterarSenha(request.user!.sub, dto)
    return semConteudo(reply)
  },

  async logout(request: MeRequest, reply: FastifyReply) {
    const { refreshToken } = LogoutSchema.parse(request.body)
    await authService.logout(request.user!.sub, refreshToken)
    return semConteudo(reply)
  },
}