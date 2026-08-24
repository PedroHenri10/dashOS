import assert from 'node:assert/strict'
import test from 'node:test'
import { fornecedoresRepository } from '../src/modules/fornecedores/fornecedores.repository'
import { fornecedoresService } from '../src/modules/fornecedores/fornecedores.service'
import { ConflitoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('fornecedores service validates cnpj duplication and successful creation', async () => {
  const originalBuscarPorCnpj = fornecedoresRepository.buscarPorCnpj
  const originalCriar = fornecedoresRepository.criar

  fornecedoresRepository.buscarPorCnpj = async () => ({ id: 4, cnpj: '99' }) as any
  await assert.rejects(
    () => fornecedoresService.criar({ nome_fantasia: 'Forn', cnpj: '99' } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.FORNECEDOR_CNPJ_DUPLICADO)
      return true
    },
  )

  fornecedoresRepository.buscarPorCnpj = async () => null
  fornecedoresRepository.criar = async (payload: any) => ({ id: 7, ...payload }) as any

  const created = await fornecedoresService.criar({ nome_fantasia: 'Forn 2', cnpj: '100' } as any)
  assert.equal(created.id, 7)

  fornecedoresRepository.buscarPorCnpj = originalBuscarPorCnpj
  fornecedoresRepository.criar = originalCriar
})
