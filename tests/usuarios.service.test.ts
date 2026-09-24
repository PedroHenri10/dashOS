import assert from 'node:assert/strict'
import test from 'node:test'
import { usuariosRepository } from '../src/modules/usuarios/usuarios.repository'
import { usuariosService } from '../src/modules/usuarios/usuarios.service'
import { ConflitoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('usuarios service validates duplicate email and successful creation', async () => {
  const originalBuscarPorEmail = usuariosRepository.buscarPorEmail
  const originalBuscarPerfilPorId = usuariosRepository.buscarPerfilPorId
  const originalBuscarOuCriarPerfil = usuariosRepository.buscarOuCriarPerfil
  const originalCriar = usuariosRepository.criar

  usuariosRepository.buscarPorEmail = async () => null
  usuariosRepository.buscarPerfilPorId = async () => ({ id: 1, nome: 'Administrador' }) as any
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
  usuariosRepository.buscarPerfilPorId = originalBuscarPerfilPorId
  usuariosRepository.buscarOuCriarPerfil = originalBuscarOuCriarPerfil
  usuariosRepository.criar = originalCriar
})

test('usuarios service defaults new users to the technician profile', async () => {
  const originalBuscarPorEmail = usuariosRepository.buscarPorEmail
  const originalBuscarPerfilPorId = usuariosRepository.buscarPerfilPorId
  const originalBuscarOuCriarPerfil = usuariosRepository.buscarOuCriarPerfil
  const originalCriar = usuariosRepository.criar
  let payload: any

  usuariosRepository.buscarPorEmail = async () => null
  usuariosRepository.buscarPerfilPorId = async () => null
  usuariosRepository.buscarOuCriarPerfil = async (nome) => {
    assert.equal(nome, 'Técnico')
    return { id: 2, nome } as any
  }
  usuariosRepository.criar = async (dados: any) => {
    payload = dados
    return { id: 11, ...dados } as any
  }

  await usuariosService.criar({
    nome_completo: 'Tecnico Novo',
    email: 'tecnico@teste.com',
    senha: '123456',
  })

  assert.equal(payload.perfil_id, 2)
  assert.notEqual(payload.senha, '123456')

  usuariosRepository.buscarPorEmail = originalBuscarPorEmail
  usuariosRepository.buscarPerfilPorId = originalBuscarPerfilPorId
  usuariosRepository.buscarOuCriarPerfil = originalBuscarOuCriarPerfil
  usuariosRepository.criar = originalCriar
})

test('usuarios service validates profile and duplicate email on update', async () => {
  const originalBuscarPorId = usuariosRepository.buscarPorId
  const originalBuscarPorEmail = usuariosRepository.buscarPorEmail
  const originalBuscarPerfilPorId = usuariosRepository.buscarPerfilPorId
  const originalAtualizar = usuariosRepository.atualizar

  usuariosRepository.buscarPorId = async () => ({ id: 1 }) as any
  usuariosRepository.buscarPerfilPorId = async () => null
  await assert.rejects(
    () => usuariosService.atualizar(1, { perfil_id: 999 }),
    (error: unknown) => {
      assert.equal(error?.constructor?.name, 'NaoEncontradoError')
      assert.equal((error as any).errorCode, ERROR_CODES.PERFIL_NAO_ENCONTRADO)
      return true
    },
  )

  usuariosRepository.buscarPerfilPorId = async () => ({ id: 2, nome: 'Técnico' }) as any
  usuariosRepository.buscarPorEmail = async () => ({ id: 2, email: 'existente@email.com' }) as any
  await assert.rejects(
    () => usuariosService.atualizar(1, { email: 'existente@email.com' }),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.EMAIL_JA_CADASTRADO)
      return true
    },
  )

  usuariosRepository.buscarPorId = originalBuscarPorId
  usuariosRepository.buscarPorEmail = originalBuscarPorEmail
  usuariosRepository.buscarPerfilPorId = originalBuscarPerfilPorId
  usuariosRepository.atualizar = originalAtualizar
})
