import api from "./api";

export type GerarProntuarioIaRequest = {
  nomePaciente: string;
  terapia: string;
  duracao: number;
  relato: string;
  estadoEnergetico: string;
};

export type GerarProntuarioIaResponse = {
  conteudo: string;
};

export async function gerarProntuarioIaReal(payload: GerarProntuarioIaRequest) {
  const res = await api.post<GerarProntuarioIaResponse>("/api/IA/prontuario", payload);
  return res.data;
}