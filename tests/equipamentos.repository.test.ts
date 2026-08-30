import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import { equipamentosRepository } from '../src/modules/equipamentos/equipamentos.repository'

test('equipamentos repository covers list, lookup, create, update and type flows', async () => {
  const originalEquipamento = prisma.equipamento
  const originalTipoEquipamento = prisma.tipoEquipamento

  prisma.equipamento = {
    findMany: async (args: any) => {
      assert.ok(args.where)
      return [{ id: 1, nome: 'iPhone', tipo: { nome: 'Celular' }, cliente: { nome: 'Cliente A' } }]
    },
    count: async (args: any) => 1,
    findUniqueOrThrow: async (args: any) => ({ id: args.where.id, nome: 'iPhone', tipo: { nome: 'Celular' }, cliente: { nome: 'Cliente A' } }),
    create: async (args: any) => ({ id: 30, ...args.data, tipo: { nome: 'Celular' }, cliente: { nome: 'Cliente A' } }),
    update: async (args: any) => ({ id: args.where.id, ...args.data, tipo: { nome: 'Celular' }, cliente: { nome: 'Cliente A' } }),
  } as any

  prisma.tipoEquipamento = {
    findMany: async () => [{ id: 1, nome: 'Celular' }],
    findUnique: async (args: any) => ({ id: 9, nome: args.where.nome }),
    create: async (args: any) => ({ id: 50, ...args.data }),
  } as any

  const list = await equipamentosRepository.listar({ busca: 'iPhone', ativo: 'true', pagina: 1, limite: 10 })
  const byId = await equipamentosRepository.buscarPorId(1)
  const created = await equipamentosRepository.criar({ nome: 'Galaxy', tipo_id: 1, cliente_id: 1 })
  const updated = await equipamentosRepository.atualizar(1, { nome: 'Atualizado' })
  const disabled = await equipamentosRepository.desativar(1)
  const reactivated = await equipamentosRepository.reativar(1)
  const tipos = await equipamentosRepository.listarTipos()
  const tipoFind = await equipamentosRepository.buscarTipoPorNome('Celular')
  const tipoCreate = await equipamentosRepository.criarTipo('Monitor')

  assert.equal(list.total, 1)
  assert.equal(byId.id, 1)
  assert.equal(created.id, 30)
  assert.equal(updated.id, 1)
  assert.equal(disabled.id, 1)
  assert.equal(reactivated.id, 1)
  assert.equal(tipos[0].nome, 'Celular')
  assert.equal(tipoFind?.nome, 'Celular')
  assert.equal(tipoCreate.id, 50)

  prisma.equipamento = originalEquipamento
  prisma.tipoEquipamento = originalTipoEquipamento
})
