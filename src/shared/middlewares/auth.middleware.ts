import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { NaoAutorizadoError, ProibidoError } from '../errors/AppError'

export interface JwtPayload {
  sub: number
  nome: string
  perfil: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload
  }
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) return false

  const candidate = value as Partial<JwtPayload>
  return (
    typeof candidate.sub === 'number' &&
    typeof candidate.nome === 'string' &&
    typeof candidate.perfil === 'string'
  )
}

export async function autenticar(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) throw new NaoAutorizadoError()

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)

    if (!isJwtPayload(decoded)) {
      throw new NaoAutorizadoError()
    }

    request.user = decoded
  } catch {
    throw new NaoAutorizadoError()
  }
}

export function exigirPerfil(...perfis: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user || !perfis.includes(request.user.perfil)) {
      throw new ProibidoError()
    }
  }
}