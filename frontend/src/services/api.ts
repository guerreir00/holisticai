import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5109";

const api = axios.create({
  baseURL, // ✅ sem /api
});

// Interceptor: adiciona Bearer automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("holisticai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// (opcional) Normaliza erro pra UI
export function getApiErrorMessage(err: any): string {
  return (
    err?.response?.data?.message ??
    err?.response?.data ??
    err?.message ??
    "Erro inesperado."
  );
}

export default api;