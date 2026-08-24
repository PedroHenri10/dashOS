import { ErrorDefinition, ErrorCode, ERROR_CODES } from '../../erros/errorCodes'

export class AppError extends Error {
  constructor(public readonly errorCode: ErrorDefinition) {
    super(errorCode.message)
    this.name = 'AppError'
  }

  get statusCode() {
    return this.errorCode.status
  }

  get code() {
    return this.errorCode.code
  }

  get mensagem() {
    return this.errorCode.message
  }
}

export class NaoEncontradoError extends AppError {
  constructor(errorCode: ErrorDefinition = ERROR_CODES.REGISTRO_NAO_ENCONTRADO) {
    super(errorCode)
  }
}

export class NaoAutorizadoError extends AppError {
  constructor(errorCode: ErrorDefinition = ERROR_CODES.NAO_AUTORIZADO) {
    super(errorCode)
  }
}

export class ProibidoError extends AppError {
  constructor(errorCode: ErrorDefinition = ERROR_CODES.SEM_PERMISSAO) {
    super(errorCode)
  }
}

export class ConflitoError extends AppError {
  constructor(errorCode: ErrorDefinition = ERROR_CODES.REGISTRO_JA_EXISTE) {
    super(errorCode)
  }
}

export class TokenInvalidoError extends AppError {
  constructor(errorCode: ErrorDefinition = ERROR_CODES.TOKEN_INVALIDO) {
    super(errorCode)
  }
}
