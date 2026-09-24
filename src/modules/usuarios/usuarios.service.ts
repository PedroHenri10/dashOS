import bcrypt from 'bcrypt'
import { usuariosRepository } from './usuarios.repository'
import { ConflitoError } from '../../shared/errors/AppError'
import { NaoEncontradoError } from '../../shared/errors/AppError'
import { ERROR_CODES } from '../../erros/errorCodes'
import { CriarUsuarioDto, AtualizarUsuarioDto, FiltroUsuarioDto } from './usuarios.dto'
import { Perfil } from '../../shared/enums/perfil.enum'

export const usuariosService = {
  async listar(filtros: FiltroUsuarioDto) {
    return usuariosRepository.listar(filtros)
  },

  async buscarPorId(id: number) {
    return usuariosRepository.buscarPorId(id)
  },

  async criar(dto: CriarUsuarioDto) {
    const emailEmUso = await usuariosRepository.buscarPorEmail(dto.email)
    if (emailEmUso) throw new ConflitoError(ERROR_CODES.EMAIL_JA_CADASTRADO)

    const senhaHash = await bcrypt.hash(dto.senha, 10)
    if (dto.perfil_id && !(await usuariosRepository.buscarPerfilPorId(dto.perfil_id))) {
      throw new NaoEncontradoError(ERROR_CODES.PERFIL_NAO_ENCONTRADO)
    }
    const perfil_id = dto.perfil_id ?? (await usuariosRepository.buscarOuCriarPerfil(Perfil.TECNICO)).id

    return usuariosRepository.criar({ ...dto, perfil_id, senha: senhaHash })
  },

  async atualizar(id: number, dto: AtualizarUsuarioDto) {
    await usuariosRepository.buscarPorId(id)

    if (dto.email) {
      const emailEmUso = await usuariosRepository.buscarPorEmail(dto.email)
      if (emailEmUso && emailEmUso.id !== id) throw new ConflitoError(ERROR_CODES.EMAIL_JA_CADASTRADO)
    }

    if (dto.perfil_id && !(await usuariosRepository.buscarPerfilPorId(dto.perfil_id))) {
      throw new NaoEncontradoError(ERROR_CODES.PERFIL_NAO_ENCONTRADO)
    }

    return usuariosRepository.atualizar(id, dto)
  },

  async desativar(id: number) {
    await usuariosRepository.buscarPorId(id)
    return usuariosRepository.desativar(id)
  },

  listarPerfis: () => usuariosRepository.listarPerfis(),
}