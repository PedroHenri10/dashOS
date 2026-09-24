import 'dotenv/config'
import assert from 'node:assert/strict'
import test from 'node:test'
import jwt from 'jsonwebtoken'
import { authRepository } from '../src/modules/auth/auth.repository'
import { authService } from '../src/modules/auth/auth.service'
import { NaoAutorizadoError, TokenInvalidoError } from '../src/shared/errors/AppError'

const usuario = {
  id: 1,
  nome_completo: 'Admin DashOS',
  email: 'admin@dashos.com',
  senha: '$2b$10$hash',
  ativo: true,
  perfil: { id: 1, nome: 'Administrador' },
}

function makeRefreshToken() {
  return jwt.sign({ sub: usuario.id }, process.env.JWT_SECRET ?? 'test-secret')
}

test('auth service rejects refresh and me for inactive users', async () => {
  const originalBuscarPorId = authRepository.buscarPorId
  authRepository.buscarPorId = async () => ({ ...usuario, ativo: false }) as any

  await assert.rejects(
    () => authService.refresh(makeRefreshToken()),
    (error: unknown) => error instanceof TokenInvalidoError,
  )
  await assert.rejects(
    () => authService.me(usuario.id),
    (error: unknown) => error instanceof NaoAutorizadoError,
  )

  authRepository.buscarPorId = originalBuscarPorId
})

test('auth service refreshes tokens only for active users', async () => {
  const originalBuscarPorId = authRepository.buscarPorId
  authRepository.buscarPorId = async () => usuario as any

  const result = await authService.refresh(makeRefreshToken())
  assert.equal(typeof result.token, 'string')

  authRepository.buscarPorId = originalBuscarPorId
})
