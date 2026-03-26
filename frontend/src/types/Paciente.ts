export type Paciente = {
  id: number;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  dataNascimento?: string | null;
  observacoes?: string | null;
  dataCadastro?: string;
  terapia?: string | null;
  status?: string | null;
  ultimaVisita?: string | null;
};