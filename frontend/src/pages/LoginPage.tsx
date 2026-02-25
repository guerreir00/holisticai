import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { setAuth } from "../auth/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);
      setAuth(data.token, data.user);
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Entrar</h1>

      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@teste.com" />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" />
        </div>

        {error && <p style={{ marginTop: 12 }}>{String(error)}</p>}

        <button style={{ marginTop: 16 }} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}