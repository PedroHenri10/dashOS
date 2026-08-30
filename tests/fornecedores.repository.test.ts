import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import { fornecedoresRepository } from '../src/modules/fornecedores/fornecedores.repository'

test('fornecedores repository covers list, lookup, create, update and activate/deactivate flows', async () => {
  const originalFornecedor = prisma.fornecedor

  prisma.fornecedor = {
    findMany: async (args: any) => {
      assert.ok(args.where)
      return [{ id: 1, nome_fantasia: 'Forn 1', cnpj: '11', ativo: true }]
    },
    count: async (args: any) => 1,
    findUniqueOrThrow: async (args: any) => ({ id: args.where.id, nome_fantasia: 'Forn 1', cnpj: '11', ativo: true }),
    findUnique: async (args: any) => ({ id: 9, cnpj: args.where.cnpj, ativo: true }),
    create: async (args: any) => ({ id: 24, ...args.data }),
    update: async (args: any) => ({ id: args.where.id, ...args.data }),
  } as any

  const list = await fornecedoresRepository.listar({ busca: 'Forn', ativo: 'true', pagina: 1, limite: 10 })
  const byId = await fornecedoresRepository.buscarPorId(1)
  const byDoc = await fornecedoresRepository.buscarPorCnpj('11')
  const created = await fornecedoresRepository.criar({ nome_fantasia: 'Novo', cnpj: '22' })
  const updated = await fornecedoresRepository.atualizar(1, { nome_fantasia: 'Atualizado' })
  const disabled = await fornecedoresRepository.desativar(1)
  const reactivated = await fornecedoresRepository.reativar(1)

  assert.equal(list.total, 1)
  assert.equal(byId.id, 1)
  assert.equal(byDoc?.cnpj, '11')
  assert.equal(created.id, 24)
  assert.equal(updated.id, 1)
  assert.equal(disabled.id, 1)
  assert.equal(reactivated.id, 1)

  prisma.fornecedor = originalFornecedor
})
