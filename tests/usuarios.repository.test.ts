import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import { usuariosRepository } from '../src/modules/usuarios/usuarios.repository'

test('usuarios repository covers list, lookup, create, update and deactivate flows', async () => {
  const originalUsuario = prisma.usuario
  const originalPerfil = prisma.perfil

  prisma.usuario = {
    findMany: async (args: any) => {
      assert.ok(args.where)
      return [{ id: 1, nome_completo: 'Usuario 1', email: 'u1@email.com', perfil: { nome: 'ADMINISTRADOR' } }]
    },
    count: async (args: any) => {
      assert.ok(args.where)
      return 1
    },
    findUniqueOrThrow: async (args: any) => {
      assert.equal(args.where.id, 1)
      return { id: 1, nome_completo: 'Usuario 1', email: 'u1@email.com', perfil: { nome: 'ADMINISTRADOR' } }
    },
    findUnique: async (args: any) => {
      if (args.where.email === 'duplicado@email.com') return { id: 2, email: 'duplicado@email.com' }
      return null
    },
    create: async (args: any) => ({ id: 99, ...args.data, perfil: { nome: 'ADMINISTRADOR' } }),
    update: async (args: any) => ({ id: args.where.id, ...args.data, perfil: { nome: 'ADMINISTRADOR' } }),
  } as any

  prisma.perfil = {
    findMany: async () => [{ id: 1, nome: 'ADMINISTRADOR' }],
  } as any

  const list = await usuariosRepository.listar({ busca: 'Usuario', ativo: 'true', pagina: 1, limite: 10 })
  const byId = await usuariosRepository.buscarPorId(1)
  const byEmail = await usuariosRepository.buscarPorEmail('duplicado@email.com')
  const created = await usuariosRepository.criar({ nome_completo: 'Novo', email: 'novo@email.com', senha: 'hash', perfil_id: 1 })
  const updated = await usuariosRepository.atualizar(1, { nome_completo: 'Atualizado' })
  const disabled = await usuariosRepository.desativar(1)
  const perfis = await usuariosRepository.listarPerfis()

  assert.equal(list.total, 1)
  assert.equal(byId.id, 1)
  assert.equal(byEmail?.id, 2)
  assert.equal(created.id, 99)
  assert.equal(updated.id, 1)
  assert.equal(disabled.id, 1)
  assert.ok(Array.isArray(perfis))

  prisma.usuario = originalUsuario
  prisma.perfil = originalPerfil
})
