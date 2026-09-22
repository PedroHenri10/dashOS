import prisma from '../../shared/lib/prisma'
import { FiltroEquipamentoDto } from './equipamentos.dto'

export const equipamentosRepository = {

  async listar(filtros: FiltroEquipamentoDto) {
    const { busca, tipo_id, cliente_id, ativo, pagina, limite } = filtros
    const skip = (pagina - 1) * limite

    const where = {
      ...(busca && {
        OR: [
          { nome:         { contains: busca, mode: 'insensitive' as const } },
          { marca:        { contains: busca, mode: 'insensitive' as const } },
          { modelo:       { contains: busca, mode: 'insensitive' as const } },
          { serie_imei:   { contains: busca, mode: 'insensitive' as const } },
          { cod_etiqueta: { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(tipo_id    && { tipo_id }),
      ...(cliente_id && { cliente_id }),
      ...(ativo !== undefined && { ativo: ativo === 'true' }),
    }

    const [dados, total] = await Promise.all([
      prisma.equipamento.findMany({
        where,
        skip,
        take: limite,
        include: { tipo: true, cliente: true },
        orderBy: { data_cadastro: 'desc' },
      }),
      prisma.equipamento.count({ where }),
    ])

    return { dados, total, pagina, limite }
  },

  buscarPorId: (id: number) =>
    prisma.equipamento.findUniqueOrThrow({
      where: { id },
      include: { tipo: true, cliente: true },
    }),

  buscarTipoPorId: (id: number) =>
    prisma.tipoEquipamento.findUnique({ where: { id } }),

  buscarClientePorId: (id: number) =>
    prisma.cliente.findUnique({ where: { id } }),

  buscarPorSerieImei: (serie_imei: string) =>
    prisma.equipamento.findFirst({ where: { serie_imei } }),

  buscarPorCodigoEtiqueta: (cod_etiqueta: string) =>
    prisma.equipamento.findFirst({ where: { cod_etiqueta } }),

  criar: (dados: any) =>
    prisma.equipamento.create({
      data: dados,
      include: { tipo: true, cliente: true },
    }),

  atualizar: (id: number, dados: any) =>
    prisma.equipamento.update({
      where: { id },
      data: dados,
      include: { tipo: true, cliente: true },
    }),

  desativar: (id: number) =>
    prisma.equipamento.update({ where: { id }, data: { ativo: false } }),

  reativar: (id: number) =>
    prisma.equipamento.update({ where: { id }, data: { ativo: true } }),

  listarTipos: () =>
    prisma.tipoEquipamento.findMany({ orderBy: { nome: 'asc' } }),

  buscarTipoPorNome: (nome: string) =>
    prisma.tipoEquipamento.findUnique({ where: { nome } }),

  criarTipo: (nome: string) =>
    prisma.tipoEquipamento.create({ data: { nome } }),
}
