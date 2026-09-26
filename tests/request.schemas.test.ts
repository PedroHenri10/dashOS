import assert from 'node:assert/strict'
import test from 'node:test'
import { IdParamSchema, PaginacaoSchema } from '../src/shared/validation/request.schemas'
import { AtualizarClienteSchema } from '../src/modules/clientes/clientes.dto'
import { AtualizarFornecedorSchema } from '../src/modules/fornecedores/fornecedores.dto'
import { AtualizarEquipamentoSchema } from '../src/modules/equipamentos/equipamentos.dto'
import { AtualizarTipoServicoSchema } from '../src/modules/servicos/servicos.dto'
import { AtualizarUsuarioSchema } from '../src/modules/usuarios/usuarios.dto'
import { LoginSchema } from '../src/modules/auth/auth.dto'

test('request schemas accept positive integer IDs and bounded pagination', () => {
  assert.equal(IdParamSchema.parse({ id: '12' }).id, 12)
  assert.deepEqual(PaginacaoSchema.pagina.parse(undefined), 1)
  assert.deepEqual(PaginacaoSchema.limite.parse('50'), 50)

  assert.throws(() => IdParamSchema.parse({ id: 'abc' }))
  assert.throws(() => IdParamSchema.parse({ id: '1.5' }))
  assert.throws(() => PaginacaoSchema.pagina.parse('0'))
  assert.throws(() => PaginacaoSchema.limite.parse('101'))
  assert.throws(() => PaginacaoSchema.limite.parse('2.5'))
})

test('update schemas reject empty payloads', () => {
  for (const schema of [
    AtualizarClienteSchema,
    AtualizarFornecedorSchema,
    AtualizarEquipamentoSchema,
    AtualizarTipoServicoSchema,
    AtualizarUsuarioSchema,
  ]) {
    assert.throws(() => schema.parse({}))
  }
})

test('input schemas reject oversized values and short login passwords', () => {
  assert.throws(() => LoginSchema.parse({ email: 'user@example.com', senha: '12345' }))
  assert.throws(() => AtualizarClienteSchema.parse({ nome: 'a'.repeat(121) }))
  assert.throws(() => AtualizarFornecedorSchema.parse({ observacoes: 'a'.repeat(1001) }))
  assert.throws(() => AtualizarEquipamentoSchema.parse({ serie_imei: 'a'.repeat(41) }))
  assert.throws(() => AtualizarTipoServicoSchema.parse({ descricao: 'a'.repeat(1001) }))
})
