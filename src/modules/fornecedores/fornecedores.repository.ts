import prisma from '../../shared/lib/prisma'
import { FiltroFornecedorDto } from './fornecedores.dto'
import { descriptografarCampo } from '../../shared/lib/field-encryption'

function revelar(fornecedor: any) {
  return fornecedor?.observacoes ? { ...fornecedor, observacoes: descriptografarCampo(fornecedor.observacoes) } : fornecedor
}

export const fornecedoresRepository = {

  async listar(filtros: FiltroFornecedorDto) {
    const { busca, ativo, pagina, limite } = filtros
    const skip = (pagina - 1) * limite

    const where = {
      ...(busca && {
        OR: [
          { nome_fantasia: { contains: busca, mode: 'insensitive' as const } },
          { cnpj:          { contains: busca } },
          { telefone:      { contains: busca } },
          { email:         { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(ativo !== undefined && { ativo: ativo === 'true' }),
    }

    const [dados, total] = await Promise.all([
      prisma.fornecedor.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nome_fantasia: 'asc' },
      }),
      prisma.fornecedor.count({ where }),
    ])

    return { dados: dados.map(revelar), total, pagina, limite }
  },

  buscarPorId: async (id: number) => revelar(await prisma.fornecedor.findUniqueOrThrow({ where: { id } })),

  buscarPorCnpj: async (cnpj: string) =>
    prisma.fornecedor.findUnique({ where: { cnpj } }),

  criar: async (dados: any) => revelar(await prisma.fornecedor.create({ data: dados })),

  atualizar: async (id: number, dados: any) => revelar(await prisma.fornecedor.update({ where: { id }, data: dados })),

  desativar: async (id: number) =>
    prisma.fornecedor.update({ where: { id }, data: { ativo: false } }),

  reativar: async (id: number) =>
    prisma.fornecedor.update({ where: { id }, data: { ativo: true } }),
}
