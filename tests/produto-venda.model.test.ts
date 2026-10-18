import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import type { Prisma } from '@prisma/client'

test('produto_venda model does not rely on descricao and resolves details from produto', async () => {
  const originalProdutoVenda = prisma.produtoVenda

  let createdData: any = null

  ;(prisma as any).produtoVenda = {
    create: async (args: { data: Prisma.ProdutoVendaCreateInput }) => {
      createdData = args.data
      return {
        id: 1,
        quantidade: args.data.quantidade,
        valor_uni: args.data.valor_uni,
        valor_total: args.data.valor_total ?? null,
        venda_id: 10,
        produto_id: 20,
      }
    },
    findFirst: async (_args: any) => ({
      id: 1,
      quantidade: 2,
      valor_uni: 150.0,
      valor_total: 300.0,
      venda_id: 10,
      produto_id: 20,
      produto: {
        id: 20,
        nome: 'Fonte ATX 600W',
        desc: 'Fonte 80 Plus Bronze',
      },
    }),
  } as any

  const itemVenda = await prisma.produtoVenda.create({
    data: {
      quantidade: 2,
      valor_uni: 150.0,
      valor_total: 300.0,
      venda: { connect: { id: 10 } },
      produto: { connect: { id: 20 } },
    },
  })

  assert.equal(itemVenda.id, 1)
  assert.equal(itemVenda.quantidade, 2)
  // Ensure descricao does not exist on ProdutoVenda record
  assert.equal((itemVenda as any).descricao, undefined)
  assert.equal((createdData as any).descricao, undefined)

  // Verify finding with relation to get description from Produto
  const itemComProduto = await prisma.produtoVenda.findFirst({
    where: { id: 1 },
    include: { produto: true },
  })

  assert.equal(itemComProduto?.produto?.nome, 'Fonte ATX 600W')
  assert.equal(itemComProduto?.produto?.desc, 'Fonte 80 Plus Bronze')

  ;(prisma as any).produtoVenda = originalProdutoVenda
})
