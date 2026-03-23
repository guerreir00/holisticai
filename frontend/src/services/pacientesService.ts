import api from "./api";
import type { Paciente } from "../types/Paciente";

export type PacienteCreateDto = {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  observacoes?: string | null;
  dataNascimento?: string | null; // yyyy-mm-dd
  terapia?: string | null;
  status?: "Ativo" | "Aguardando" | "Inativo";
};

export async function listarPacientes() {
  const res = await api.get<Paciente[]>("/Pacientes");
  return res.data;
}

export async function criarPaciente(payload: PacienteCreateDto) {
  const res = await api.post<Paciente>("/Pacientes", payload);
  return res.data;
}