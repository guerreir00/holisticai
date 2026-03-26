import api from "./api";
import type { Paciente } from "../types/Paciente";

export type PacienteCreateDto = {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  observacoes?: string | null;
  dataNascimento?: string | null;
  terapia?: string | null;
  status?: "Ativo" | "Aguardando" | "Inativo";
};


export type PacienteUpdateDto = {
  nome: string;
  email?: string | null;
  telefone?: string | null;
  observacoes?: string | null;
  dataNascimento?: string | null;
  terapia?: string | null;
  status?: "Ativo" | "Aguardando" | "Inativo";
};


export async function listarPacientes() {
  const res = await api.get<Paciente[]>("/api/pacientes");
  return res.data;
}

export async function buscarPacientePorId(id: number) {
  const res = await api.get<Paciente>(`/api/pacientes/${id}`);
  return res.data;
}

export async function criarPaciente(payload: PacienteCreateDto) {
  const res = await api.post<Paciente>("/api/pacientes", payload);
  return res.data;
}

export async function atualizarPaciente(id: number, payload: PacienteUpdateDto) {
  await api.put(`/api/pacientes/${id}`, payload);
}
