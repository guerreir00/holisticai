import api from "./api";

export type CadastroPacienteDetalhadoDto = {
  cpf?: string | null;
  endereco?: string | null;
  estadoCivil?: string | null;
  religiao?: string | null;
  profissao?: string | null;
  veioAtravesDe?: string | null;
  dataInicioTratamento?: string | null;
  motivoPrincipal?: string | null;
  familiaOrigem?: string | null;
  rotinaAtual?: string | null;
  saudeMedicacao?: string | null;
};

export async function buscarCadastroPaciente(pacienteId: number) {
  const res = await api.get<CadastroPacienteDetalhadoDto | null>(
    `/api/pacientes/${pacienteId}/cadastro`
  );
  return res.data;
}

export async function salvarCadastroPaciente(
  pacienteId: number,
  payload: CadastroPacienteDetalhadoDto
) {
  const res = await api.post(
    `/api/pacientes/${pacienteId}/cadastro`,
    payload
  );
  return res.data;
}