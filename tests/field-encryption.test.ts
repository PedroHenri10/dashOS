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