import { FastifyReply, FastifyRequest } from 'fastify'
import { IdParamSchema } from '../../shared/validation/request.schemas'
import { ok, criado, paginado } from '../../shared/types/response.types'
import { FiltroOrdemServicoSchema, CriarOrcamentoSchema, CriarServicoSchema } from './ordens-servico.dto'
import { ordensServicoService } from './ordens-servico.service'

type ListarRequest = FastifyRequest<{ Querystring: unknown }>
type BuscarRequest = FastifyRequest<{ Params: { id: string } }>
type CriarRequest = FastifyRequest<{ Body: unknown }>

export const ordensServicoController = {
  async listar(request: ListarRequest, reply: FastifyReply) {
    const filtros = FiltroOrdemServicoSchema.parse(request.query)
    const { dados, total, pagina, limite } = await ordensServicoService.listar(filtros)
    return paginado(reply, dados, { total, pagina, limite })
  },

  async buscar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const ordem = await ordensServicoService.buscarPorId(id)
    return ok(reply, ordem)
  },

  async criarOrcamento(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarOrcamentoSchema.parse(request.body)
    const ordem = await ordensServicoService.criarOrcamento(dto, request.user!.sub)
    return criado(reply, ordem)
  },

  async criarServico(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarServicoSchema.parse(request.body)
    const ordem = await ordensServicoService.criarServico(dto, request.user!.sub)
    return criado(reply, ordem)
  },
}
