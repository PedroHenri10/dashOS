import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'node:crypto'

const PREFIX = 'enc:v1:'

function getKey() {
  const secret = process.env.DATA_ENCRYPTION_KEY
  if (!secret) throw new Error('DATA_ENCRYPTION_KEY não configurada')
  return createHash('sha256').update(secret).digest()
}

export function criptografarCampo(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export function descriptografarCampo(value: string) {
  if (!value.startsWith(PREFIX)) return value
  const [ivEncoded, tagEncoded, encryptedEncoded] = value.slice(PREFIX.length).split(':')
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivEncoded, 'base64'))
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

/**
 * Gera um hash cego determinístico (HMAC-SHA256) de um identificador (ex: CPF/CNPJ normalizado)
 * para viabilizar buscas exatas O(1) e índices únicos sem expor o dado em texto claro.
 */
export function gerarHashBusca(value: string): string {
  const limpo = value.replace(/\D/g, '').trim().toLowerCase()
  const secret = process.env.DATA_ENCRYPTION_KEY || 'dashos-blind-index-default-key-32'
  const hmacKey = createHash('sha256').update(`${secret}:blind-index`).digest()
  return createHmac('sha256', hmacKey).update(limpo).digest('hex')
}