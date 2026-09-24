import { FastifyReply, FastifyRequest } from 'fastify'
import { fornecedoresService } from './fornecedores.service'
import {
  CriarFornecedorSchema,
  AtualizarFornecedorSchema,
  FiltroFornecedorSchema,
} from './fornecedores.dto'
import { ok, criado, semConteudo, paginado } from '../../shared/types/response.types'
import { IdParamSchema } from '../../shared/validation/request.schemas'

type ListarRequest = FastifyRequest<{ Querystring: unknown }>
type BuscarRequest = FastifyRequest<{ Params: { id: string } }>
type CriarRequest = FastifyRequest<{ Body: unknown }>
type AtualizarRequest = FastifyRequest<{ Params: { id: string }; Body: unknown }>

export const fornecedoresController = {
  async listar(request: ListarRequest, reply: FastifyReply) {
    const filtros = FiltroFornecedorSchema.parse(request.query)
    const { dados, total, pagina, limite } = await fornecedoresService.listar(filtros)
    return paginado(reply, dados, { total, pagina, limite })
  },

  async buscar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const fornecedor = await fornecedoresService.buscarPorId(id)
    return ok(reply, fornecedor)
  },

  async criar(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarFornecedorSchema.parse(request.body)
    const fornecedor = await fornecedoresService.criar(dto)
    return criado(reply, fornecedor)
  },

  async atualizar(request: AtualizarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const dto = AtualizarFornecedorSchema.parse(request.body)
    const fornecedor = await fornecedoresService.atualizar(id, dto)
    return ok(reply, fornecedor)
  },

  async desativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    await fornecedoresService.desativar(id)
    return semConteudo(reply)
  },

  async reativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const fornecedor = await fornecedoresService.reativar(id)
    return ok(reply, fornecedor, 'Fornecedor reativado com sucesso')
  },
}
