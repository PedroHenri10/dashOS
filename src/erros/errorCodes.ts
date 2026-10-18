export enum ErrorDomain {
  AUTH = 'AUTH',
  USER = 'USER',
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  EQUIPMENT = 'EQUIPMENT',
  ORDER = 'ORDER',
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
  RELACIONAMENTO_INVALIDO = 1019,
  PERFIL_NAO_PERMITIDO = 1020,
  RATE_LIMIT_EXCEDIDO = 1021,
  ORDEM_SERVICO_NAO_ENCONTRADA = 1022,
  CONFIGURACAO_OS_AUSENTE = 1023,
  EQUIPAMENTO_NAO_PERTENCE_AO_CLIENTE = 1024,
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
  RELACIONAMENTO_INVALIDO: { status: 400, code: ErrorCode.RELACIONAMENTO_INVALIDO, message: 'Relacionamento inválido.', domain: ErrorDomain.SYSTEM },
  PERFIL_NAO_PERMITIDO: { status: 422, code: ErrorCode.PERFIL_NAO_PERMITIDO, message: 'Perfil não permitido.', domain: ErrorDomain.USER },
  RATE_LIMIT_EXCEDIDO: { status: 429, code: ErrorCode.RATE_LIMIT_EXCEDIDO, message: 'Muitas requisições. Tente novamente mais tarde.', domain: ErrorDomain.SYSTEM },
  ORDEM_SERVICO_NAO_ENCONTRADA: { status: 404, code: ErrorCode.ORDEM_SERVICO_NAO_ENCONTRADA, message: 'Ordem de serviço não encontrada.', domain: ErrorDomain.ORDER },
  CONFIGURACAO_OS_AUSENTE: { status: 500, code: ErrorCode.CONFIGURACAO_OS_AUSENTE, message: 'Configuração de tipo/status de OS ausente. Aplique as migrations.', domain: ErrorDomain.ORDER },
  EQUIPAMENTO_NAO_PERTENCE_AO_CLIENTE: { status: 422, code: ErrorCode.EQUIPAMENTO_NAO_PERTENCE_AO_CLIENTE, message: 'O equipamento não pertence ao cliente informado.', domain: ErrorDomain.ORDER },
} as const