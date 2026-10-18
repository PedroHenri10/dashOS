import { clientesRepository } from './clientes.repository'
import { ConflitoError, DadosInvalidosError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import { CriarClienteDto, AtualizarClienteDto, FiltroClienteDto } from './clientes.dto'
import { criptografarCampo, gerarHashBusca } from '../../shared/lib/field-encryption'
import { limparDocumento, validarCpfCnpj } from '../../util'

export const clientesService = {
  async listar(filtros: FiltroClienteDto) {
    return clientesRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return clientesRepository.buscarPorId(id)
  },

  async criar(dto: CriarClienteDto) {
    if (dto.cpf_cnpj) {
      if (!validarCpfCnpj(dto.cpf_cnpj, dto.tipo)) {
        throw new DadosInvalidosError('Documento informado é inválido.')
      }
    }

    const limpoDoc = dto.cpf_cnpj ? limparDocumento(dto.cpf_cnpj) : undefined

    if (limpoDoc) {
      const existe = await clientesRepository.buscarPorCpfCnpj(limpoDoc)
      if (existe) throw new ConflitoError(ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
    }

    return clientesRepository.criar({
      ...dto,
      ...(limpoDoc && {
        cpf_cnpj: criptografarCampo(limpoDoc),
        cpf_cnpj_hash: gerarHashBusca(limpoDoc),
      }),
      ...(dto.observacao && { observacao: criptografarCampo(dto.observacao) }),
    })
  },

  async atualizar(id: number, dto: AtualizarClienteDto) {
    await clientesRepository.buscarPorId(id)

    if (dto.cpf_cnpj) {
      if (!validarCpfCnpj(dto.cpf_cnpj, dto.tipo)) {
        throw new DadosInvalidosError('Documento informado é inválido.')
      }
    }

    const limpoDoc = dto.cpf_cnpj ? limparDocumento(dto.cpf_cnpj) : undefined

    if (limpoDoc) {
      const existe = await clientesRepository.buscarPorCpfCnpj(limpoDoc)
      if (existe && existe.id !== id)
        throw new ConflitoError(ERROR_CODES.CLIENTE_CPF_CNPJ_DUPLICADO)
    }

    return clientesRepository.atualizar(id, {
      ...dto,
      ...(limpoDoc && {
        cpf_cnpj: criptografarCampo(limpoDoc),
        cpf_cnpj_hash: gerarHashBusca(limpoDoc),
      }),
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