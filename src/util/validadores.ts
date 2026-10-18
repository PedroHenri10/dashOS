/**
 * Utilitários de validação e formatação de documentos fiscais e pessoais brasileiros (CPF, CNPJ e MEI).
 * Em conformidade com os algoritmos oficiais da Receita Federal do Brasil.
 */

/**
 * Remove qualquer caractere não numérico da string de documento.
 */
export function limparDocumento(documento: string | null | undefined): string {
  if (!documento) return ''
  return String(documento).replace(/\D/g, '').trim()
}

/**
 * Valida se uma string representa um CPF válido, conferindo:
 * 1. Quantidade exata de 11 dígitos numéricos;
 * 2. Rejeição de sequências com dígitos repetidos (ex.: 111.111.111-11, 00000000000);
 * 3. Cálculo matemático estrito dos dois dígitos verificadores (módulo 11).
 */
export function validarCPF(cpf: string | null | undefined): boolean {
  const limpo = limparDocumento(cpf)

  if (limpo.length !== 11) {
    return false
  }

  // Rejeita sequências de dígitos todos repetidos
  if (/^(\d)\1{10}$/.test(limpo)) {
    return false
  }

  // Primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number(limpo[i]) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) {
    resto = 0
  }
  if (resto !== Number(limpo[9])) {
    return false
  }

  // Segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number(limpo[i]) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) {
    resto = 0
  }
  if (resto !== Number(limpo[10])) {
    return false
  }

  return true
}

/**
 * Valida se uma string representa um CNPJ válido, conferindo:
 * 1. Quantidade exata de 14 dígitos numéricos;
 * 2. Rejeição de sequências com dígitos repetidos (ex.: 00000000000000, 11111111111111);
 * 3. Cálculo matemático estrito dos dois dígitos verificadores com os pesos oficiais da Receita Federal.
 */
export function validarCNPJ(cnpj: string | null | undefined): boolean {
  const limpo = limparDocumento(cnpj)

  if (limpo.length !== 14) {
    return false
  }

  // Rejeita sequências de dígitos todos repetidos
  if (/^(\d)\1{13}$/.test(limpo)) {
    return false
  }

  // Primeiro dígito verificador (pesos: 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
  const pesosPrimeiroDigito = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < 12; i++) {
    soma += Number(limpo[i]) * pesosPrimeiroDigito[i]
  }
  let resto = soma % 11
  const primeiroDigito = resto < 2 ? 0 : 11 - resto
  if (primeiroDigito !== Number(limpo[12])) {
    return false
  }

  // Segundo dígito verificador (pesos: 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
  const pesosSegundoDigito = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  soma = 0
  for (let i = 0; i < 13; i++) {
    soma += Number(limpo[i]) * pesosSegundoDigito[i]
  }
  resto = soma % 11
  const segundoDigito = resto < 2 ? 0 : 11 - resto
  if (segundoDigito !== Number(limpo[13])) {
    return false
  }

  return true
}

/**
 * Validação de MEI (Microempreendedor Individual).
 * Regra de negócio e domínio fiscal:
 * - O MEI é uma modalidade simplificada de Pessoa Jurídica (PJ) que opera com um CNPJ válido de 14 dígitos.
 * - Caso um enquadramento ou tipo seja informado, verifica se o documento informado é um CNPJ válido
 *   e se o enquadramento/tipo corresponde a MEI (ou PJ compatível com MEI).
 */
export function validarMEI(
  documento: string | null | undefined,
  contexto?: { tipo?: string; enquadramento?: string }
): boolean {
  const limpo = limparDocumento(documento)

  // Documento de MEI perante a Receita Federal é obrigatoriamente um CNPJ
  if (!validarCNPJ(limpo)) {
    return false
  }

  // Se um tipo for explicitamente informado, não pode ser incompatível (ex: PF não é MEI)
  if (contexto?.tipo) {
    const tipoNormalizado = contexto.tipo.trim().toUpperCase()
    if (tipoNormalizado !== 'MEI' && tipoNormalizado !== 'PJ') {
      return false
    }
  }

  // Se um enquadramento for explicitamente informado, valida termos aceitos
  if (contexto?.enquadramento) {
    const enq = contexto.enquadramento.trim().toUpperCase()
    const enquadramentosValidos = ['MEI', 'SIMEI', 'MICROEMPREENDEDOR INDIVIDUAL']
    if (!enquadramentosValidos.includes(enq)) {
      return false
    }
  }

  return true
}

/**
 * Validação genérica de CPF ou CNPJ de acordo com o tipo especificado.
 */
export function validarCpfCnpj(documento: string | null | undefined, tipo?: string): boolean {
  if (!documento) return false

  if (tipo) {
    const tipoNormalizado = tipo.trim().toUpperCase()
    if (tipoNormalizado === 'PF' || tipoNormalizado === 'PESSOA FÍSICA') {
      return validarCPF(documento)
    }
    if (tipoNormalizado === 'PJ' || tipoNormalizado === 'PESSOA JURÍDICA') {
      return validarCNPJ(documento)
    }
    if (tipoNormalizado === 'MEI') {
      return validarMEI(documento, { tipo: 'MEI' })
    }
  }

  const limpo = limparDocumento(documento)
  if (limpo.length === 11) {
    return validarCPF(limpo)
  }
  if (limpo.length === 14) {
    return validarCNPJ(limpo)
  }

  return false
}

/**
 * Mascara um CPF preservando os 3 primeiros e os 2 últimos dígitos (ex.: 123.***.***-45),
 * conforme diretrizes da LGPD para anonimização em telas de listagem e logs.
 */
export function mascararCPF(cpf: string | null | undefined): string {
  const limpo = limparDocumento(cpf)
  if (limpo.length !== 11) return cpf ?? ''
  return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9)}`
}

/**
 * Mascara um CNPJ preservando os 2 primeiros dígitos, o sufixo de filial e os dígitos finais
 * (ex.: 12.***.*** / 0001-34).
 */
export function mascararCNPJ(cnpj: string | null | undefined): string {
  const limpo = limparDocumento(cnpj)
  if (limpo.length !== 14) return cnpj ?? ''
  return `${limpo.slice(0, 2)}.***.***/${limpo.slice(8, 12)}-${limpo.slice(12)}`
}

/**
 * Mascara automaticamente qualquer documento brasileiro (CPF ou CNPJ).
 */
export function mascararDocumento(documento: string | null | undefined): string {
  if (!documento) return ''
  const limpo = limparDocumento(documento)
  if (limpo.length === 11) {
    return mascararCPF(limpo)
  }
  if (limpo.length === 14) {
    return mascararCNPJ(limpo)
  }
  return documento
}
