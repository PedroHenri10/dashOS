import prisma from '../../shared/lib/prisma'
import { FiltroUsuarioDto } from './usuarios.dto'
import { Perfil } from '../../shared/enums/perfil.enum'

export const usuariosRepository = {

  async listar(filtros: FiltroUsuarioDto) {
    const { busca, ativo, pagina, limite } = filtros
    const skip = (pagina - 1) * limite  

    const where = {
      ...(busca && {
        OR: [
          { nome_completo: { contains: busca, mode: 'insensitive' as const } },
          { email:         { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
      ...(ativo !== undefined && { ativo: ativo === 'true' }),
    }

    const [dados, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limite,
        include: { perfil: true },
        omit:    { senha: true }, 
        orderBy: { nome_completo: 'asc' },
      }),
      prisma.usuario.count({ where }),
    ])

    return { dados, total, pagina, limite }
  },

  buscarPorId: (id: number) =>
    prisma.usuario.findUniqueOrThrow({  
      where:   { id },
      include: { perfil: true },
      omit:    { senha: true },
    }),

  buscarPorEmail: (email: string) =>
    prisma.usuario.findUnique({ where: { email } }),

  buscarPerfilPorId: (id: number) =>
    prisma.perfil.findUnique({ where: { id } }),

  buscarOuCriarPerfil: (nome: Perfil) =>
    prisma.perfil.upsert({
      where: { nome },
      update: {},
      create: { nome },
    }),

  criar: (dados: any) =>
    prisma.usuario.create({
      data:    dados,
      include: { perfil: true },
      omit:    { senha: true },
    }),

  atualizar: (id: number, dados: any) =>
    prisma.usuario.update({
      where:   { id },
      data:    dados,
      include: { perfil: true },
      omit:    { senha: true },
    }),

  desativar: (id: number) =>
    prisma.usuario.update({
      where: { id },
      data:  { ativo: false },
    }),

  listarPerfis: () =>
    prisma.perfil.findMany({ orderBy: { nome: 'asc' } }),

}