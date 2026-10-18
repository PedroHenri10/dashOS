import assert from 'node:assert/strict'
import test from 'node:test'
import { clientesRepository } from '../src/modules/clientes/clientes.repository'
import { clientesService } from '../src/modules/clientes/clientes.service'
import { ConflitoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

process.env.DATA_ENCRYPTION_KEY = 'test-encryption-key'

// CPF válido para testes (dígitos verificadores corretos, não é sequência repetida)
const CPF_VALIDO = '529.982.247-25'

test('clientes service: rejeita criação com cpf/cnpj duplicado', async () => {
  const originalBuscarPorCpfCnpj = clientesRepository.buscarPorCpfCnpj
  const originalCriar = clientesRepository.criar

  // Mock: simula que já existe um cliente com esse CPF
  clientesRepository.buscarPorCpfCnpj = async () => ({ id: 3, cpf_cnpj: '52998224725' }) as any

  await assert.rejects(
    () =>
      clientesService.criar({
        nome: 'Cliente A',
        tipo: 'PF',
        cpf_cnpj: CPF_VALIDO,
        telefone_1: '11999999999',
      } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
      return true
    },
  )

  clientesRepository.buscarPorCpfCnpj = originalBuscarPorCpfCnpj
  clientesRepository.criar = originalCriar
})

test('clientes service: cria cliente com cpf/cnpj válido e sem duplicidade', async () => {
  const originalBuscarPorCpfCnpj = clientesRepository.buscarPorCpfCnpj
  const originalCriar = clientesRepository.criar

  // Mock: nenhum duplicado encontrado
  clientesRepository.buscarPorCpfCnpj = async () => null
  clientesRepository.criar = async (payload: any) => ({ id: 5, ...payload }) as any

  const created = await clientesService.criar({
    nome: 'Cliente B',
    tipo: 'PF',
    cpf_cnpj: CPF_VALIDO,
    telefone_1: '11888888888',
  } as any)
  assert.equal(created.id, 5)

  clientesRepository.buscarPorCpfCnpj = originalBuscarPorCpfCnpj
  clientesRepository.criar = originalCriar
})
