import { FastifyReply, FastifyRequest } from 'fastify'
import { equipamentosService } from './equipamentos.service'
import {
  CriarEquipamentoSchema,
  AtualizarEquipamentoSchema,
  FiltroEquipamentoSchema,
  CriarTipoEquipamentoSchema,
} from './equipamentos.dto'
import { ok, criado, semConteudo, paginado } from '../../shared/types/response.types'
import { IdParamSchema } from '../../shared/validation/request.schemas'

type ListarRequest = FastifyRequest<{ Querystring: unknown }>
type BuscarRequest = FastifyRequest<{ Params: { id: string } }>
type CriarRequest = FastifyRequest<{ Body: unknown }>
type AtualizarRequest = FastifyRequest<{ Params: { id: string }; Body: unknown }>

export const equipamentosController = {
  async listar(request: ListarRequest, reply: FastifyReply) {
    const filtros = FiltroEquipamentoSchema.parse(request.query)
    const { dados, total, pagina, limite } = await equipamentosService.listar(filtros)
    return paginado(reply, dados, { total, pagina, limite })
  },

  async buscar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const equipamento = await equipamentosService.buscarPorId(id)
    return ok(reply, equipamento)
  },

  async criar(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarEquipamentoSchema.parse(request.body)
    const equipamento = await equipamentosService.criar(dto)
    return criado(reply, equipamento)
  },

  async atualizar(request: AtualizarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const dto = AtualizarEquipamentoSchema.parse(request.body)
    const equipamento = await equipamentosService.atualizar(id, dto)
    return ok(reply, equipamento)
  },

  async desativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    await equipamentosService.desativar(id)
    return semConteudo(reply)
  },

  async reativar(request: BuscarRequest, reply: FastifyReply) {
    const { id } = IdParamSchema.parse(request.params)
    const equipamento = await equipamentosService.reativar(id)
    return ok(reply, equipamento, 'Equipamento reativado com sucesso')
  },

  async tipos(_request: FastifyRequest, reply: FastifyReply) {
    const tipos = await equipamentosService.listarTipos()
    return ok(reply, tipos)
  },

  async criarTipo(request: CriarRequest, reply: FastifyReply) {
    const dto = CriarTipoEquipamentoSchema.parse(request.body)
    const tipo = await equipamentosService.criarTipo(dto.nome)
    return criado(reply, tipo)
  },
}
