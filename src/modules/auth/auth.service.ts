import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createHash } from 'node:crypto'
import { authRepository } from './auth.repository'
import { ERROR_CODES } from '../../erros/errorCodes'
import { NaoAutorizadoError, TokenInvalidoError } from '../../shared/errors/AppError'
import { AlterarSenhaDto, LoginDto } from './auth.dto'

function gerarToken(payload: object, expiracao: string) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expiracao } as any)
}

function isRefreshTokenPayload(value: unknown): value is { sub: number; exp?: number } {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Partial<{ sub: unknown }>
  return typeof candidate.sub === 'number'
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export const authService = {
  async login(dto: LoginDto) {
    const usuario = await authRepository.buscarPorEmail(dto.email)

    if (!usuario || !usuario.ativo) throw new NaoAutorizadoError(ERROR_CODES.CREDENCIAIS_INVALIDAS)

    const senhaCorreta = await bcrypt.compare(dto.senha, usuario.senha)
    if (!senhaCorreta) throw new NaoAutorizadoError(ERROR_CODES.CREDENCIAIS_INVALIDAS)

    const payload = {
      sub:    usuario.id,
      nome:   usuario.nome_completo,
      perfil: usuario.perfil.nome,
    }

    return {
      token:        gerarToken(payload, '8h'),
      refreshToken: gerarToken({ sub: usuario.id }, '7d'),
      usuario: {
        id:     usuario.id,
        nome:   usuario.nome_completo,
        email:  usuario.email,
        perfil: usuario.perfil.nome,
      },
    }
  },

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!)

      if (!isRefreshTokenPayload(decoded)) {
        throw new TokenInvalidoError()
      }

      if (await authRepository.buscarTokenRevogado(hashToken(refreshToken))) {
        throw new TokenInvalidoError()
      }

      const usuario = await authRepository.buscarPorId(decoded.sub)
      if (!usuario || !usuario.ativo) throw new TokenInvalidoError()

      const novoPayload = {
        sub:    usuario.id,
        nome:   usuario.nome_completo,
        perfil: usuario.perfil!.nome,
      }
      return { token: gerarToken(novoPayload, '8h') }
    } catch {
      throw new TokenInvalidoError()
    }
  },

  async me(userId: number) {
    const usuario = await authRepository.buscarPorId(userId)
    if (!usuario || !usuario.ativo) throw new NaoAutorizadoError(ERROR_CODES.NAO_AUTORIZADO)
    return usuario
  },

  async alterarSenha(userId: number, dto: AlterarSenhaDto) {
    const usuario = await authRepository.buscarPorIdComSenha(userId)
    if (!usuario || !usuario.ativo) {
      throw new NaoAutorizadoError(ERROR_CODES.NAO_AUTORIZADO)
    }

    const senhaCorreta = await bcrypt.compare(dto.senhaAtual, usuario.senha)
    if (!senhaCorreta) {
      throw new NaoAutorizadoError(ERROR_CODES.CREDENCIAIS_INVALIDAS)
    }

    const senhaHash = await bcrypt.hash(dto.novaSenha, 10)
    await authRepository.atualizarSenha(userId, senhaHash)
  },

  async logout(userId: number, refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!)
      if (!isRefreshTokenPayload(decoded) || decoded.sub !== userId || typeof decoded.exp !== 'number') {
        throw new TokenInvalidoError()
      }

      await authRepository.revogarToken(hashToken(refreshToken), new Date(decoded.exp * 1000))
    } catch {
      throw new TokenInvalidoError()
    }
  },
}