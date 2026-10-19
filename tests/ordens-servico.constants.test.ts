import assert from 'node:assert/strict'
import test from 'node:test'
import {
  FLUXOS_TIPO_OS,
  STATUS_OS_ABERTA,
  TIPO_OS_ORCAMENTO,
  TIPO_OS_SERVICO_AGENDADO,
} from '../src/modules/ordens-servico/ordens-servico.constants'

test('ordens servico constants describe the allowed type flows', () => {
  assert.equal(STATUS_OS_ABERTA, 'Aberta')
  assert.deepEqual(FLUXOS_TIPO_OS[TIPO_OS_ORCAMENTO], [
    'Aberta',
    'Em Diagnóstico',
    'Aguardando Aprovação',
    'Em Execução',
    'Concluída',
    'Cancelada',
  ])
  assert.deepEqual(FLUXOS_TIPO_OS[TIPO_OS_SERVICO_AGENDADO], [
    'Aberta',
    'Aguardando Peças',
    'Em Execução',
    'Concluída',
    'Cancelada',
  ])
})
