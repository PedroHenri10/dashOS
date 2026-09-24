import prisma from '../../shared/lib/prisma'
import { FiltroTipoServicoDto } from './servicos.dto'

export const servicosRepository = {
  async listar(filtros: FiltroTipoServicoDto) {
    const { busca, ativo, pagina, limite } = filtros
    const skip = (pagina - 1) * limite

    const where = {
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' as const } },
          { descricao: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(ativo !== undefined && { ativo: ativo === 'true' }),
    }

    const [dados, total] = await Promise.all([
      prisma.tipoServico.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nome: 'asc' },
      }),
      prisma.tipoServico.count({ where }),
    ])

    return { dados, total, pagina, limite }
  },

  buscarPorId: async (id: number) =>
    prisma.tipoServico.findUniqueOrThrow({ where: { id } }),

  buscarPorNome: async (nome: string) =>
    prisma.tipoServico.findFirst({ where: { nome } }),

  criar: async (dados: any) =>
    prisma.tipoServico.create({ data: dados }),

  atualizar: async (id: number, dados: any) =>
    prisma.tipoServico.update({ where: { id }, data: dados }),

  desativar: async (id: number) =>
    prisma.tipoServico.update({ where: { id }, data: { ativo: false } }),

  reativar: async (id: number) =>
    prisma.tipoServico.update({ where: { id }, data: { ativo: true } }),
}
