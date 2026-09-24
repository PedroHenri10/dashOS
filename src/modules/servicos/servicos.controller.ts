import { FastifyReply, FastifyRequest } from 'fastify'
import { servicosService } from './servicos.service'
import {
  AtualizarTipoServicoSchema,
  CriarTipoServicoSchema,
  FiltroTipoServicoSchema,
} from './servicos.dto'
import { ok, criado, semConteudo, paginado } from '../../shared/types/response.types'
import { IdParamSchema } from '../../shared/validation/request.schemas'

type ListarRequest = FastifyRequest<{ Querystring: unknown }>
type BuscarRequest = FastifyRequest<{ Params: { id: string } }>
type CriarRequest = FastifyRequest<{ Body: unknown }>
type AtualizarRequest = FastifyRequest<{ Params: { id: string }; Body: unknown }>

export const servicosController = {
  async listar(request: ListarRequest, reply: FastifyReply) {
    const filtros = FiltroTipoServicoSchema.parse(request.query)
    const { dados, total, pagina, limite } = await servicosService.listar(filtros)
    return paginado(reply, dados, { total, pagina, limite })
  },

  async buscar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const tipoServico = await servicosService.buscarPorId(id)
    return ok(reply, tipoServico)
  },

  async criar(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarTipoServicoSchema.parse(request.body)
    const tipoServico = await servicosService.criar(dto)
    return criado(reply, tipoServico)
  },

  async atualizar(request: AtualizarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const dto = AtualizarTipoServicoSchema.parse(request.body)
    const tipoServico = await servicosService.atualizar(id, dto)
    return ok(reply, tipoServico)
  },

  async desativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    await servicosService.desativar(id)
    return semConteudo(reply)
  },

  async reativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const tipoServico = await servicosService.reativar(id)
    return ok(reply, tipoServico, 'Tipo de serviço reativado com sucesso')
  },
}
