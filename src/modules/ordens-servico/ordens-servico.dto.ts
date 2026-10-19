import { z } from 'zod'
import { PaginacaoSchema } from '../../shared/validation/request.schemas'

const baseSchema = z.object({
  cliente_id: z.number().int().positive('Cliente inválido'),
  equipamento_id: z.number().int().positive('Equipamento inválido'),
  problema: z.string().trim().min(5, 'Descreva melhor o problema').max(500, 'Problema muito longo'),
  observacoes: z.string().trim().max(2000, 'Observações muito longas').optional(),
  prazo_acordado: z.coerce.date().optional(),
})

export const CriarOrcamentoSchema = baseSchema
export const CriarServicoSchema = baseSchema.extend({
  prazo_acordado: z.coerce.date({
    error: 'Prazo acordado inválido',
  }),
  valor_total: z.coerce.number().positive('Valor total inválido').optional(),
  dias_garantia: z.coerce.number().int().nonnegative('Dias de garantia inválidos').optional(),
})

export const FiltroOrdemServicoSchema = z.object({
  busca: z.string().trim().max(120, 'Busca muito longa').optional(),
  usuario_id: z.coerce.number().int().positive().optional(),
  cliente_id: z.coerce.number().int().positive().optional(),
  equipamento_id: z.coerce.number().int().positive().optional(),
  tipo_os_id: z.coerce.number().int().positive().optional(),
  status_os_id: z.coerce.number().int().positive().optional(),
  prazo_de: z.coerce.date().optional(),
  prazo_ate: z.coerce.date().optional(),
  ...PaginacaoSchema,
})

export type CriarOrcamentoDto = z.infer<typeof CriarOrcamentoSchema>
export type CriarServicoDto = z.infer<typeof CriarServicoSchema>
export type FiltroOrdemServicoDto = z.infer<typeof FiltroOrdemServicoSchema>
