import assert from 'node:assert/strict'
import test from 'node:test'
import prisma from '../src/shared/lib/prisma'
import { authRepository } from '../src/modules/auth/auth.repository'

test('auth repository reads usuario by email and id', async () => {
  const originalUsuario = prisma.usuario

  prisma.usuario = {
    findUnique: async ({ where }: any) => {
      if (where.email) return { id: 7, email: where.email, nome_completo: 'Ana', ativo: true, perfil: { nome: 'ADMINISTRADOR' } }
      if (where.id === 7) return { id: 7, nome_completo: 'Ana', ativo: true, perfil: { nome: 'ADMINISTRADOR' } }
      return null
    },
  } as any

  const byEmail = await authRepository.buscarPorEmail('ana@email.com')
  const byId = await authRepository.buscarPorId(7)

  assert.equal(byEmail?.email, 'ana@email.com')
  assert.equal(byId?.id, 7)

  prisma.usuario = originalUsuario
})
