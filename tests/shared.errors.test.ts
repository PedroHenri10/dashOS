import assert from 'node:assert/strict'
import test from 'node:test'
import { Prisma } from '@prisma/client'
import { AppError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'
import { errorHandler } from '../src/shared/middlewares/error.middleware'

function makeReply() {
  let statusCode = 200

  return {
    status(code: number) {
      statusCode = code
      return {
        send(payload: unknown) {
          return payload
        },
      }
    },
    getStatus: () => statusCode,
  }
}

test('error middleware handles AppError and Prisma errors', async () => {
  const appErrorReply = makeReply()
  errorHandler(new AppError(ERROR_CODES.SEM_PERMISSAO), { url: '/x' } as any, appErrorReply as any)
  assert.equal(appErrorReply.getStatus(), 403)

  const prismaError = new Prisma.PrismaClientKnownRequestError('missing', {
    code: 'P2025',
    clientVersion: '1.0.0',
  })

  const prismaReply = makeReply()
  errorHandler(prismaError, { url: '/x' } as any, prismaReply as any)
  assert.equal(prismaReply.getStatus(), 404)
})
