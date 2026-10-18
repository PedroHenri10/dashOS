import assert from 'node:assert/strict'
import test from 'node:test'
import { criptografarCampo, descriptografarCampo } from '../src/shared/lib/field-encryption'

process.env.DATA_ENCRYPTION_KEY = 'test-encryption-key'

test('field encryption protects and restores sensitive text', () => {
  const original = 'Observação confidencial do cliente'
  const encrypted = criptografarCampo(original)

  assert.notEqual(encrypted, original)
  assert.match(encrypted, /^enc:v1:/)
  assert.equal(descriptografarCampo(encrypted), original)
})

test('field encryption keeps legacy plaintext readable during migration', () => {
  assert.equal(descriptografarCampo('registro antigo'), 'registro antigo')
})

test('gerarHashBusca produces deterministic blind index for CPF/CNPJ regardless of formatting', async () => {
  const { gerarHashBusca } = await import('../src/shared/lib/field-encryption')
  const hash1 = gerarHashBusca('529.982.247-25')
  const hash2 = gerarHashBusca('52998224725')
  const hashOutro = gerarHashBusca('111.444.777-35')

  assert.equal(hash1, hash2)
  assert.notEqual(hash1, hashOutro)
  assert.equal(hash1.length, 64) // SHA-256 hex string length
})

test('cpf encryption uses random IV producing different ciphertexts for same CPF', () => {
  const cpf = '52998224725'
  const c1 = criptografarCampo(cpf)
  const c2 = criptografarCampo(cpf)

  assert.notEqual(c1, c2)
  assert.equal(descriptografarCampo(c1), cpf)
  assert.equal(descriptografarCampo(c2), cpf)
})