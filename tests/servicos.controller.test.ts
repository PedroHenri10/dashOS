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
  ;(servicosService as any).desativar = async () => undefined
  servicosService.reativar = async () => ({ id: 1, nome: 'Diagnóstico', ativo: true }) as any

  const listReply = makeReply()
  const listResult = await servicosController.listar({ query: { pagina: 1, limite: 10 } } as any, listReply as any)
  assert.equal((listResult as any).sucesso, true)

  const buscarReply = makeReply()
  const buscarResult = await servicosController.buscar({ params: { id: '1' } } as any, buscarReply as any)
  assert.equal((buscarResult as any).sucesso, true)

  const criarReply = makeReply()
  const criarResult = await servicosController.criar({ body: { nome: 'Manutenção', descricao: 'desc' } } as any, criarReply as any)
  assert.equal((criarResult as any).sucesso, true)

  const atualizarReply = makeReply()
  const atualizarResult = await servicosController.atualizar({ params: { id: '1' }, body: { nome: 'Atualizado' } } as any, atualizarReply as any)
  assert.equal((atualizarResult as any).sucesso, true)

  const desativarReply = makeReply()
  await servicosController.desativar({ params: { id: '1' } } as any, desativarReply as any)
  assert.equal(desativarReply.getStatus(), 204)

  const reativarReply = makeReply()
  const reativarResult = await servicosController.reativar({ params: { id: '1' } } as any, reativarReply as any)
  assert.equal((reativarResult as any).sucesso, true)

  servicosService.listar = originalListar
  servicosService.buscarPorId = originalBuscarPorId
  servicosService.criar = originalCriar
  servicosService.atualizar = originalAtualizar
  servicosService.desativar = originalDesativar
  servicosService.reativar = originalReativar
})

test('servicos service rejects duplicate names', async () => {
  const originalBuscarPorNome = servicosRepository.buscarPorNome
  const originalCriar = servicosRepository.criar

  servicosRepository.buscarPorNome = async () => ({ id: 4, nome: 'Diagnóstico' }) as any
  await assert.rejects(
    () => servicosService.criar({ nome: 'Diagnóstico' } as any),
    (error: unknown) => {
      assert.equal(error?.constructor?.name, 'ConflitoError')
      return true
    },
  )

  servicosRepository.buscarPorNome = async () => null
  servicosRepository.criar = async (dados: any) => ({ id: 99, ...dados }) as any
  const created = await servicosService.criar({ nome: 'Novo serviço' } as any)
  assert.equal(created.id, 99)

  servicosRepository.buscarPorNome = originalBuscarPorNome
  servicosRepository.criar = originalCriar
})
