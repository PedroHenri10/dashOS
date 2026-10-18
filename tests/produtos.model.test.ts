import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import type { Prisma } from '@prisma/client'

test('produto model supports estoque_minimo field with safe defaults', async () => {
  const originalProduto = prisma.produto

  let createdPayload: any = null

  ;(prisma as any).produto = {
    create: async (args: { data: Prisma.ProdutoCreateInput }) => {
      createdPayload = args.data
      return {
        id: 1,
        cod: args.data.cod ?? null,
        nome: args.data.nome,
        desc: args.data.desc ?? null,
        categoria: args.data.categoria ?? null,
        preco_custo: null,
        preco_venda: null,
        estoque_minimo: args.data.estoque_minimo ?? 0,
        estoque_atual: args.data.estoque_atual ?? 0,
        data_criacao: new Date(),
        data_atualizacao: new Date(),
      }
    },
    findUnique: async (args: { where: { id: number } }) => ({
      id: args.where.id,
      nome: 'Memória RAM 16GB',
      estoque_minimo: 5,
      estoque_atual: 20,
    }),
  } as any

  // 1. Creation with custom estoque_minimo
  const produtoComEstoqueMinimo = await prisma.produto.create({
    data: {
      nome: 'SSD NVMe 1TB',
      estoque_minimo: 10,
      estoque_atual: 25,
    },
  })
  assert.equal(produtoComEstoqueMinimo.estoque_minimo, 10)
  assert.equal(produtoComEstoqueMinimo.estoque_atual, 25)
  assert.equal(createdPayload?.estoque_minimo, 10)

  // 2. Creation with default estoque_minimo (fallback to 0)
  const produtoPadrao = await prisma.produto.create({
    data: {
      nome: 'Cabo HDMI',
    },
  })
  assert.equal(produtoPadrao.estoque_minimo, 0)
  assert.equal(produtoPadrao.estoque_atual, 0)

  ;(prisma as any).produto = originalProduto
})
