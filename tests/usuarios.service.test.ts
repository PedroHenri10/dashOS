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
