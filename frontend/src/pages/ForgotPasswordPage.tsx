import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/forgotPasswordService";
import logo from "../assets/clinimind-logo.jpeg";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devResetLink, setDevResetLink] = useState("");

  function validarEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setDevResetLink("");

    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }

    if (!validarEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    try {
      setLoading(true);

      const data = await forgotPassword({
        email: email.trim(),
      });

      setSuccess(
        data?.message ||
          "Se existir uma conta com esse e-mail, enviaremos as instruções de recuperação."
      );

      if (data?.resetLink) {
        setDevResetLink(data.resetLink);
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Não foi possível processar sua solicitação agora.";

      setError(String(apiMessage));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-header">
          <img src={logo} alt="CliniMind" className="fp-logo" />
          <h1 className="fp-title">Esqueci minha senha</h1>
          <p className="fp-subtitle">
            Informe seu e-mail para receber as instruções de recuperação de acesso
          </p>
        </div>

        <form className="fp-form" onSubmit={handleSubmit}>
          <div className="fp-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {error && <div className="fp-message fp-error">{error}</div>}
          {success && <div className="fp-message fp-success">{success}</div>}

          {devResetLink && (
            <div className="fp-message fp-dev">
              <strong>Link de redefinição (desenvolvimento):</strong>
              <a href={devResetLink}>{devResetLink}</a>
            </div>
          )}

          <button className="fp-submit" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

        <div className="fp-footer">
          <Link to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}