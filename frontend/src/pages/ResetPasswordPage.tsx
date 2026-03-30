import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/forgotPasswordService";
import logo from "../assets/clinimind-logo.jpeg";
import "./ResetPasswordPage.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Token de redefinição inválido ou ausente.");
      return;
    }

    if (!novaSenha.trim()) {
      setError("Informe a nova senha.");
      return;
    }

    if (novaSenha.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (!confirmarNovaSenha.trim()) {
      setError("Confirme a nova senha.");
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const data = await resetPassword({
        token,
        novaSenha,
        confirmarNovaSenha,
      });

      setSuccess(data?.message || "Senha redefinida com sucesso.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Não foi possível redefinir sua senha.";

      setError(String(apiMessage));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-header">
          <img src={logo} alt="CliniMind" className="rp-logo" />
          <h1 className="rp-title">Redefinir senha</h1>
          <p className="rp-subtitle">
            Escolha uma nova senha para acessar sua conta
          </p>
        </div>

        <form className="rp-form" onSubmit={handleSubmit}>
          <div className="rp-group">
            <label htmlFor="novaSenha">Nova senha</label>
            <div className="rp-password-wrap">
              <input
                id="novaSenha"
                type={showNovaSenha ? "text" : "password"}
                placeholder="••••••••"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rp-eye-btn"
                onClick={() => setShowNovaSenha((prev) => !prev)}
              >
                {showNovaSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="rp-group">
            <label htmlFor="confirmarNovaSenha">Confirmar nova senha</label>
            <div className="rp-password-wrap">
              <input
                id="confirmarNovaSenha"
                type={showConfirmarNovaSenha ? "text" : "password"}
                placeholder="••••••••"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="rp-eye-btn"
                onClick={() => setShowConfirmarNovaSenha((prev) => !prev)}
              >
                {showConfirmarNovaSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && <div className="rp-message rp-error">{error}</div>}
          {success && <div className="rp-message rp-success">{success}</div>}

          <button className="rp-submit" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>

        <div className="rp-footer">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}