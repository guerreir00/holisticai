import api from "./api";

export type RegisterTherapistPayload = {
  nomeCompleto: string;
  emailProfissional: string;
  senha: string;
  confirmarSenha: string;
  especialidade: string;
  registroProfissional?: string | null;
  aceitouTermos: boolean;
};

export async function registerTherapist(payload: RegisterTherapistPayload) {
  const response = await api.post("/api/auth/register-therapist", payload);
  return response.data;
}