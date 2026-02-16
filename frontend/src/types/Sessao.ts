export type SessaoStatus = 'Pendente' | 'Confirmada' | 'Concluida' | 'Cancelada'

export type Sessao = {
  id: number
  pacienteId: number
  pacienteNome: string
  dataInicio: string
  duracaoMinutos: number
  terapia: string
  status: SessaoStatus
  observacoes?: string | null
}

export type CreateSessaoDto = {
  pacienteId: number
  dataInicio: string
  duracaoMinutos: number
  terapia: string
  status: SessaoStatus
  observacoes?: string
}
