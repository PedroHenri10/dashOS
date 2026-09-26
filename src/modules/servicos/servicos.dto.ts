import { z } from 'zod'
import { PaginacaoSchema } from '../../shared/validation/request.schemas'

export const CriarTipoServicoSchema = z.object({
  nome: z.string().trim().min(2).max(120, 'Nome muito longo'),
  descricao: z.string().max(1000, 'Descrição muito longa').optional(),
  preco_base: z.coerce.number().nonnegative('Preço base inválido').optional(),
  preco_estimado: z.coerce.number().nonnegative('Preço estimado inválido').optional(),
  dias_garantia: z.coerce.number().int().nonnegative('Dias de garantia inválidos').optional(),
  ativo: z.boolean().optional(),
})

export const AtualizarTipoServicoSchema = CriarTipoServicoSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  'Informe pelo menos um campo para atualizar',
)

export const FiltroTipoServicoSchema = z.object({
  busca: z.string().optional(),
  ativo: z.enum(['true', 'false']).optional(),
  ...PaginacaoSchema,
})

export type CriarTipoServicoDto = z.infer<typeof CriarTipoServicoSchema>
export type AtualizarTipoServicoDto = z.infer<typeof AtualizarTipoServicoSchema>
export type FiltroTipoServicoDto = z.infer<typeof FiltroTipoServicoSchema>
