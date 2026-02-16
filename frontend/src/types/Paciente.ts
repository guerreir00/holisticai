export type Paciente = {
  id: number
  nome: string
  email: string
  telefone: string
  dataNascimento?: string | null
  observacoes: string
  dataCadastro: string
}
