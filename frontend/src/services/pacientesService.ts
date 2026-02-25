import api from "./api";
import type { Paciente } from "../types/Paciente";

export async function listarPacientes() {
  const { data } = await api.get<Paciente[]>("/api/pacientes");
  return data;
}

export type CriarPacientePayload = Omit<
  Paciente,
  "id" | "dataCadastro" | "tenantId"
>;

export async function criarPaciente(payload: CriarPacientePayload) {
  const { data } = await api.post<Paciente>("/api/pacientes", payload);
  return data;
}