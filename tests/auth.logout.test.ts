import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'
import { authRepository } from '../src/modules/auth/auth.repository'
import { authService } from '../src/modules/auth/auth.service'
import { TokenInvalidoError } from '../src/shared/errors/AppError'

process.env.JWT_SECRET = 'test-secret'

test('auth service revokes refresh tokens during logout', async () => {
  const originalBuscarRevogado = authRepository.buscarTokenRevogado
  const originalRevogar = authRepository.revogarToken
  let revokedHash = ''
  let expiration: Date | undefined
  const token = jwt.sign({ sub: 7 }, process.env.JWT_SECRET!, { expiresIn: '7d' })

  authRepository.buscarTokenRevogado = async () => null
  authRepository.revogarToken = async (hash, expiraEm) => {
    revokedHash = hash
    expiration = expiraEm
    return {} as any
  }

  await authService.logout(7, token)

  assert.equal(revokedHash.length, 64)
  assert.ok(expiration instanceof Date)

  authRepository.buscarTokenRevogado = originalBuscarRevogado
  authRepository.revogarToken = originalRevogar
})

test('auth service rejects a revoked refresh token', async () => {
  const originalBuscarRevogado = authRepository.buscarTokenRevogado
  const token = jwt.sign({ sub: 7 }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  authRepository.buscarTokenRevogado = async () => ({ id: 1 }) as any

  await assert.rejects(
    () => authService.refresh(token),
    (error: unknown) => error instanceof TokenInvalidoError,
  )

  authRepository.buscarTokenRevogado = originalBuscarRevogado
})
