import { fornecedoresRepository } from './fornecedores.repository'
import { ConflitoError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import { CriarFornecedorDto, AtualizarFornecedorDto, FiltroFornecedorDto } from './fornecedores.dto'
import { criptografarCampo } from '../../shared/lib/field-encryption'

export const fornecedoresService = {
  async listar(filtros: FiltroFornecedorDto) {
    return fornecedoresRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return fornecedoresRepository.buscarPorId(id)
  },

  async criar(dto: CriarFornecedorDto) {
    if (dto.cnpj) {
      const existe = await fornecedoresRepository.buscarPorCnpj(dto.cnpj)
      if (existe) throw new ConflitoError(ERROR_CODES.FORNECEDOR_CNPJ_DUPLICADO)
    }

    return fornecedoresRepository.criar({
      ...dto,
      ...(dto.observacoes && { observacoes: criptografarCampo(dto.observacoes) }),
    })
  },

  async atualizar(id: number, dto: AtualizarFornecedorDto) {
    await fornecedoresRepository.buscarPorId(id)

    if (dto.cnpj) {
      const existe = await fornecedoresRepository.buscarPorCnpj(dto.cnpj)
      if (existe && existe.id !== id)
        throw new ConflitoError(ERROR_CODES.FORNECEDOR_CNPJ_DUPLICADO)
    }

    return fornecedoresRepository.atualizar(id, {
      ...dto,
      ...(dto.observacoes && { observacoes: criptografarCampo(dto.observacoes) }),
    })
  },

  async desativar(id: number) {
    await fornecedoresRepository.buscarPorId(id)
    return fornecedoresRepository.desativar(id)
  },

  async reativar(id: number) {
    await fornecedoresRepository.buscarPorId(id)
    return fornecedoresRepository.reativar(id)
  },
}
