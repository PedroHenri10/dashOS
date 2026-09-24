import { FastifyReply, FastifyRequest } from 'fastify'
import { usuariosService } from './usuarios.service'
import {
  CriarUsuarioSchema,
  AtualizarUsuarioSchema,
  FiltroUsuarioSchema,
} from './usuarios.dto'
import { ok, criado, semConteudo, paginado } from '../../shared/types/response.types'
import { IdParamSchema } from '../../shared/validation/request.schemas'

type ListarRequest = FastifyRequest<{ Querystring: unknown }>
type BuscarRequest = FastifyRequest<{ Params: { id: string } }>
type CriarRequest = FastifyRequest<{ Body: unknown }>
type AtualizarRequest = FastifyRequest<{ Params: { id: string }; Body: unknown }>

export const usuariosController = {
  async listar(request: ListarRequest, reply: FastifyReply) {
    const filtros = FiltroUsuarioSchema.parse(request.query)
    const { dados, total, pagina, limite } = await usuariosService.listar(filtros)
    return paginado(reply, dados, { total, pagina, limite })
  },

  async buscar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const usuario = await usuariosService.buscarPorId(id)
    return ok(reply, usuario)
  },

  async criar(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarUsuarioSchema.parse(request.body)
    const usuario = await usuariosService.criar(dto)
    return criado(reply, usuario)
  },

  async atualizar(request: AtualizarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const dto = AtualizarUsuarioSchema.parse(request.body)
    const usuario = await usuariosService.atualizar(id, dto)
    return ok(reply, usuario)
  },

  async desativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    await usuariosService.desativar(id)
    return semConteudo(reply)
  },

  async perfis(_request: FastifyRequest, reply: FastifyReply) {
    const perfis = await usuariosService.listarPerfis()
    return ok(reply, perfis)
  },
}
