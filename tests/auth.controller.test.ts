import assert from 'node:assert/strict'
import test from 'node:test'
import { authController } from '../src/modules/auth/auth.controller'
import { authService } from '../src/modules/auth/auth.service'

function makeReply() {
  let statusCode = 200
  let body: unknown

  return {
    status(code: number) {
      statusCode = code
      return {
        send(payload: unknown) {
          body = payload
          return payload
        },
      }
    },
    getBody: () => body,
    getStatus: () => statusCode,
  }
}

test('auth controller returns login, refresh and me payloads', async () => {
  const originalLogin = authService.login
  const originalRefresh = authService.refresh
  const originalMe = authService.me

  authService.login = async () => ({
    token: 'token-1',
    refreshToken: 'refresh-1',
    usuario: { id: 1, nome: 'Ana', email: 'ana@email.com', perfil: 'ADMINISTRADOR' },
  }) as any

  authService.refresh = async () => ({ token: 'token-2' }) as any
  authService.me = async () => ({ id: 1, nome_completo: 'Ana', email: 'ana@email.com' }) as any

  const loginReply = makeReply()
  const loginResult = await authController.login(
    { body: { email: 'ana@email.com', senha: '123456' } } as any,
    loginReply as any,
  )
  assert.equal((loginResult as any).sucesso, true)
  assert.equal(loginReply.getStatus(), 200)

  const refreshReply = makeReply()
  const refreshResult = await authController.refresh(
    { body: { refreshToken: 'token-refresh' } } as any,
    refreshReply as any,
  )
  assert.equal((refreshResult as any).sucesso, true)
  assert.equal(refreshReply.getStatus(), 200)

  const meReply = makeReply()
  const meResult = await authController.me({ user: { sub: 1 } } as any, meReply as any)
  assert.equal((meResult as any).sucesso, true)
  assert.equal(meReply.getStatus(), 200)

  authService.login = originalLogin
  authService.refresh = originalRefresh
  authService.me = originalMe
})
