import assert from 'node:assert/strict'
import test from 'node:test'
import { CriarOrcamentoSchema, CriarServicoSchema } from '../src/modules/ordens-servico/ordens-servico.dto'

test('OS dto rejects invalid values and forbidden keys are stripped', () => {
  assert.throws(() => CriarOrcamentoSchema.parse({
    cliente_id: 1,
    equipamento_id: 2,
    problema: 'ok',
    tipo_os_id: 99,
  }), /problema/)

  assert.throws(() => CriarServicoSchema.parse({
    cliente_id: 1,
    equipamento_id: 2,
    problema: 'Problema real',
    prazo_acordado: new Date(Date.now() - 60_000).toISOString(),
    valor_total: 0,
  }), /Prazo acordado|Valor total/)

  assert.throws(() => CriarServicoSchema.parse({
    cliente_id: 1,
    equipamento_id: 2,
    problema: 'Problema real',
    valor_total: 25,
    dias_garantia: -1,
  }), /Prazo acordado|Dias de garantia/)

  const parsed = CriarOrcamentoSchema.parse({
    cliente_id: 1,
    equipamento_id: 2,
    problema: 'Problema de diagnóstico',
    observacoes: 'teste',
    prazo_acordado: new Date(Date.now() + 60_000).toISOString(),
    extra: 'ignored',
  })

  assert.equal(parsed.cliente_id, 1)
  assert.equal(parsed.problema, 'Problema de diagnóstico')
  assert.equal((parsed as any).extra, undefined)
})
