import { api } from './api'
import type { CreateSessaoDto, Sessao } from '../types/Sessao'

function toIsoDateOnly(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function getSessoesByDate(date: Date): Promise<Sessao[]> {
  const iso = toIsoDateOnly(date)
  const res = await api.get<Sessao[]>('/Sessoes', { params: { data: iso } })
  return res.data
}

export async function createSessao(dto: CreateSessaoDto): Promise<Sessao> {
  const res = await api.post<Sessao>('/Sessoes', dto)
  return res.data
}
