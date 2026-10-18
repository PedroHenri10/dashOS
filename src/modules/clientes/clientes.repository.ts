import prisma from '../../shared/lib/prisma'
import { FiltroClienteDto } from './clientes.dto'
import { descriptografarCampo, gerarHashBusca } from '../../shared/lib/field-encryption'
import { limparDocumento } from '../../util'

function revelar(cliente: any) {
  if (!cliente) return cliente
  return {
    ...cliente,
    ...(cliente.observacao && { observacao: descriptografarCampo(cliente.observacao) }),
    ...(cliente.cpf_cnpj && { cpf_cnpj: descriptografarCampo(cliente.cpf_cnpj) }),
  }
}

export const clientesRepository = {

  async listar(filtros: FiltroClienteDto) {
    const { busca, tipo, ativo, pagina, limite } = filtros
    const skip = (pagina - 1) * limite

    const limpoBusca = busca ? limparDocumento(busca) : ''
    const hashBusca = limpoBusca.length >= 11 ? gerarHashBusca(limpoBusca) : undefined

    const where = {
      ...(busca && {
        OR: [
          { nome:       { contains: busca, mode: 'insensitive' as const } },
          ...(hashBusca ? [{ cpf_cnpj_hash: hashBusca }] : [{ cpf_cnpj: { contains: busca } }]),
          { telefone_1: { contains: busca } },
          { email:      { contains: busca, mode: 'insensitive' as const } },
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

    return { dados: dados.map(revelar), total, pagina, limite }
  },

  buscarPorId: async (id: number) => revelar(await prisma.cliente.findUniqueOrThrow({ where: { id } })),

  buscarPorCpfCnpj: async (cpf_cnpj: string) => {
    const limpo = limparDocumento(cpf_cnpj)
    const hash = gerarHashBusca(limpo)
    const where = {
      OR: [
        { cpf_cnpj_hash: hash },
        { cpf_cnpj: limpo },
        { cpf_cnpj },
      ],
    }
    const cliente = typeof prisma.cliente.findFirst === 'function'
      ? await prisma.cliente.findFirst({ where })
      : await prisma.cliente.findUnique({ where: { cpf_cnpj } } as any)
    return revelar(cliente)
  },

  criar: async (dados: any) => revelar(await prisma.cliente.create({ data: dados })),

  atualizar: async (id: number, dados: any) => revelar(await prisma.cliente.update({ where: { id }, data: dados })),

  desativar: async (id: number) =>
    prisma.cliente.update({ where: { id }, data: { ativo: false } }),

  reativar: async (id: number) =>
    prisma.cliente.update({ where: { id }, data: { ativo: true } }),
}