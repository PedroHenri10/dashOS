import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import { servicosRepository } from '../src/modules/servicos/servicos.repository'

test('servicos repository covers list, lookup, create, update and activate/deactivate flows', async () => {
  const originalTipoServico = prisma.tipoServico

  ;(prisma as any).tipoServico = {
    findMany: async (args: any) => {
      assert.ok(args.where)
      return [{ id: 1, nome: 'Diagnóstico', ativo: true }]
    },
    count: async (args: any) => 1,
    findUniqueOrThrow: async (args: any) => ({ id: args.where.id, nome: 'Diagnóstico', ativo: true }),
    create: async (args: any) => ({ id: 12, ...args.data }),
    update: async (args: any) => ({ id: args.where.id, ...args.data }),
  } as any

  const list = await servicosRepository.listar({ busca: 'Diagnóstico', ativo: 'true', pagina: 1, limite: 10 })
  const byId = await servicosRepository.buscarPorId(1)
  const created = await servicosRepository.criar({ nome: 'Manutenção', descricao: 'desc' })
  const updated = await servicosRepository.atualizar(1, { nome: 'Atualizado' })
  const disabled = await servicosRepository.desativar(1)
  const reactivated = await servicosRepository.reativar(1)

  assert.equal(list.total, 1)
  assert.equal(byId.id, 1)
  assert.equal(created.id, 12)
  assert.equal(updated.id, 1)
  assert.equal(disabled.id, 1)
  assert.equal(reactivated.id, 1)

  ;(prisma as any).tipoServico = originalTipoServico
})
