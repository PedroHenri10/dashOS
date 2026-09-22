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

test('equipamentos service validates related records and duplicate identifiers', async () => {
  const originalBuscarTipoPorId = equipamentosRepository.buscarTipoPorId
  const originalBuscarClientePorId = equipamentosRepository.buscarClientePorId
  const originalBuscarPorSerieImei = equipamentosRepository.buscarPorSerieImei
  const originalBuscarPorCodigoEtiqueta = equipamentosRepository.buscarPorCodigoEtiqueta
  const originalCriar = equipamentosRepository.criar

  equipamentosRepository.buscarTipoPorId = async () => null
  await assert.rejects(
    () => equipamentosService.criar({
      nome: 'Teste',
      tipo_id: 99,
      cliente_id: 1,
      serie_imei: '123',
    } as any),
    (error: unknown) => {
      assert.equal(error?.constructor?.name, 'NaoEncontradoError')
      return true
    },
  )

  equipamentosRepository.buscarTipoPorId = async () => ({ id: 1, nome: 'Celular' }) as any
  equipamentosRepository.buscarClientePorId = async () => null
  await assert.rejects(
    () => equipamentosService.criar({
      nome: 'Teste',
      tipo_id: 1,
      cliente_id: 99,
      serie_imei: '123',
    } as any),
    (error: unknown) => {
      assert.equal(error?.constructor?.name, 'NaoEncontradoError')
      return true
    },
  )

  equipamentosRepository.buscarClientePorId = async () => ({ id: 1, nome: 'Cliente 1' }) as any
  equipamentosRepository.buscarPorSerieImei = async () => ({ id: 7, serie_imei: '123' }) as any
  await assert.rejects(
    () => equipamentosService.criar({
      nome: 'Teste',
      tipo_id: 1,
      cliente_id: 1,
      serie_imei: '123',
    } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.REGISTRO_JA_EXISTE)
      return true
    },
  )

  equipamentosRepository.buscarPorSerieImei = async () => null
  equipamentosRepository.buscarPorCodigoEtiqueta = async () => ({ id: 8, cod_etiqueta: 'ETQ-001' }) as any
  await assert.rejects(
    () => equipamentosService.criar({
      nome: 'Teste',
      tipo_id: 1,
      cliente_id: 1,
      cod_etiqueta: 'ETQ-001',
    } as any),
    (error: unknown) => {
      assert.ok(error instanceof ConflitoError)
      assert.equal(error.errorCode, ERROR_CODES.REGISTRO_JA_EXISTE)
      return true
    },
  )

  equipamentosRepository.buscarPorCodigoEtiqueta = async () => null
  equipamentosRepository.criar = async (dados: any) => ({ id: 10, ...dados }) as any
  const created = await equipamentosService.criar({
    nome: 'Teste',
    tipo_id: 1,
    cliente_id: 1,
    cod_etiqueta: 'ETQ-002',
  } as any)
  assert.equal(created.id, 10)

  equipamentosRepository.buscarTipoPorId = originalBuscarTipoPorId
  equipamentosRepository.buscarClientePorId = originalBuscarClientePorId
  equipamentosRepository.buscarPorSerieImei = originalBuscarPorSerieImei
  equipamentosRepository.buscarPorCodigoEtiqueta = originalBuscarPorCodigoEtiqueta
  equipamentosRepository.criar = originalCriar
})
