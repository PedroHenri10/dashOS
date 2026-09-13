import assert from 'node:assert/strict'
import test from 'node:test'
import { clientesRepository } from '../src/modules/clientes/clientes.repository'
import { clientesService } from '../src/modules/clientes/clientes.service'
import { ConflitoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('clientes service validates cpf/cnpj duplication and successful creation', async () => {
  const originalBuscarPorCpfCnpj = clientesRepository.buscarPorCpfCnpj
  const originalCriar = clientesRepository.criar

  clientesRepository.buscarPorCpfCnpj = async () => ({ id: 3, cpf_cnpj: '123' }) as any
  await assert.rejects(
    () => clientesService.criar({ nome: 'Cliente A', tipo: 'Pessoa Física', cpf_cnpj: '123' } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
      return true
    },
  )

  clientesRepository.buscarPorCpfCnpj = async () => null
  clientesRepository.criar = async (payload: any) => ({ id: 5, ...payload }) as any

  const created = await clientesService.criar({ nome: 'Cliente B', tipo: 'Pessoa Física', cpf_cnpj: '456' } as any)
  assert.equal(created.id, 5)

  clientesRepository.buscarPorCpfCnpj = originalBuscarPorCpfCnpj
  clientesRepository.criar = originalCriar
})

test('clientes service validates update, deactivate and reactivate flows through repository checks', async () => {
  const originalBuscarPorId = clientesRepository.buscarPorId
  const originalBuscarPorCpfCnpj = clientesRepository.buscarPorCpfCnpj
  const originalAtualizar = clientesRepository.atualizar
  const originalDesativar = clientesRepository.desativar
  const originalReativar = clientesRepository.reativar

  clientesRepository.buscarPorId = async () => ({ id: 7, nome: 'Cliente', ativo: true }) as any
  clientesRepository.buscarPorCpfCnpj = async () => ({ id: 99, cpf_cnpj: '444' }) as any
  clientesRepository.atualizar = async (id: number, payload: any) => ({ id, ...payload }) as any
  clientesRepository.desativar = async (id: number) => ({ id, ativo: false }) as any
  clientesRepository.reativar = async (id: number) => ({ id, ativo: true }) as any

  await assert.rejects(
    () => clientesService.atualizar(7, { cpf_cnpj: '444' } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
      return true
    },
  )

  clientesRepository.buscarPorCpfCnpj = async () => ({ id: 7, cpf_cnpj: '444' }) as any
  const updated = await clientesService.atualizar(7, { nome: 'Cliente Atualizado', cpf_cnpj: '444' } as any)
  assert.equal(updated.id, 7)

  const disabled = await clientesService.desativar(7)
  assert.equal(disabled.ativo, false)

  const reactivated = await clientesService.reativar(7)
  assert.equal(reactivated.ativo, true)

  clientesRepository.buscarPorId = originalBuscarPorId
  clientesRepository.buscarPorCpfCnpj = originalBuscarPorCpfCnpj
  clientesRepository.atualizar = originalAtualizar
  clientesRepository.desativar = originalDesativar
  clientesRepository.reativar = originalReativar
})
