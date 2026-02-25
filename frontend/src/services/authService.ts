import api from "./api";

export type AuthUser = {
  id: number;
  nome: string;
  email: string;
  role: string;
  tenantId: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return data;
}

export async function register(payload: {
  tenantNome: string;
  nome: string;
  email: string;
  password: string;
}) {
  const { data } = await api.post("/api/auth/register", payload);
  return data as LoginResponse & { tenant: { id: string; nome: string } };
}