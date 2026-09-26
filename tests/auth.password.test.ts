import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcrypt'
import { authRepository } from '../src/modules/auth/auth.repository'
import { authService } from '../src/modules/auth/auth.service'
import { ConflitoError, NaoAutorizadoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('auth service changes password after validating the current password', async () => {
  const originalBuscar = authRepository.buscarPorIdComSenha
  const originalAtualizar = authRepository.atualizarSenha
  const senhaAtual = await bcrypt.hash('senha-atual', 10)
  let savedHash = ''

  authRepository.buscarPorIdComSenha = async () => ({ id: 1, ativo: true, senha: senhaAtual }) as any
  authRepository.atualizarSenha = async (_id, senha) => {
    savedHash = senha
    return {} as any
  }

  await authService.alterarSenha(1, { senhaAtual: 'senha-atual', novaSenha: 'senha-nova' })

  assert.notEqual(savedHash, 'senha-nova')
  assert.equal(await bcrypt.compare('senha-nova', savedHash), true)

  authRepository.buscarPorIdComSenha = originalBuscar
  authRepository.atualizarSenha = originalAtualizar
})

test('auth service rejects an incorrect current password', async () => {
  const originalBuscar = authRepository.buscarPorIdComSenha
  const senhaAtual = await bcrypt.hash('senha-atual', 10)
  authRepository.buscarPorIdComSenha = async () => ({ id: 1, ativo: true, senha: senhaAtual }) as any

  await assert.rejects(
    () => authService.alterarSenha(1, { senhaAtual: 'errada1', novaSenha: 'senha-nova' }),
    (error: unknown) => {
      assert.ok(error instanceof NaoAutorizadoError)
      assert.equal(error.errorCode, ERROR_CODES.CREDENCIAIS_INVALIDAS)
      return true
    },
  )

  authRepository.buscarPorIdComSenha = originalBuscar
})

test('auth password schema rejects reusing the current password', async () => {
  const { AlterarSenhaSchema } = await import('../src/modules/auth/auth.dto')
  assert.throws(() => AlterarSenhaSchema.parse({ senhaAtual: 'mesma1', novaSenha: 'mesma1' }), (error: unknown) => error instanceof Error)
})
