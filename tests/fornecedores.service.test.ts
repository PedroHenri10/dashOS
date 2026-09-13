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

test('fornecedores service validates update, deactivate and reactivate flows through repository checks', async () => {
  const originalBuscarPorId = fornecedoresRepository.buscarPorId
  const originalBuscarPorCnpj = fornecedoresRepository.buscarPorCnpj
  const originalAtualizar = fornecedoresRepository.atualizar
  const originalDesativar = fornecedoresRepository.desativar
  const originalReativar = fornecedoresRepository.reativar

  fornecedoresRepository.buscarPorId = async () => ({ id: 8, nome_fantasia: 'Forn', ativo: true }) as any
  fornecedoresRepository.buscarPorCnpj = async () => ({ id: 10, cnpj: '77' }) as any
  fornecedoresRepository.atualizar = async (id: number, payload: any) => ({ id, ...payload }) as any
  fornecedoresRepository.desativar = async (id: number) => ({ id, ativo: false }) as any
  fornecedoresRepository.reativar = async (id: number) => ({ id, ativo: true }) as any

  await assert.rejects(
    () => fornecedoresService.atualizar(8, { cnpj: '77' } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.FORNECEDOR_CNPJ_DUPLICADO)
      return true
    },
  )

  fornecedoresRepository.buscarPorCnpj = async () => ({ id: 8, cnpj: '77' }) as any
  const updated = await fornecedoresService.atualizar(8, { nome_fantasia: 'Forn Atualizado', cnpj: '77' } as any)
  assert.equal(updated.id, 8)

  const disabled = await fornecedoresService.desativar(8)
  assert.equal(disabled.ativo, false)

  const reactivated = await fornecedoresService.reativar(8)
  assert.equal(reactivated.ativo, true)

  fornecedoresRepository.buscarPorId = originalBuscarPorId
  fornecedoresRepository.buscarPorCnpj = originalBuscarPorCnpj
  fornecedoresRepository.atualizar = originalAtualizar
  fornecedoresRepository.desativar = originalDesativar
  fornecedoresRepository.reativar = originalReativar
})
