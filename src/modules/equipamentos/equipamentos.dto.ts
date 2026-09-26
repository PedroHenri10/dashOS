import { z } from 'zod'
import { PaginacaoSchema } from '../../shared/validation/request.schemas'

export const CriarEquipamentoSchema = z.object({
  nome:         z.string().trim().min(2).max(120, 'Nome muito longo'),
  marca:        z.string().trim().max(80, 'Marca muito longa').optional(),
  modelo:       z.string().trim().max(80, 'Modelo muito longo').optional(),
  serie_imei:   z.string().trim().max(40, 'Série/IMEI inválido').optional(),
  cor:          z.string().trim().max(40, 'Cor muito longa').optional(),
  cod_etiqueta: z.string().trim().max(40, 'Código de etiqueta inválido').optional(),
  tipo_id:      z.number().int().positive('Tipo de equipamento inválido'),
  cliente_id:   z.number().int().positive('Cliente inválido'),
})

export const AtualizarEquipamentoSchema = CriarEquipamentoSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  'Informe pelo menos um campo para atualizar',
)

export const FiltroEquipamentoSchema = z.object({
  busca:      z.string().optional(),
  tipo_id:    z.coerce.number().int().positive().optional(),
  cliente_id: z.coerce.number().int().positive().optional(),
  ativo:      z.enum(['true', 'false']).optional(),
  ...PaginacaoSchema,
})

export const CriarTipoEquipamentoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
})

export type CriarEquipamentoDto      = z.infer<typeof CriarEquipamentoSchema>
export type AtualizarEquipamentoDto  = z.infer<typeof AtualizarEquipamentoSchema>
export type FiltroEquipamentoDto     = z.infer<typeof FiltroEquipamentoSchema>
export type CriarTipoEquipamentoDto  = z.infer<typeof CriarTipoEquipamentoSchema>
