import api from "./api";
import type { Paciente } from '../types/Paciente.ts'

export async function getTotalPacientes() {
  const res = await api.get<Paciente[]>('/api/Pacientes')
  return res.data.length
}
