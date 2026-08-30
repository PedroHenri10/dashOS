import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import { clientesRepository } from '../src/modules/clientes/clientes.repository'

test('clientes repository covers list, lookup, create, update and activate/deactivate flows', async () => {
  const originalCliente = prisma.cliente

  prisma.cliente = {
    findMany: async (args: any) => {
      assert.ok(args.where)
      return [{ id: 1, nome: 'Cliente 1', cpf_cnpj: '123', ativo: true }]
    },
    count: async (args: any) => {
      assert.ok(args.where)
      return 1
    },
    findUniqueOrThrow: async (args: any) => ({ id: args.where.id, nome: 'Cliente 1', cpf_cnpj: '123', ativo: true }),
    findUnique: async (args: any) => ({ id: 11, cpf_cnpj: args.where.cpf_cnpj, ativo: true }),
    create: async (args: any) => ({ id: 42, ...args.data }),
    update: async (args: any) => ({ id: args.where.id, ...args.data }),
  } as any

  const list = await clientesRepository.listar({ busca: 'Cliente', tipo: 'Pessoa Física', ativo: 'true', pagina: 1, limite: 10 })
  const byId = await clientesRepository.buscarPorId(1)
  const byDoc = await clientesRepository.buscarPorCpfCnpj('123')
  const created = await clientesRepository.criar({ nome: 'Novo', cpf_cnpj: '456', tipo: 'Pessoa Física' })
  const updated = await clientesRepository.atualizar(1, { nome: 'Atualizado' })
  const disabled = await clientesRepository.desativar(1)
  const reativado = await clientesRepository.reativar(1)

  assert.equal(list.total, 1)
  assert.equal(byId.id, 1)
  assert.equal(byDoc?.cpf_cnpj, '123')
  assert.equal(created.id, 42)
  assert.equal(updated.id, 1)
  assert.equal(disabled.id, 1)
  assert.equal(reativado.id, 1)

  prisma.cliente = originalCliente
})
