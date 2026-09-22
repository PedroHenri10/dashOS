import { servicosRepository } from './servicos.repository'
import { AtualizarTipoServicoDto, CriarTipoServicoDto, FiltroTipoServicoDto } from './servicos.dto'
import { ConflitoError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'

export const servicosService = {
  async listar(filtros: FiltroTipoServicoDto) {
    return servicosRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return servicosRepository.buscarPorId(id)
  },

  async criar(dto: CriarTipoServicoDto) {
    if (dto.nome) {
      const existente = await servicosRepository.buscarPorNome(dto.nome)
      if (existente) throw new ConflitoError(ERROR_CODES.REGISTRO_JA_EXISTE)
    }

    return servicosRepository.criar(dto)
  },

  async atualizar(id: number, dto: AtualizarTipoServicoDto) {
    await servicosRepository.buscarPorId(id)

    if (dto.nome) {
      const existente = await servicosRepository.buscarPorNome(dto.nome)
      if (existente && existente.id !== id) throw new ConflitoError(ERROR_CODES.REGISTRO_JA_EXISTE)
    }

    return servicosRepository.atualizar(id, dto)
  },

  async desativar(id: number) {
    await servicosRepository.buscarPorId(id)
    return servicosRepository.desativar(id)
  },

  async reativar(id: number) {
    await servicosRepository.buscarPorId(id)
    return servicosRepository.reativar(id)
  },
}
