import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcrypt'
import { ERROR_CODES } from '../../erros/errorCodes'
import { authRepository } from '../../modules/auth/auth.repository'
import { authService } from '../../modules/auth/auth.service'
import { Perfil } from '../enums/perfil.enum'
import { NaoAutorizadoError, ProibidoError } from '../errors/AppError'
import { autenticar, exigirPerfil } from './auth.middleware'

test('authService.login should reject invalid credentials with specific error code', async () => {
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
