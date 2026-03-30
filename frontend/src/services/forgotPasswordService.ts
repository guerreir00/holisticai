import api from "./api";

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  novaSenha: string;
  confirmarNovaSenha: string;
};

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await api.post("/api/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await api.post("/api/auth/reset-password", payload);
  return response.data;
}