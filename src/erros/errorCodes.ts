export enum ErrorDomain {
  AUTH = 'AUTH',
  USER = 'USER',
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  EQUIPMENT = 'EQUIPMENT',
  SYSTEM = 'SYSTEM',
}

export enum ErrorCode {
  USUARIO_NAO_ENCONTRADO = 1001,
  CREDENCIAIS_INVALIDAS = 1002,
  EMAIL_JA_CADASTRADO = 1003,
  CLIENTE_NAO_ENCONTRADO = 1004,
  CLIENTE_CPF_CNPJ_DUPLICADO = 1005,
  DADOS_INVALIDOS = 1006,
  NAO_AUTORIZADO = 1007,
  SEM_PERMISSAO = 1008,
  TOKEN_INVALIDO = 1009,
  REGISTRO_NAO_ENCONTRADO = 1010,
  REGISTRO_JA_EXISTE = 1011,
  ERRO_INTERNO = 1012,
  FORNECEDOR_NAO_ENCONTRADO = 1013,
  FORNECEDOR_CNPJ_DUPLICADO = 1014,
  EQUIPAMENTO_NAO_ENCONTRADO = 1015,
  TIPO_EQUIPAMENTO_NAO_ENCONTRADO = 1016,
  TIPO_EQUIPAMENTO_JA_EXISTE = 1017,
  PERFIL_NAO_ENCONTRADO = 1018,
}

export interface ErrorDefinition {
  status: number
  code: ErrorCode
  message: string
  domain: ErrorDomain
}

export const ERROR_CODES: Record<string, ErrorDefinition> = {
  USUARIO_NAO_ENCONTRADO: { status: 404, code: ErrorCode.USUARIO_NAO_ENCONTRADO, message: 'Usuário não encontrado.', domain: ErrorDomain.USER },
  CREDENCIAIS_INVALIDAS: { status: 401, code: ErrorCode.CREDENCIAIS_INVALIDAS, message: 'Credenciais inválidas.', domain: ErrorDomain.AUTH },
  EMAIL_JA_CADASTRADO: { status: 409, code: ErrorCode.EMAIL_JA_CADASTRADO, message: 'O e-mail informado já está cadastrado.', domain: ErrorDomain.USER },
  CLIENTE_NAO_ENCONTRADO: { status: 404, code: ErrorCode.CLIENTE_NAO_ENCONTRADO, message: 'Cliente não encontrado.', domain: ErrorDomain.CLIENT },
  CLIENTE_CPF_CNPJ_DUPLICADO: { status: 409, code: ErrorCode.CLIENTE_CPF_CNPJ_DUPLICADO, message: 'CPF/CNPJ já cadastrado para outro cliente.', domain: ErrorDomain.CLIENT },
  DADOS_INVALIDOS: { status: 400, code: ErrorCode.DADOS_INVALIDOS, message: 'Dados inválidos.', domain: ErrorDomain.SYSTEM },
  NAO_AUTORIZADO: { status: 401, code: ErrorCode.NAO_AUTORIZADO, message: 'Não autorizado.', domain: ErrorDomain.AUTH },
  SEM_PERMISSAO: { status: 403, code: ErrorCode.SEM_PERMISSAO, message: 'Sem permissão para esta ação.', domain: ErrorDomain.AUTH },
  TOKEN_INVALIDO: { status: 401, code: ErrorCode.TOKEN_INVALIDO, message: 'Token inválido ou expirado.', domain: ErrorDomain.AUTH },
  REGISTRO_NAO_ENCONTRADO: { status: 404, code: ErrorCode.REGISTRO_NAO_ENCONTRADO, message: 'Registro não encontrado.', domain: ErrorDomain.SYSTEM },
  REGISTRO_JA_EXISTE: { status: 409, code: ErrorCode.REGISTRO_JA_EXISTE, message: 'Registro já existe.', domain: ErrorDomain.SYSTEM },
  ERRO_INTERNO: { status: 500, code: ErrorCode.ERRO_INTERNO, message: 'Erro interno do servidor.', domain: ErrorDomain.SYSTEM },
  FORNECEDOR_NAO_ENCONTRADO: { status: 404, code: ErrorCode.FORNECEDOR_NAO_ENCONTRADO, message: 'Fornecedor não encontrado.', domain: ErrorDomain.SUPPLIER },
  FORNECEDOR_CNPJ_DUPLICADO: { status: 409, code: ErrorCode.FORNECEDOR_CNPJ_DUPLICADO, message: 'CNPJ já cadastrado para outro fornecedor.', domain: ErrorDomain.SUPPLIER },
  EQUIPAMENTO_NAO_ENCONTRADO: { status: 404, code: ErrorCode.EQUIPAMENTO_NAO_ENCONTRADO, message: 'Equipamento não encontrado.', domain: ErrorDomain.EQUIPMENT },
  TIPO_EQUIPAMENTO_NAO_ENCONTRADO: { status: 404, code: ErrorCode.TIPO_EQUIPAMENTO_NAO_ENCONTRADO, message: 'Tipo de equipamento não encontrado.', domain: ErrorDomain.EQUIPMENT },
  TIPO_EQUIPAMENTO_JA_EXISTE: { status: 409, code: ErrorCode.TIPO_EQUIPAMENTO_JA_EXISTE, message: 'Já existe um tipo de equipamento com esse nome.', domain: ErrorDomain.EQUIPMENT },
  PERFIL_NAO_ENCONTRADO: { status: 404, code: ErrorCode.PERFIL_NAO_ENCONTRADO, message: 'Perfil não encontrado.', domain: ErrorDomain.USER },
} as const