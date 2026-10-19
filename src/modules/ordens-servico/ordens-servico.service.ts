import { AppError, NaoEncontradoError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import { DadosInvalidosError } from '../../shared/errors/AppError'
import { ordensServicoRepository } from './ordens-servico.repository'
import { CriarOrcamentoDto, CriarServicoDto, FiltroOrdemServicoDto } from './ordens-servico.dto'
import {
  STATUS_OS_ABERTA,
  TIPO_OS_ORCAMENTO,
  TIPO_OS_SERVICO_AGENDADO,
} from './ordens-servico.constants'

function calcularPrazoVencido(prazoAcordado: Date | string | null | undefined, terminal: boolean | undefined) {
  if (!prazoAcordado || terminal) return false
  return new Date(prazoAcordado).getTime() < Date.now()
}

export const ordensServicoService = {
  async listar(filtros: FiltroOrdemServicoDto) {
    const { dados, total, pagina, limite } = await ordensServicoRepository.listar(filtros)

    return {
      dados: dados.map((ordem: any) => ({
        ...ordem,
        prazo_vencido: calcularPrazoVencido(ordem.prazo_acordado, ordem.status_os?.terminal),
      })),
      total,
      pagina,
      limite,
    }
  },

  async buscarPorId(id: number) {
    const ordem = await ordensServicoRepository.buscarPorId(id)
    if (!ordem) throw new NaoEncontradoError(ERROR_CODES.ORDEM_SERVICO_NAO_ENCONTRADA)

    return {
      ...ordem,
      prazo_vencido: calcularPrazoVencido(ordem.prazo_acordado, ordem.status_os?.terminal),
    }
  },

  async criarOrcamento(dto: CriarOrcamentoDto, usuarioId: number) {
    return this.criar(dto, usuarioId, TIPO_OS_ORCAMENTO)
  },

  async criarServico(dto: CriarServicoDto, usuarioId: number) {
    if (!dto.prazo_acordado) {
      throw new DadosInvalidosError('Prazo acordado é obrigatório para serviço agendado.')
    }

    if (new Date(dto.prazo_acordado).getTime() < Date.now()) {
      throw new DadosInvalidosError('Prazo acordado não pode estar no passado.')
    }

    return this.criar(dto, usuarioId, TIPO_OS_SERVICO_AGENDADO)
  },

  async criar(dto: CriarOrcamentoDto | CriarServicoDto, usuarioId: number, tipoNome: string) {
    const cliente = await ordensServicoRepository.buscarClientePorId(dto.cliente_id)
    if (!cliente || !cliente.ativo) throw new NaoEncontradoError(ERROR_CODES.CLIENTE_NAO_ENCONTRADO)

    const equipamento = await ordensServicoRepository.buscarEquipamentoPorId(dto.equipamento_id)
    if (!equipamento || !equipamento.ativo) throw new NaoEncontradoError(ERROR_CODES.EQUIPAMENTO_NAO_ENCONTRADO)
    if (equipamento.cliente_id !== dto.cliente_id) {
      throw new AppError(ERROR_CODES.EQUIPAMENTO_NAO_PERTENCE_AO_CLIENTE)
    }

    const tipoOs = await ordensServicoRepository.buscarTipoPorNome(tipoNome)
    const statusOs = await ordensServicoRepository.buscarStatusPorNome(STATUS_OS_ABERTA)

    if (!tipoOs || !statusOs) {
      throw new NaoEncontradoError(ERROR_CODES.CONFIGURACAO_OS_AUSENTE)
    }

    if (dto.prazo_acordado && new Date(dto.prazo_acordado).getTime() < Date.now()) {
      throw new DadosInvalidosError('Prazo acordado não pode estar no passado.')
    }

    const dados = {
      problema: dto.problema.trim(),
      observacoes: dto.observacoes?.trim(),
      prazo_acordado: dto.prazo_acordado ? new Date(dto.prazo_acordado) : null,
      usuario_id: usuarioId,
      cliente_id: dto.cliente_id,
      equipamento_id: dto.equipamento_id,
      tipo_os_id: tipoOs.id,
      status_os_id: statusOs.id,
      ...(tipoNome === TIPO_OS_SERVICO_AGENDADO && 'valor_total' in dto && dto.valor_total !== undefined && { valor_total: dto.valor_total }),
      ...(tipoNome === TIPO_OS_SERVICO_AGENDADO && 'dias_garantia' in dto && dto.dias_garantia !== undefined && { dias_garantia: dto.dias_garantia }),
    }

    const ordem = await ordensServicoRepository.criar(dados)
    return {
      ...ordem,
      prazo_vencido: calcularPrazoVencido(ordem.prazo_acordado, ordem.status_os?.terminal),
    }
  },
}
