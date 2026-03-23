import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { setAuth } from "../auth/authStore";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(email, password);

      // mantém seu store; "remember" pode virar sessionStorage no futuro
      setAuth(data.token, data.user);
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg-bg">
      <div className="lg-card">
        <div className="lg-top">
          <div className="lg-iconWrap">
            <div className="lg-icon">🧠</div>
          </div>

          <h1 className="lg-title">Terapia Holística IA</h1>
          <p className="lg-subtitle">Sistema Inteligente de Gestão Terapêutica</p>

          <div className="lg-badge">⚡ Powered by AI</div>
        </div>

        <div className="lg-social">
          <button className="lg-socialBtn" type="button" disabled>
            <span className="lg-socialIcon">G</span>
            Continuar com Google
          </button>

          <button className="lg-socialBtn" type="button" disabled>
            <span className="lg-socialIcon">f</span>
            Continuar com Facebook
          </button>

          <div className="lg-divider">
            <span />
            <small>OU CONTINUE COM E-MAIL</small>
            <span />
          </div>
        </div>

        <form className="lg-form" onSubmit={onSubmit}>
          <label className="lg-label">E-mail</label>
          <div className="lg-inputWrap">
            <span className="lg-inputIcon">✉</span>
            <input
              className="lg-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <label className="lg-label" style={{ marginTop: 12 }}>
            Senha
          </label>
          <div className="lg-inputWrap">
            <span className="lg-inputIcon">🔒</span>
            <input
              className="lg-input"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="lg-eyeBtn"
              onClick={() => setShowPass((v) => !v)}
              aria-label="Mostrar/ocultar senha"
            >
              👁
            </button>
          </div>

          <div className="lg-row">
            <label className="lg-check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Lembrar-me
            </label>

            <button className="lg-link" type="button" disabled>
              Esqueci a senha
            </button>
          </div>

          {error && <div className="lg-error">{String(error)}</div>}

          <button className="lg-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="lg-demo">
            <strong>Demo:</strong> Clique em qualquer botão para acessar o sistema
          </div>

          <div className="lg-bottom">
            Não tem uma conta? <span className="lg-bottomLink">Criar conta gratuita</span>
          </div>

          <div className="lg-footer">
            © 2026 Terapia Holística IA • Todos os direitos reservados
          </div>
        </form>
      </div>
    </div>
  );
}