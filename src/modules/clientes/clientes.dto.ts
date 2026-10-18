import { z } from 'zod'
import { PaginacaoSchema } from '../../shared/validation/request.schemas'
import { validarCPF, validarCNPJ, validarMEI, validarCpfCnpj } from '../../util'

// Shape base sem refinements — necessário para Zod v4, que proíbe .partial() em schemas com superRefine
const _clienteBaseShape = z.object({
  nome: z.string().trim().min(2).max(120, 'Nome muito longo'),
  tipo: z.enum(['PF', 'PJ', 'MEI'], { message: 'Tipo deve ser PF, PJ ou MEI' }),
  cpf_cnpj: z.string().trim().max(18, 'Documento inválido').optional(),
  telefone_1: z.string().trim().min(8, 'Telefone inválido').max(20, 'Telefone inválido'),
  telefone_2: z.string().trim().max(20, 'Telefone inválido').optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  observacao: z.string().max(1000, 'Observação muito longa').optional(),

  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2, 'Use a sigla do estado (ex: SP)').optional(),
  cep: z.string().optional(),
})

// Refinement reutilizável para validação de CPF/CNPJ/MEI conforme o tipo
function _validarDocumentoPorTipo(
  dados: { cpf_cnpj?: string; tipo?: string },
  ctx: z.RefinementCtx,
) {
  if (!dados.cpf_cnpj) return
  if (dados.tipo === 'PF' && !validarCPF(dados.cpf_cnpj)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CPF inválido', path: ['cpf_cnpj'] })
  } else if (dados.tipo === 'PJ' && !validarCNPJ(dados.cpf_cnpj)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CNPJ inválido', path: ['cpf_cnpj'] })
  } else if (dados.tipo === 'MEI' && !validarMEI(dados.cpf_cnpj, { tipo: 'MEI' })) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CNPJ de MEI inválido', path: ['cpf_cnpj'] })
  } else if (!dados.tipo && !validarCpfCnpj(dados.cpf_cnpj)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Documento (CPF/CNPJ/MEI) inválido', path: ['cpf_cnpj'] })
  }
}

export const CriarClienteSchema = _clienteBaseShape.superRefine(_validarDocumentoPorTipo)

export const AtualizarClienteSchema = _clienteBaseShape
  .partial()
  .refine(
    (dados) => Object.keys(dados).length > 0,
    'Informe pelo menos um campo para atualizar',
  )
  .superRefine(_validarDocumentoPorTipo)

export const FiltroClienteSchema = z.object({
  busca: z.string().optional(),
  tipo: z.enum(['PF', 'PJ', 'MEI']).optional(),
  ativo: z.enum(['true', 'false']).optional(),
  ...PaginacaoSchema,
})

export type CriarClienteDto     = z.infer<typeof CriarClienteSchema>
export type AtualizarClienteDto = z.infer<typeof AtualizarClienteSchema>
export type FiltroClienteDto    = z.infer<typeof FiltroClienteSchema>