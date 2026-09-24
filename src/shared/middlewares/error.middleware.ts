import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

function buildErrorPayload(status: number, code: number, message: string, path: string) {
  return {
    status,
    code,
    message,
    timestamp: new Date().toISOString(),
    path,
  }
}

export function errorHandler(
  err: unknown,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const path = request.url || request.raw.url || ''

  if (err instanceof AppError) {
    return reply.status(err.statusCode).send(buildErrorPayload(err.statusCode, err.code, err.mensagem, path))
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return reply.status(ERROR_CODES.REGISTRO_NAO_ENCONTRADO.status)
        .send(buildErrorPayload(
          ERROR_CODES.REGISTRO_NAO_ENCONTRADO.status,
          ERROR_CODES.REGISTRO_NAO_ENCONTRADO.code,
          ERROR_CODES.REGISTRO_NAO_ENCONTRADO.message,
          path
        ))
    }

    if (err.code === 'P2002') {
      return reply.status(ERROR_CODES.REGISTRO_JA_EXISTE.status)
        .send(buildErrorPayload(
          ERROR_CODES.REGISTRO_JA_EXISTE.status,
          ERROR_CODES.REGISTRO_JA_EXISTE.code,
          ERROR_CODES.REGISTRO_JA_EXISTE.message,
          path
        ))
    }

    if (err.code === 'P2003') {
      return reply.status(ERROR_CODES.RELACIONAMENTO_INVALIDO.status)
        .send(buildErrorPayload(
          ERROR_CODES.RELACIONAMENTO_INVALIDO.status,
          ERROR_CODES.RELACIONAMENTO_INVALIDO.code,
          ERROR_CODES.RELACIONAMENTO_INVALIDO.message,
          path
        ))
    }
  }

  if (err instanceof ZodError || (typeof err === 'object' && err !== null && 'name' in err && err.name === 'ZodError')) {
    const zodError = err instanceof ZodError ? err : (err as ZodError)
    return reply.status(ERROR_CODES.DADOS_INVALIDOS.status)
      .send({
        ...buildErrorPayload(
          ERROR_CODES.DADOS_INVALIDOS.status,
          ERROR_CODES.DADOS_INVALIDOS.code,
          ERROR_CODES.DADOS_INVALIDOS.message,
          path
        ),
        details: zodError.issues,
      })
  }

  const fastifyError = err as FastifyError | undefined
  console.error('ERRO NÃO TRATADO:', fastifyError ?? err)
  return reply.status(ERROR_CODES.ERRO_INTERNO.status)
    .send(buildErrorPayload(
      ERROR_CODES.ERRO_INTERNO.status,
      ERROR_CODES.ERRO_INTERNO.code,
      ERROR_CODES.ERRO_INTERNO.message,
      path
    ))
}