import assert from 'node:assert/strict'
import test from 'node:test'
import { servicosController } from '../src/modules/servicos/servicos.controller'
import { servicosRepository } from '../src/modules/servicos/servicos.repository'
import { servicosService } from '../src/modules/servicos/servicos.service'

function makeReply() {
  let statusCode = 200
  let body: unknown

  return {
    status(code: number) {
      statusCode = code
      return {
        send(payload: unknown) {
          body = payload
          return payload
        },
      }
    },
    getBody: () => body,
    getStatus: () => statusCode,
  }
}

test('servicos controller covers list, create, update and reactivation flows', async () => {
  const originalListar = servicosService.listar
  const originalBuscarPorId = servicosService.buscarPorId
  const originalCriar = servicosService.criar
  const originalAtualizar = servicosService.atualizar
  const originalDesativar = servicosService.desativar
  const originalReativar = servicosService.reativar

  servicosService.listar = async () => ({ dados: [{ id: 1, nome: 'Diagnóstico' }], total: 1, pagina: 1, limite: 10 }) as any
  servicosService.buscarPorId = async () => ({ id: 1, nome: 'Diagnóstico' }) as any
  servicosService.criar = async () => ({ id: 2, nome: 'Manutenção' }) as any
  servicosService.atualizar = async () => ({ id: 1, nome: 'Atualizado' }) as any
  servicosService.desativar = async () => undefined
  servicosService.reativar = async () => ({ id: 1, nome: 'Diagnóstico', ativo: true }) as any

  const listReply = makeReply()
  const listResult = await servicosController.listar({ query: { pagina: 1, limite: 10 } } as any, listReply as any)
  assert.equal(listResult.sucesso, true)

  const buscarReply = makeReply()
  const buscarResult = await servicosController.buscar({ params: { id: '1' } } as any, buscarReply as any)
  assert.equal(buscarResult.sucesso, true)

  const criarReply = makeReply()
  const criarResult = await servicosController.criar({ body: { nome: 'Manutenção', descricao: 'desc' } } as any, criarReply as any)
  assert.equal(criarResult.sucesso, true)

  const atualizarReply = makeReply()
  const atualizarResult = await servicosController.atualizar({ params: { id: '1' }, body: { nome: 'Atualizado' } } as any, atualizarReply as any)
  assert.equal(atualizarResult.sucesso, true)

  const desativarReply = makeReply()
  await servicosController.desativar({ params: { id: '1' } } as any, desativarReply as any)
  assert.equal(desativarReply.getStatus(), 204)

  const reativarReply = makeReply()
  const reativarResult = await servicosController.reativar({ params: { id: '1' } } as any, reativarReply as any)
  assert.equal(reativarResult.sucesso, true)

  servicosService.listar = originalListar
  servicosService.buscarPorId = originalBuscarPorId
  servicosService.criar = originalCriar
  servicosService.atualizar = originalAtualizar
  servicosService.desativar = originalDesativar
  servicosService.reativar = originalReativar
})

test('servicos service covers list and lookup branches', async () => {
  const originalListar = servicosRepository.listar
  const originalBuscarPorId = servicosRepository.buscarPorId

  servicosRepository.listar = async () => ({
    dados: [{ id: 2, nome: 'Diagnóstico Lista', ativo: true }],
    total: 1,
    pagina: 1,
    limite: 10,
  }) as any

  servicosRepository.buscarPorId = async (id: number) => ({
    id,
    nome: 'Diagnóstico Busca',
    ativo: true,
  }) as any

  const listed = await servicosService.listar({ busca: 'Diagnóstico', ativo: 'true', pagina: 1, limite: 10 })
  assert.equal(listed.total, 1)
  assert.equal(listed.dados[0].nome, 'Diagnóstico Lista')

  const found = await servicosService.buscarPorId(4)
  assert.equal(found.id, 4)
  assert.equal(found.nome, 'Diagnóstico Busca')

  servicosRepository.listar = originalListar
  servicosRepository.buscarPorId = originalBuscarPorId
})

test('servicos service validates update, deactivate and reactivate flows through repository checks', async () => {
  const originalBuscarPorId = servicosRepository.buscarPorId
  const originalAtualizar = servicosRepository.atualizar
  const originalDesativar = servicosRepository.desativar
  const originalReativar = servicosRepository.reativar

  servicosRepository.buscarPorId = async () => ({ id: 3, nome: 'Diagnóstico', ativo: true }) as any
  servicosRepository.atualizar = async (id: number, payload: any) => ({ id, ...payload, ativo: true }) as any
  servicosRepository.desativar = async (id: number) => ({ id, ativo: false }) as any
  servicosRepository.reativar = async (id: number) => ({ id, ativo: true }) as any

  const updated = await servicosService.atualizar(3, { nome: 'Diagnóstico Atualizado' } as any)
  assert.equal(updated.id, 3)
  assert.equal(updated.nome, 'Diagnóstico Atualizado')

  const disabled = await servicosService.desativar(3)
  assert.equal(disabled.ativo, false)

  const reactivated = await servicosService.reativar(3)
  assert.equal(reactivated.ativo, true)

  servicosRepository.buscarPorId = originalBuscarPorId
  servicosRepository.atualizar = originalAtualizar
  servicosRepository.desativar = originalDesativar
  servicosRepository.reativar = originalReativar
})
