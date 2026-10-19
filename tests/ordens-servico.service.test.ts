import assert from 'node:assert/strict'
import test from 'node:test'
import { ordensServicoService } from '../src/modules/ordens-servico/ordens-servico.service'
import { ordensServicoRepository } from '../src/modules/ordens-servico/ordens-servico.repository'
import { ERROR_CODES } from '../src/erros/errorCodes'
import { AppError, NaoEncontradoError } from '../src/shared/errors/AppError'

test('ordens servico service creates budget and service successfully', async () => {
  const originalCliente = ordensServicoRepository.buscarClientePorId
  const originalEquipamento = ordensServicoRepository.buscarEquipamentoPorId
  const originalTipo = ordensServicoRepository.buscarTipoPorNome
  const originalStatus = ordensServicoRepository.buscarStatusPorNome
  const originalCriar = ordensServicoRepository.criar

  ordensServicoRepository.buscarClientePorId = async () => ({ id: 1, ativo: true }) as any
  ordensServicoRepository.buscarEquipamentoPorId = async () => ({ id: 7, ativo: true, cliente_id: 1 }) as any
  ordensServicoRepository.buscarTipoPorNome = async (nome: string) => ({ id: nome === 'Orçamento' ? 1 : 2, nome }) as any
  ordensServicoRepository.buscarStatusPorNome = async () => ({ id: 10, nome: 'Aberta', terminal: false }) as any
  ordensServicoRepository.criar = async (payload: any) => ({ id: 99, ...payload, status_os: { terminal: false }, prazo_acordado: payload.prazo_acordado ?? null }) as any

  const orcamento = await ordensServicoService.criarOrcamento({
    cliente_id: 1,
    equipamento_id: 7,
    problema: 'Sem carga',
    prazo_acordado: new Date(Date.now() + 60_000),
  }, 5)
  assert.equal(orcamento.id, 99)
  assert.equal(orcamento.prazo_vencido, false)

  const servico = await ordensServicoService.criarServico({
    cliente_id: 1,
    equipamento_id: 7,
    problema: 'Problema do teclado',
    prazo_acordado: new Date(Date.now() + 60_000),
    valor_total: 150,
    dias_garantia: 30,
  }, 5)
  assert.equal(servico.id, 99)

  ordensServicoRepository.buscarClientePorId = originalCliente
  ordensServicoRepository.buscarEquipamentoPorId = originalEquipamento
  ordensServicoRepository.buscarTipoPorNome = originalTipo
  ordensServicoRepository.buscarStatusPorNome = originalStatus
  ordensServicoRepository.criar = originalCriar
})

test('ordens servico service rejects invalid cliente and equipment combinations', async () => {
  const originalCliente = ordensServicoRepository.buscarClientePorId
  const originalEquipamento = ordensServicoRepository.buscarEquipamentoPorId
  const originalTipo = ordensServicoRepository.buscarTipoPorNome
  const originalStatus = ordensServicoRepository.buscarStatusPorNome

  ordensServicoRepository.buscarClientePorId = async () => ({ id: 1, ativo: false }) as any
  await assert.rejects(
    () => ordensServicoService.criarOrcamento({
      cliente_id: 1,
      equipamento_id: 7,
      problema: 'Falha no sistema',
    }, 5),
    (error: unknown) => {
      assert.ok(error instanceof NaoEncontradoError)
      assert.equal((error as any).errorCode, ERROR_CODES.CLIENTE_NAO_ENCONTRADO)
      return true
    },
  )

  ordensServicoRepository.buscarClientePorId = async () => ({ id: 1, ativo: true }) as any
  ordensServicoRepository.buscarEquipamentoPorId = async () => ({ id: 7, ativo: false, cliente_id: 1 }) as any
  await assert.rejects(
    () => ordensServicoService.criarOrcamento({
      cliente_id: 1,
      equipamento_id: 7,
      problema: 'Falha no sistema',
    }, 5),
    (error: unknown) => {
      assert.ok(error instanceof NaoEncontradoError)
      assert.equal((error as any).errorCode, ERROR_CODES.EQUIPAMENTO_NAO_ENCONTRADO)
      return true
    },
  )

  ordensServicoRepository.buscarEquipamentoPorId = async () => ({ id: 7, ativo: true, cliente_id: 2 }) as any
  await assert.rejects(
    () => ordensServicoService.criarOrcamento({
      cliente_id: 1,
      equipamento_id: 7,
      problema: 'Falha no sistema',
    }, 5),
    (error: unknown) => {
      assert.ok(error instanceof AppError)
      assert.equal((error as any).errorCode, ERROR_CODES.EQUIPAMENTO_NAO_PERTENCE_AO_CLIENTE)
      return true
    },
  )

  ordensServicoRepository.buscarEquipamentoPorId = async () => ({ id: 7, ativo: true, cliente_id: 1 }) as any
  ordensServicoRepository.buscarTipoPorNome = async () => null
  ordensServicoRepository.buscarStatusPorNome = async () => ({ id: 10, nome: 'Aberta', terminal: false }) as any
  await assert.rejects(
    () => ordensServicoService.criarOrcamento({
      cliente_id: 1,
      equipamento_id: 7,
      problema: 'Falha no sistema',
    }, 5),
    (error: unknown) => {
      assert.ok(error instanceof NaoEncontradoError)
      assert.equal((error as any).errorCode, ERROR_CODES.CONFIGURACAO_OS_AUSENTE)
      return true
    },
  )

  ordensServicoRepository.buscarTipoPorNome = originalTipo
  ordensServicoRepository.buscarStatusPorNome = originalStatus
  ordensServicoRepository.buscarClientePorId = originalCliente
  ordensServicoRepository.buscarEquipamentoPorId = originalEquipamento
})

test('ordens servico service calculates overdue flag and missing order detail', async () => {
  const originalBuscarPorId = ordensServicoRepository.buscarPorId
  ordensServicoRepository.buscarPorId = async () => ({
    id: 12,
    prazo_acordado: new Date(Date.now() - 60_000),
    status_os: { terminal: false },
  }) as any
  const found = await ordensServicoService.buscarPorId(12)
  assert.equal(found.prazo_vencido, true)
  ordensServicoRepository.buscarPorId = async () => ({
    id: 13,
    prazo_acordado: new Date(Date.now() - 60_000),
    status_os: { terminal: true },
  }) as any
  const terminal = await ordensServicoService.buscarPorId(13)
  assert.equal(terminal.prazo_vencido, false)

  ordensServicoRepository.buscarPorId = async () => null
  await assert.rejects(
    () => ordensServicoService.buscarPorId(999),
    (error: unknown) => {
      assert.ok(error instanceof NaoEncontradoError)
      assert.equal((error as any).errorCode, ERROR_CODES.ORDEM_SERVICO_NAO_ENCONTRADA)
      return true
    },
  )

  ordensServicoRepository.buscarPorId = originalBuscarPorId
})
