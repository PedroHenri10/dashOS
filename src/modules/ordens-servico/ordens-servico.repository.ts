import prisma from '../../shared/lib/prisma'
import { FiltroOrdemServicoDto } from './ordens-servico.dto'

const clienteResumoSelect = {
  id: true,
  nome: true,
  tipo: true,
  telefone_1: true,
  email: true,
  ativo: true,
}

const equipamentoResumoSelect = {
  id: true,
  nome: true,
  marca: true,
  modelo: true,
  serie_imei: true,
  cod_etiqueta: true,
  ativo: true,
  cliente_id: true,
}

const usuarioResumoSelect = {
  id: true,
  nome_completo: true,
  email: true,
  telefone: true,
}

const osInclude = {
  cliente: {
    select: clienteResumoSelect,
  },
  equipamento: {
    select: {
      ...equipamentoResumoSelect,
      tipo: true,
    },
  },
  usuario: {
    select: usuarioResumoSelect,
  },
  tipo_os: true,
  status_os: true,
  imagens: true,
  itens_servico: {
    include: {
      tipo_servico: true,
    },
  },
} as const

export const ordensServicoRepository = {
  listar: async (filtros: FiltroOrdemServicoDto) => {
    const { busca, usuario_id, cliente_id, equipamento_id, tipo_os_id, status_os_id, prazo_de, prazo_ate, pagina, limite } = filtros
    const skip = (pagina - 1) * limite

    const where: any = {
      ...(busca && {
        OR: [
          { problema: { contains: busca, mode: 'insensitive' as const } },
          { cliente: { nome: { contains: busca, mode: 'insensitive' as const } } },
          { equipamento: { nome: { contains: busca, mode: 'insensitive' as const } } },
          { equipamento: { marca: { contains: busca, mode: 'insensitive' as const } } },
          { equipamento: { modelo: { contains: busca, mode: 'insensitive' as const } } },
          { equipamento: { serie_imei: { contains: busca } } },
          { equipamento: { cod_etiqueta: { contains: busca } } },
        ],
      }),
      ...(usuario_id !== undefined && { usuario_id }),
      ...(cliente_id !== undefined && { cliente_id }),
      ...(equipamento_id !== undefined && { equipamento_id }),
      ...(tipo_os_id !== undefined && { tipo_os_id }),
      ...(status_os_id !== undefined && { status_os_id }),
      ...(prazo_de && { prazo_acordado: { gte: new Date(prazo_de) } }),
      ...(prazo_ate && { prazo_acordado: { lte: new Date(prazo_ate) } }),
    }

    const [dados, total] = await Promise.all([
      prisma.ordemServico.findMany({
        where,
        skip,
        take: limite,
        include: {
          cliente: { select: { id: true, nome: true } },
          equipamento: { select: { id: true, nome: true, marca: true, modelo: true } },
          usuario: { select: { id: true, nome_completo: true } },
          tipo_os: true,
          status_os: true,
        },
        orderBy: { data_abertura: 'desc' },
      }),
      prisma.ordemServico.count({ where }),
    ])

    return { dados, total, pagina, limite }
  },

  buscarPorId: async (id: number) => prisma.ordemServico.findUnique({
    where: { id },
    include: osInclude,
  }),

  buscarClientePorId: async (id: number) => prisma.cliente.findUnique({
    where: { id },
    select: clienteResumoSelect,
  }),

  buscarEquipamentoPorId: async (id: number) => prisma.equipamento.findUnique({
    where: { id },
    select: {
      ...equipamentoResumoSelect,
      cliente: {
        select: clienteResumoSelect,
      },
    },
  }),

  buscarTipoPorNome: async (nome: string) => prisma.tipoOS.findUnique({ where: { nome } }),

  buscarStatusPorNome: async (nome: string) => prisma.statusOS.findUnique({ where: { nome } }),

  criar: async (dados: any) => prisma.ordemServico.create({
    data: dados,
    include: osInclude,
  }),
}
