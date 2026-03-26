import api from "./api";
import type { CreateSessaoDto, Sessao, UpdateSessaoDto } from "../types/Sessao";

function toIsoDateOnly(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getSessoesByDate(date: Date): Promise<Sessao[]> {
  const iso = toIsoDateOnly(date);
  const res = await api.get<Sessao[]>("/api/Sessoes", { params: { data: iso } });
  return res.data;
}

export async function getSessaoById(id: number): Promise<Sessao> {
  const res = await api.get<Sessao>(`/api/Sessoes/${id}`);
  return res.data;
}

export async function createSessao(dto: CreateSessaoDto): Promise<Sessao> {
  const res = await api.post<Sessao>("/api/Sessoes", dto);
  return res.data;
}

export async function updateSessao(id: number, dto: UpdateSessaoDto): Promise<Sessao> {
  const res = await api.put<Sessao>(`/api/Sessoes/${id}`, dto);
  return res.data;
}

export async function deleteSessao(id: number): Promise<void> {
  await api.delete(`/api/Sessoes/${id}`);
}