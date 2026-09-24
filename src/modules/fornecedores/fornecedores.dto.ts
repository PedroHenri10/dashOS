import { z } from 'zod'
import { PaginacaoSchema } from '../../shared/validation/request.schemas'

export const CriarFornecedorSchema = z.object({
  nome_fantasia:       z.string().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
  cnpj:                z.string().optional(),
  telefone:            z.string().optional(),
  email:               z.string().email('E-mail inválido').optional().or(z.literal('')),
  contato_responsavel: z.string().optional(),
  observacoes:         z.string().optional(),

  logradouro:  z.string().optional(),
  numero:      z.string().optional(),
  complemento: z.string().optional(),
  bairro:      z.string().optional(),
  cidade:      z.string().optional(),
  estado:      z.string().max(2, 'Use a sigla do estado (ex: SP)').optional(),
  cep:         z.string().optional(),
})

export const AtualizarFornecedorSchema = CriarFornecedorSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  'Informe pelo menos um campo para atualizar',
)

export const FiltroFornecedorSchema = z.object({
  busca:  z.string().optional(),
  ativo:  z.enum(['true', 'false']).optional(),
  ...PaginacaoSchema,
})

export type CriarFornecedorDto     = z.infer<typeof CriarFornecedorSchema>
export type AtualizarFornecedorDto = z.infer<typeof AtualizarFornecedorSchema>
export type FiltroFornecedorDto    = z.infer<typeof FiltroFornecedorSchema>
