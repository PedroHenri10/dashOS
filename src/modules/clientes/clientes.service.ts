import { clientesRepository } from './clientes.repository'
import { ConflitoError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import { CriarClienteDto, AtualizarClienteDto, FiltroClienteDto } from './clientes.dto'
import { criptografarCampo } from '../../shared/lib/field-encryption'

export const clientesService = {
  async listar(filtros: FiltroClienteDto) {
    return clientesRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return clientesRepository.buscarPorId(id)
  },

  async criar(dto: CriarClienteDto) {
    if (dto.cpf_cnpj) {
      const existe = await clientesRepository.buscarPorCpfCnpj(dto.cpf_cnpj)
      if (existe) throw new ConflitoError(ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
    }

    return clientesRepository.criar({
      ...dto,
      ...(dto.observacao && { observacao: criptografarCampo(dto.observacao) }),
    })
  },

  async atualizar(id: number, dto: AtualizarClienteDto) {
    await clientesRepository.buscarPorId(id)

    if (dto.cpf_cnpj) {
      const existe = await clientesRepository.buscarPorCpfCnpj(dto.cpf_cnpj)
      if (existe && existe.id !== id)
        throw new ConflitoError(ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
    }

    return clientesRepository.atualizar(id, {
      ...dto,
      ...(dto.observacao && { observacao: criptografarCampo(dto.observacao) }),
    })
  },

  async desativar(id: number) {
    await clientesRepository.buscarPorId(id)
    return clientesRepository.desativar(id)
  },

  async reativar(id: number) {
    await clientesRepository.buscarPorId(id)
    return clientesRepository.reativar(id)
  },
}