import { z } from 'zod'

export const CriarTipoServicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  preco_base: z.coerce.number().nonnegative('Preço base inválido').optional(),
  preco_estimado: z.coerce.number().nonnegative('Preço estimado inválido').optional(),
  dias_garantia: z.coerce.number().int().nonnegative('Dias de garantia inválidos').optional(),
  ativo: z.boolean().optional(),
})

export const AtualizarTipoServicoSchema = CriarTipoServicoSchema.partial()

export const FiltroTipoServicoSchema = z.object({
  busca: z.string().optional(),
  ativo: z.enum(['true', 'false']).optional(),
  pagina: z.coerce.number().default(1),
  limite: z.coerce.number().default(20),
})

export type CriarTipoServicoDto = z.infer<typeof CriarTipoServicoSchema>
export type AtualizarTipoServicoDto = z.infer<typeof AtualizarTipoServicoSchema>
export type FiltroTipoServicoDto = z.infer<typeof FiltroTipoServicoSchema>
