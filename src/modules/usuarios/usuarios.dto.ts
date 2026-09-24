import { z } from 'zod'
import { PaginacaoSchema } from '../../shared/validation/request.schemas'

export const CriarUsuarioSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email:         z.string().email('E-mail inválido'),
  senha:         z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  telefone:      z.string().optional(),
  perfil_id:     z.number().int().positive('Perfil inválido').optional(),
})

export const AtualizarUsuarioSchema = z.object({
  nome_completo: z.string().min(3).optional(),
  email:         z.string().email().optional(),
  telefone:      z.string().optional(),
  perfil_id:     z.number().int().positive().optional(),
}).refine(
  (dados) => Object.keys(dados).length > 0,
  'Informe pelo menos um campo para atualizar',
)

export const FiltroUsuarioSchema = z.object({
  busca: z.string().optional(),
  ativo: z.enum(['true', 'false']).optional(),
  pagina: PaginacaoSchema.pagina,
  limite: PaginacaoSchema.limite.default(10),
})

export type CriarUsuarioDto     = z.infer<typeof CriarUsuarioSchema>
export type AtualizarUsuarioDto = z.infer<typeof AtualizarUsuarioSchema>
export type FiltroUsuarioDto    = z.infer<typeof FiltroUsuarioSchema>