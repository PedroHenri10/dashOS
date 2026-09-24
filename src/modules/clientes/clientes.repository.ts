import prisma from '../../shared/lib/prisma'
import { FiltroClienteDto } from './clientes.dto'

export const clientesRepository = {

  async listar(filtros: FiltroClienteDto) {
    const { busca, tipo, ativo, pagina, limite } = filtros
    const skip = (pagina - 1) * limite

    const where = {
      ...(busca && {
        OR: [
          { nome:      { contains: busca, mode: 'insensitive' as const } },
          { cpf_cnpj:  { contains: busca } },
          { telefone_1:{ contains: busca } },
          { email:     { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(tipo  && { tipo }),
      ...(ativo !== undefined && { ativo: ativo === 'true' }),
    }

    const [dados, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limite,
        orderBy: { nome: 'asc' },
      }),
      prisma.cliente.count({ where }),
    ])

    return { dados, total, pagina, limite }
  },

  buscarPorId: async (id: number) =>
    prisma.cliente.findUniqueOrThrow({ where: { id } }),

  buscarPorCpfCnpj: async (cpf_cnpj: string) =>
    prisma.cliente.findUnique({ where: { cpf_cnpj } }),

  criar: async (dados: any) =>
    prisma.cliente.create({ data: dados }),

  atualizar: async (id: number, dados: any) =>
    prisma.cliente.update({ where: { id }, data: dados }),

  desativar: async (id: number) =>
    prisma.cliente.update({ where: { id }, data: { ativo: false } }),

  reativar: async (id: number) =>
    prisma.cliente.update({ where: { id }, data: { ativo: true } }),
}