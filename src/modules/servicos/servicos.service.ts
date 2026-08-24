import { servicosRepository } from './servicos.repository'
import { AtualizarTipoServicoDto, CriarTipoServicoDto, FiltroTipoServicoDto } from './servicos.dto'

export const servicosService = {
  async listar(filtros: FiltroTipoServicoDto) {
    return servicosRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return servicosRepository.buscarPorId(id)
  },

  async criar(dto: CriarTipoServicoDto) {
    return servicosRepository.criar(dto)
  },

  async atualizar(id: number, dto: AtualizarTipoServicoDto) {
    await servicosRepository.buscarPorId(id)
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
