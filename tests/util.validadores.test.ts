import assert from 'node:assert/strict'
import test from 'node:test'
import {
  limparDocumento,
  validarCPF,
  validarCNPJ,
  validarMEI,
  validarCpfCnpj,
  mascararCPF,
  mascararCNPJ,
  mascararDocumento,
} from '../src/util'

test('limparDocumento should strip non-digits and handle empty inputs', () => {
  assert.equal(limparDocumento('123.456.789-10'), '12345678910')
  assert.equal(limparDocumento('12.345.678/0001-90'), '12345678000190')
  assert.equal(limparDocumento(''), '')
  assert.equal(limparDocumento(null as any), '')
  assert.equal(limparDocumento(undefined as any), '')
})

test('validarCPF accepts valid CPFs with and without formatting', () => {
  // Known valid CPFs generated with official check digits
  const validos = [
    '52998224725',
    '529.982.247-25',
    '11144477735',
    '111.444.777-35',
    '83461245038',
    '834.612.450-38',
    '12345678909',
    '123.456.789-09',
  ]

  for (const cpf of validos) {
    assert.equal(validarCPF(cpf), true, `Deveria aceitar CPF válido: ${cpf}`)
  }
})

test('validarCPF rejects repeated sequence CPFs', () => {
  const repetidos = [
    '000.000.000-00',
    '111.111.111-11',
    '222.222.222-22',
    '333.333.333-33',
    '444.444.444-44',
    '555.555.555-55',
    '666.666.666-66',
    '777.777.777-77',
    '888.888.888-88',
    '999.999.999-99',
  ]

  for (const cpf of repetidos) {
    assert.equal(validarCPF(cpf), false, `Deveria rejeitar sequência repetida: ${cpf}`)
  }
})

test('validarCPF rejects invalid check digits, bad length and malformed input', () => {
  assert.equal(validarCPF('12345678900'), false)
  assert.equal(validarCPF('52998224724'), false) // Last digit incorrect (should be 5)
  assert.equal(validarCPF('12345'), false)
  assert.equal(validarCPF('123456789012'), false)
  assert.equal(validarCPF('abcdefghijk'), false)
  assert.equal(validarCPF(''), false)
  assert.equal(validarCPF(null as any), false)
})

test('validarCNPJ accepts valid CNPJs with and without formatting', () => {
  const validos = [
    '11222333000181',
    '11.222.333/0001-81',
    '00000000000191',
    '00.000.000/0001-91',
    '33000167000101',
    '33.000.167/0001-01',
  ]

  for (const cnpj of validos) {
    assert.equal(validarCNPJ(cnpj), true, `Deveria aceitar CNPJ válido: ${cnpj}`)
  }
})

test('validarCNPJ rejects repeated sequence CNPJs', () => {
  const repetidos = [
    '00000000000000',
    '11.111.111/1111-11',
    '22222222222222',
    '33333333333333',
    '44444444444444',
  ]

  for (const cnpj of repetidos) {
    assert.equal(validarCNPJ(cnpj), false, `Deveria rejeitar sequência repetida de CNPJ: ${cnpj}`)
  }
})

test('validarCNPJ rejects invalid check digits, bad length and malformed input', () => {
  assert.equal(validarCNPJ('11222333000182'), false) // Bad check digit
  assert.equal(validarCNPJ('12345'), false)
  assert.equal(validarCNPJ('1122233300018199'), false) // Too long
  assert.equal(validarCNPJ(''), false)
  assert.equal(validarCNPJ(null as any), false)
})

test('validarMEI validates CNPJ and checks framework/enquadramento', () => {
  const cnpjValido = '11.222.333/0001-81'

  // Valid MEI without context or with valid context
  assert.equal(validarMEI(cnpjValido), true)
  assert.equal(validarMEI(cnpjValido, { tipo: 'MEI' }), true)
  assert.equal(validarMEI(cnpjValido, { tipo: 'PJ' }), true)
  assert.equal(validarMEI(cnpjValido, { enquadramento: 'MEI' }), true)
  assert.equal(validarMEI(cnpjValido, { enquadramento: 'SIMEI' }), true)

  // Invalid CNPJ cannot be MEI
  assert.equal(validarMEI('11111111111111'), false)
  assert.equal(validarMEI('12345678901'), false)

  // Incompatible types or invalid enquadramento
  assert.equal(validarMEI(cnpjValido, { tipo: 'PF' }), false)
  assert.equal(validarMEI(cnpjValido, { enquadramento: 'LTDA_INVALIDA' }), false)
})

test('validarCpfCnpj validates according to type parameter or document length', () => {
  const cpfValido = '529.982.247-25'
  const cnpjValido = '11.222.333/0001-81'

  assert.equal(validarCpfCnpj(cpfValido, 'PF'), true)
  assert.equal(validarCpfCnpj(cpfValido, 'PJ'), false)
  assert.equal(validarCpfCnpj(cnpjValido, 'PJ'), true)
  assert.equal(validarCpfCnpj(cnpjValido, 'PF'), false)
  assert.equal(validarCpfCnpj(cnpjValido, 'MEI'), true)

  // Auto-detection by document length
  assert.equal(validarCpfCnpj(cpfValido), true)
  assert.equal(validarCpfCnpj(cnpjValido), true)
  assert.equal(validarCpfCnpj('123'), false)
})

test('masking functions anonymize sensitive digits in accordance with LGPD', () => {
  assert.equal(mascararCPF('52998224725'), '529.***.***-25')
  assert.equal(mascararCPF('529.982.247-25'), '529.***.***-25')

  assert.equal(mascararCNPJ('11222333000181'), '11.***.***/0001-81')
  assert.equal(mascararCNPJ('11.222.333/0001-81'), '11.***.***/0001-81')

  assert.equal(mascararDocumento('52998224725'), '529.***.***-25')
  assert.equal(mascararDocumento('11222333000181'), '11.***.***/0001-81')
  assert.equal(mascararDocumento(''), '')
  assert.equal(mascararDocumento(null as any), '')
})
