import api from "./api";

export type GerarProntuarioIaRequest = {
  dataSessao: string;
  terapiaAplicada?: string | null;
  duracaoMinutos?: number | null;
  relatoInicial?: string | null;
  situacaoEnergetica?: string | null;
  chakraBase?: number | null;
  chakraSacral?: number | null;
  chakraPlexo?: number | null;
  chakraCardiaco?: number | null;
  chakraLaringeo?: number | null;
  chakraFrontal?: number | null;
  chakraCoronario?: number | null;
  trabalho?: string | null;
  familia?: string | null;
  prosperidade?: string | null;
  espiritualidade?: string | null;
  relacoesAfetivas?: string | null;
  tratamentoExecutado?: string | null;
  orientacaoParaCasa?: string | null;
  observacoesSessao?: string | null;
};

export type GerarProntuarioIaResponse = {
  tituloSugerido: string;
  conteudoGerado: string;
  modeloIa: string;
};

export type SaveProntuarioRequest = {
  titulo?: string | null;
  conteudoFinal: string;
  conteudoGeradoIa?: string | null;
  geradoPorIa: boolean;
  modeloIa?: string | null;
  dataSessao: string;
  terapiaAplicada?: string | null;
  duracaoMinutos?: number | null;
  observacoesSessao?: string | null;
  relatoInicial?: string | null;
  situacaoEnergetica?: string | null;
  chakraBase?: number | null;
  chakraSacral?: number | null;
  chakraPlexo?: number | null;
  chakraCardiaco?: number | null;
  chakraLaringeo?: number | null;
  chakraFrontal?: number | null;
  chakraCoronario?: number | null;
  trabalho?: string | null;
  familia?: string | null;
  prosperidade?: string | null;
  espiritualidade?: string | null;
  relacoesAfetivas?: string | null;
  tratamentoExecutado?: string | null;
  orientacaoParaCasa?: string | null;
};

export type ProntuarioItem = {
  id: number;
  pacienteId: number;
  titulo?: string | null;
  conteudoFinal: string;
  conteudoGeradoIa?: string | null;
  tipo: string;
  geradoPorIa: boolean;
  modeloIa?: string | null;
  dataSessao: string;
  terapiaAplicada?: string | null;
  duracaoMinutos?: number | null;
  observacoesSessao?: string | null;
  relatoInicial?: string | null;
  situacaoEnergetica?: string | null;
  chakraBase?: number | null;
  chakraSacral?: number | null;
  chakraPlexo?: number | null;
  chakraCardiaco?: number | null;
  chakraLaringeo?: number | null;
  chakraFrontal?: number | null;
  chakraCoronario?: number | null;
  trabalho?: string | null;
  familia?: string | null;
  prosperidade?: string | null;
  espiritualidade?: string | null;
  relacoesAfetivas?: string | null;
  tratamentoExecutado?: string | null;
  orientacaoParaCasa?: string | null;
  dataCadastro: string;
  dataAtualizacao?: string | null;
  criadoPorUserId: number;
  criadoPorNome?: string | null;
};

export async function gerarProntuarioIa(
  pacienteId: number,
  payload: GerarProntuarioIaRequest
) {
  const res = await api.post<GerarProntuarioIaResponse>(
    `/api/pacientes/${pacienteId}/prontuario/gerar`,
    payload
  );
  return res.data;
}

export async function salvarProntuario(
  pacienteId: number,
  payload: SaveProntuarioRequest
) {
  const res = await api.post<ProntuarioItem>(
    `/api/pacientes/${pacienteId}/prontuario`,
    payload
  );
  return res.data;
}

export async function listarProntuarios(pacienteId: number) {
  const res = await api.get<ProntuarioItem[]>(
    `/api/pacientes/${pacienteId}/prontuario`
  );
  return res.data;
}

export async function buscarProntuario(pacienteId: number, prontuarioId: number) {
  const res = await api.get<ProntuarioItem>(
    `/api/pacientes/${pacienteId}/prontuario/${prontuarioId}`
  );
  return res.data;
}