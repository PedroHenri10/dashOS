import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
})

export const AlterarSenhaSchema = z.object({
  senhaAtual: z.string().min(6, 'Senha atual inválida'),
  novaSenha: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
}).refine((dados) => dados.senhaAtual !== dados.novaSenha, {
  message: 'A nova senha deve ser diferente da senha atual',
  path: ['novaSenha'],
})

export type LoginDto   = z.infer<typeof LoginSchema>
export type RefreshDto = z.infer<typeof RefreshSchema>
export type AlterarSenhaDto = z.infer<typeof AlterarSenhaSchema>