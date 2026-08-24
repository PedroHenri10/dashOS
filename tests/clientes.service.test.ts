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
