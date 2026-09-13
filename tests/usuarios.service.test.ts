import assert from 'node:assert/strict'
import test from 'node:test'
import { usuariosRepository } from '../src/modules/usuarios/usuarios.repository'
import { usuariosService } from '../src/modules/usuarios/usuarios.service'
import { ConflitoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('usuarios service validates duplicate email and successful creation', async () => {
  const originalBuscarPorEmail = usuariosRepository.buscarPorEmail
  const originalCriar = usuariosRepository.criar

  usuariosRepository.buscarPorEmail = async () => null
  usuariosRepository.criar = async (payload: any) => ({ id: 10, ...payload, perfil: { nome: 'ADMINISTRADOR' } }) as any

  const created = await usuariosService.criar({
    nome_completo: 'Usuario Novo',
    email: 'novo@teste.com',
    senha: '123456',
    perfil_id: 1,
  })
  assert.equal(created.id, 10)

  usuariosRepository.buscarPorEmail = async () => ({ id: 2, email: 'duplicado@teste.com' }) as any
  await assert.rejects(
    () => usuariosService.criar({
      nome_completo: 'Outro',
      email: 'duplicado@teste.com',
      senha: '123456',
      perfil_id: 1,
    }),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.EMAIL_JA_CADASTRADO)
      return true
    },
  )

  usuariosRepository.buscarPorEmail = originalBuscarPorEmail
  usuariosRepository.criar = originalCriar
})

test('usuarios service validates update, deactivate and profile listing flows', async () => {
  const originalBuscarPorId = usuariosRepository.buscarPorId
  const originalAtualizar = usuariosRepository.atualizar
  const originalDesativar = usuariosRepository.desativar
  const originalListarPerfis = usuariosRepository.listarPerfis

  usuariosRepository.buscarPorId = async () => ({ id: 5, nome_completo: 'Usuario Atual', ativo: true }) as any
  usuariosRepository.atualizar = async (id: number, payload: any) => ({ id, ...payload }) as any
  usuariosRepository.desativar = async (id: number) => ({ id, ativo: false }) as any
  usuariosRepository.listarPerfis = async () => [{ id: 1, nome: 'ADMINISTRADOR' }] as any

  const updated = await usuariosService.atualizar(5, { nome_completo: 'Usuario Atualizado' } as any)
  assert.equal(updated.id, 5)

  const disabled = await usuariosService.desativar(5)
  assert.equal(disabled.ativo, false)

  const perfis = await usuariosService.listarPerfis()
  assert.equal(perfis[0].nome, 'ADMINISTRADOR')

  usuariosRepository.buscarPorId = originalBuscarPorId
  usuariosRepository.atualizar = originalAtualizar
  usuariosRepository.desativar = originalDesativar
  usuariosRepository.listarPerfis = originalListarPerfis
})
