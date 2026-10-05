import assert from 'node:assert/strict'
import test from 'node:test'
import app from '../src/app'

test('CORS allows configured development origins and rejects unlisted origins', async () => {
  const allowed = await app.inject({
    method: 'OPTIONS',
    url: '/auth/login',
    headers: {
      origin: 'http://localhost:3000',
      'access-control-request-method': 'POST',
    },
  })

  assert.equal(allowed.statusCode, 204)
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:3000')

  const denied = await app.inject({
    method: 'OPTIONS',
    url: '/auth/login',
    headers: {
      origin: 'https://untrusted.example',
      'access-control-request-method': 'POST',
    },
  })

  assert.equal(denied.headers['access-control-allow-origin'], undefined)
})

test.after(async () => {
  await app.close()
})