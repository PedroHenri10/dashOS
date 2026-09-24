import { z } from 'zod'

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID inválido'),
})

export const PaginacaoSchema = {
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
}