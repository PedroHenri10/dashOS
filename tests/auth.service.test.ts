import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authRepository } from '../src/modules/auth/auth.repository'
import { authService } from '../src/modules/auth/auth.service'
import { NaoAutorizadoError, TokenInvalidoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('auth service validates login, refresh and me flows for valid and invalid branches', async () => {
  const originalBuscarPorEmail = authRepository.buscarPorEmail
  const originalBuscarPorId = authRepository.buscarPorId
  const originalSecret = process.env.JWT_SECRET
  process.env.JWT_SECRET = 'test-secret'

  const senhaHash = await bcrypt.hash('123456', 10)

  authRepository.buscarPorEmail = async () => ({
    id: 10,
    nome_completo: 'Ana',
    email: 'ana@email.com',
    senha: senhaHash,
    ativo: true,
    perfil: { nome: 'Administrador' },
  } as any)

  authRepository.buscarPorId = async () => ({
    id: 10,
    nome_completo: 'Ana',
    email: 'ana@email.com',
    ativo: true,
    perfil: { nome: 'Administrador' },
  } as any)

  const login = await authService.login({ email: 'ana@email.com', senha: '123456' })
  assert.equal(login.usuario.id, 10)
  assert.equal(login.usuario.perfil, 'Administrador')
  assert.ok(login.token.length > 20)
  assert.ok(login.refreshToken.length > 20)

  const refreshToken = jwt.sign({ sub: 10 }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  const refreshed = await authService.refresh(refreshToken)
  assert.ok(refreshed.token.length > 20)

  const me = await authService.me(10)
  assert.equal(me.id, 10)

  authRepository.buscarPorEmail = async () => null
  await assert.rejects(
    () => authService.login({ email: 'sem@usuario.com', senha: '123456' }),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.CREDENCIAIS_INVALIDAS)
      return true
    },
  )

  authRepository.buscarPorEmail = async () => ({
    id: 10,
    nome_completo: 'Ana',
    email: 'ana@email.com',
    senha: senhaHash,
    ativo: false,
    perfil: { nome: 'Administrador' },
  } as any)
  await assert.rejects(
    () => authService.login({ email: 'ana@email.com', senha: '123456' }),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.CREDENCIAIS_INVALIDAS)
      return true
    },
  )

  authRepository.buscarPorId = async () => null
  await assert.rejects(
    () => authService.refresh(jwt.sign({ sub: 99 }, process.env.JWT_SECRET!, { expiresIn: '7d' })),
    (error: unknown) => {
      assert.ok(error instanceof TokenInvalidoError)
      assert.equal(error.errorCode, ERROR_CODES.TOKEN_INVALIDO)
      return true
    },
  )

  authRepository.buscarPorEmail = originalBuscarPorEmail
  authRepository.buscarPorId = originalBuscarPorId
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET
  } else {
    process.env.JWT_SECRET = originalSecret
  }
})