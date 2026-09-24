import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ERROR_CODES } from '../src/erros/errorCodes'
import { authRepository } from '../src/modules/auth/auth.repository'
import { authService } from '../src/modules/auth/auth.service'
import { Perfil } from '../src/shared/enums/perfil.enum'
import { NaoAutorizadoError, ProibidoError, TokenInvalidoError } from '../src/shared/errors/AppError'
import { autenticar, exigirPerfil } from '../src/shared/middlewares/auth.middleware'

const originalSecret = process.env.JWT_SECRET

function setSecret() {
  process.env.JWT_SECRET = 'test-secret'
}

test('authService.login should succeed with valid credentials', async () => {
  setSecret()
  const originalBuscarPorEmail = authRepository.buscarPorEmail
  const senhaHash = await bcrypt.hash('senha-correta', 10)

  authRepository.buscarPorEmail = async () => ({
    id: 12,
    nome_completo: 'Maria Souza',
    email: 'maria@email.com',
    senha: senhaHash,
    ativo: true,
    perfil: { id: 1, nome: Perfil.ADMINISTRADOR },
  } as any)

  const result = await authService.login({ email: 'maria@email.com', senha: 'senha-correta' })

  assert.equal(result.usuario.id, 12)
  assert.equal(result.usuario.perfil, Perfil.ADMINISTRADOR)
  assert.ok(result.token.length > 20)
  assert.ok(result.refreshToken.length > 20)

  authRepository.buscarPorEmail = originalBuscarPorEmail
})

test('authService.login should reject invalid credentials with specific error code', async () => {
  setSecret()
  const originalBuscarPorEmail = authRepository.buscarPorEmail
  const senhaHash = await bcrypt.hash('senha-correta', 10)

  authRepository.buscarPorEmail = async () => ({
    id: 1,
    nome_completo: 'João da Silva',
    email: 'joao@email.com',
    senha: senhaHash,
    telefone: null,
    ativo: true,
    perfil: { id: 1, nome: Perfil.ADMINISTRADOR },
  } as any)

  await assert.rejects(
    () => authService.login({ email: 'joao@email.com', senha: 'senha-errada' }),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.CREDENCIAIS_INVALIDAS)
      return true
    }
  )

  authRepository.buscarPorEmail = originalBuscarPorEmail
})

test('authService.refresh should return a fresh token for valid refresh tokens', async () => {
  setSecret()
  const originalBuscarPorId = authRepository.buscarPorId
  const refreshToken = jwt.sign({ sub: 9 }, process.env.JWT_SECRET!, { expiresIn: '7d' })

  authRepository.buscarPorId = async () => ({
    id: 9,
    nome_completo: 'Carlos',
    email: 'carlos@email.com',
    ativo: true,
    perfil: { id: 1, nome: Perfil.TECNICO },
  } as any)

  const result = await authService.refresh(refreshToken)

  assert.ok(result.token.length > 20)

  authRepository.buscarPorId = originalBuscarPorId
})

test('authService.refresh should reject malformed refresh payloads', async () => {
  setSecret()
  const invalidRefreshToken = jwt.sign({ nome: 'Sem sub' }, process.env.JWT_SECRET!, { expiresIn: '7d' })

  await assert.rejects(
    () => authService.refresh(invalidRefreshToken),
    (error: unknown) => {
      assert.ok(error instanceof TokenInvalidoError)
      assert.equal(error.errorCode, ERROR_CODES.TOKEN_INVALIDO)
      return true
    }
  )
})

test('authService.me should reject when user no longer exists', async () => {
  setSecret()
  const originalBuscarPorId = authRepository.buscarPorId

  authRepository.buscarPorId = async () => null

  await assert.rejects(
    () => authService.me(99),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.NAO_AUTORIZADO)
      return true
    }
  )

  authRepository.buscarPorId = originalBuscarPorId
})

test('autenticar should accept valid bearer token and populate request.user', async () => {
  setSecret()
  const request = { headers: { authorization: `Bearer ${jwt.sign({ sub: 3, nome: 'Ana', perfil: Perfil.ADMINISTRADOR }, process.env.JWT_SECRET!, { expiresIn: '8h' })}` } } as any

  await autenticar(request, {} as any)

  assert.equal(request.user?.sub, 3)
  assert.equal(request.user?.perfil, Perfil.ADMINISTRADOR)
})

test('autenticar should reject requests without bearer token', async () => {
  const request = { headers: {} } as any

  await assert.rejects(
    () => autenticar(request, {} as any),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.NAO_AUTORIZADO)
      return true
    }
  )
})

test('autenticar should reject malformed or expired bearer tokens', async () => {
  setSecret()
  const request = { headers: { authorization: 'Bearer token-invalido' } } as any

  await assert.rejects(
    () => autenticar(request, {} as any),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.TOKEN_INVALIDO)
      return true
    }
  )
})

test('exigirPerfil should allow the authorized role', async () => {
  const request = {
    user: {
      sub: 1,
      nome: 'Maria',
      perfil: Perfil.ADMINISTRADOR,
    },
  } as any

  await assert.doesNotReject(() => exigirPerfil(Perfil.ADMINISTRADOR)(request, {} as any))
})

test('exigirPerfil should deny user when role is not allowed', async () => {
  const request = {
    user: {
      sub: 1,
      nome: 'Maria',
      perfil: Perfil.TECNICO,
    },
  } as any

  await assert.rejects(
    () => exigirPerfil(Perfil.ADMINISTRADOR)(request, {} as any),
    (error: unknown) => {
      assert.ok(error instanceof ProibidoError)
      assert.equal(error.errorCode, ERROR_CODES.SEM_PERMISSAO)
      return true
    }
  )
})

test.after(() => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET
    return
  }

  process.env.JWT_SECRET = originalSecret
})
