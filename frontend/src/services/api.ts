import axios from "axios";
import { clearAuth } from "../auth/authStore";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5109/";

const api = axios.create({
  baseURL, 
});

// Interceptor: adiciona Bearer automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("holisticai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ novo: se der 401, desloga e manda pro /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

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