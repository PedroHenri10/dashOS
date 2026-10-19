export const TIPO_OS_ORCAMENTO = 'Orçamento'
export const TIPO_OS_SERVICO_AGENDADO = 'Serviço Agendado'
export const STATUS_OS_ABERTA = 'Aberta'

export const FLUXOS_TIPO_OS = {
  [TIPO_OS_ORCAMENTO]: [
    'Aberta',
    'Em Diagnóstico',
    'Aguardando Aprovação',
    'Em Execução',
    'Concluída',
    'Cancelada',
  ],
  [TIPO_OS_SERVICO_AGENDADO]: [
    'Aberta',
    'Aguardando Peças',
    'Em Execução',
    'Concluída',
    'Cancelada',
  ],
} as const
