import assert from 'node:assert/strict'
import test from 'node:test'
import { equipamentosRepository } from '../src/modules/equipamentos/equipamentos.repository'
import { equipamentosService } from '../src/modules/equipamentos/equipamentos.service'
import { ConflitoError } from '../src/shared/errors/AppError'
import { ERROR_CODES } from '../src/erros/errorCodes'

test('equipamentos service validates type duplicate and creation', async () => {
  const originalListarTipos = equipamentosRepository.listarTipos
  const originalBuscarTipoPorNome = equipamentosRepository.buscarTipoPorNome
  const originalCriarTipo = equipamentosRepository.criarTipo

  equipamentosRepository.listarTipos = async () => [{ id: 1, nome: 'Celular' }] as any
  const tipos = await equipamentosService.listarTipos()
  assert.equal(tipos[0].nome, 'Celular')

  equipamentosRepository.buscarTipoPorNome = async () => ({ id: 2, nome: 'Tablet' }) as any
  await assert.rejects(
    () => equipamentosService.criarTipo('Tablet'),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.TIPO_EQUIPAMENTO_JA_EXISTE)
      return true
    },
  )

  equipamentosRepository.buscarTipoPorNome = async () => null
  equipamentosRepository.criarTipo = async (nome: string) => ({ id: 3, nome }) as any

  const created = await equipamentosService.criarTipo('Monitor')
  assert.equal(created.id, 3)
  assert.equal(created.nome, 'Monitor')

  equipamentosRepository.listarTipos = originalListarTipos
  equipamentosRepository.buscarTipoPorNome = originalBuscarTipoPorNome
  equipamentosRepository.criarTipo = originalCriarTipo
})
