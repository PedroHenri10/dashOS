import prisma from '../../shared/lib/prisma'

export const authRepository = {
  buscarPorEmail: async (email: string) =>
    prisma.usuario.findUnique({
      where: { email },
      include: { perfil: true },
    }),

  buscarPorId: async (id: number) =>
    prisma.usuario.findUnique({
      where: { id },
      include: { perfil: true },
      omit: { senha: true }, 
    }),

  buscarPorIdComSenha: async (id: number) =>
    prisma.usuario.findUnique({ where: { id } }),

  atualizarSenha: async (id: number, senha: string) =>
    prisma.usuario.update({ where: { id }, data: { senha } }),

  buscarTokenRevogado: async (token_hash: string) =>
    prisma.tokenRevogado.findUnique({ where: { token_hash } }),

  revogarToken: async (token_hash: string, expira_em: Date) =>
    prisma.tokenRevogado.upsert({
      where: { token_hash },
      update: { expira_em },
      create: { token_hash, expira_em },
    }),
}