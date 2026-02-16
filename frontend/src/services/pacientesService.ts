import { api } from './api'
import type { Paciente } from '../types/Paciente.ts'

export async function listarPacientes() {
  const res = await api.get<Paciente[]>('/api/Pacientes')
  return res.data
}

export async function criarPaciente(payload: Omit<Paciente, 'id' | 'dataCadastro'>) {
  const res = await api.post<Paciente>('/api/Pacientes', payload)
  return res.data
}
