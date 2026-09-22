import { equipamentosRepository } from './equipamentos.repository'
import { ConflitoError, NaoEncontradoError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import {
  CriarEquipamentoDto,
  AtualizarEquipamentoDto,
  FiltroEquipamentoDto,
} from './equipamentos.dto'

export const equipamentosService = {
  async listar(filtros: FiltroEquipamentoDto) {
    return equipamentosRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return equipamentosRepository.buscarPorId(id)
  },

  async criar(dto: CriarEquipamentoDto) {
    const tipo = await equipamentosRepository.buscarTipoPorId(dto.tipo_id)
    if (!tipo) throw new NaoEncontradoError(ERROR_CODES.TIPO_EQUIPAMENTO_NAO_ENCONTRADO)

    const cliente = await equipamentosRepository.buscarClientePorId(dto.cliente_id)
    if (!cliente) throw new NaoEncontradoError(ERROR_CODES.CLIENTE_NAO_ENCONTRADO)

    if (dto.serie_imei) {
      const existente = await equipamentosRepository.buscarPorSerieImei(dto.serie_imei)
      if (existente) throw new ConflitoError(ERROR_CODES.REGISTRO_JA_EXISTE)
    }

    if (dto.cod_etiqueta) {
      const existente = await equipamentosRepository.buscarPorCodigoEtiqueta(dto.cod_etiqueta)
      if (existente) throw new ConflitoError(ERROR_CODES.REGISTRO_JA_EXISTE)
    }

    return equipamentosRepository.criar(dto)
  },

  async atualizar(id: number, dto: AtualizarEquipamentoDto) {
    await equipamentosRepository.buscarPorId(id)

    if (dto.tipo_id) {
      const tipo = await equipamentosRepository.buscarTipoPorId(dto.tipo_id)
      if (!tipo) throw new NaoEncontradoError(ERROR_CODES.TIPO_EQUIPAMENTO_NAO_ENCONTRADO)
    }

    if (dto.cliente_id) {
      const cliente = await equipamentosRepository.buscarClientePorId(dto.cliente_id)
      if (!cliente) throw new NaoEncontradoError(ERROR_CODES.CLIENTE_NAO_ENCONTRADO)
    }

    if (dto.serie_imei) {
      const existente = await equipamentosRepository.buscarPorSerieImei(dto.serie_imei)
      if (existente && existente.id !== id) throw new ConflitoError(ERROR_CODES.REGISTRO_JA_EXISTE)
    }

    if (dto.cod_etiqueta) {
      const existente = await equipamentosRepository.buscarPorCodigoEtiqueta(dto.cod_etiqueta)
      if (existente && existente.id !== id) throw new ConflitoError(ERROR_CODES.REGISTRO_JA_EXISTE)
    }

    return equipamentosRepository.atualizar(id, dto)
  },

  async desativar(id: number) {
    await equipamentosRepository.buscarPorId(id)
    return equipamentosRepository.desativar(id)
  },

  async reativar(id: number) {
    await equipamentosRepository.buscarPorId(id)
    return equipamentosRepository.reativar(id)
  },

  async listarTipos() {
    return equipamentosRepository.listarTipos()
  },

  async criarTipo(nome: string) {
    const existe = await equipamentosRepository.buscarTipoPorNome(nome)
    if (existe) throw new ConflitoError(ERROR_CODES.TIPO_EQUIPAMENTO_JA_EXISTE)

    return equipamentosRepository.criarTipo(nome)
  },
}
