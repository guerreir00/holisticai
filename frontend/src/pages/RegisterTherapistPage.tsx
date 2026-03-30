import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerTherapist } from "../services/registerTherapistService";
import { setAuth } from "../auth/authStore";
import logo from "../assets/clinimind-logo.jpeg";
import "./RegisterTherapistPage.css";

type Step = 1 | 2;

type FormData = {
  nomeCompleto: string;
  emailProfissional: string;
  senha: string;
  confirmarSenha: string;
  especialidade: string;
  registroProfissional: string;
  aceitouTermos: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>> & {
  geral?: string;
};

const especialidades = [
  "Psicologia",
  "Psicanálise",
  "Terapia Holística",
  "Terapia Integrativa",
  "Constelação Familiar",
  "Reiki",
  "Acupuntura",
  "Auriculoterapia",
  "Naturopatia",
  "Coach Terapêutico",
  "Outro",
];

export default function RegisterTherapistPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    nomeCompleto: "",
    emailProfissional: "",
    senha: "",
    confirmarSenha: "",
    especialidade: "",
    registroProfissional: "",
    aceitouTermos: false,
  });

  const emailValido = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailProfissional.trim());
  }, [form.emailProfissional]);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      geral: "",
    }));
  }

  function validateStep1() {
    const newErrors: FormErrors = {};

    if (!form.nomeCompleto.trim()) {
      newErrors.nomeCompleto = "Informe seu nome completo.";
    }

    if (!form.emailProfissional.trim()) {
      newErrors.emailProfissional = "Informe seu e-mail profissional.";
    } else if (!emailValido) {
      newErrors.emailProfissional = "Informe um e-mail válido.";
    }

    if (!form.senha.trim()) {
      newErrors.senha = "Informe uma senha.";
    } else if (form.senha.length < 6) {
      newErrors.senha = "A senha deve ter no mínimo 6 caracteres.";
    }

    if (!form.confirmarSenha.trim()) {
      newErrors.confirmarSenha = "Confirme sua senha.";
    } else if (form.confirmarSenha !== form.senha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
    }

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
      geral: "",
    }));

    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    const newErrors: FormErrors = {};

    if (!form.especialidade.trim()) {
      newErrors.especialidade = "Selecione sua especialidade.";
    }

    if (!form.aceitouTermos) {
      newErrors.aceitouTermos = "Você precisa aceitar os termos para continuar.";
    }

    setErrors((prev) => ({
      ...prev,
      ...newErrors,
      geral: "",
    }));

    return Object.keys(newErrors).length === 0;
  }

  function handleNextStep() {
    if (!validateStep1()) return;
    setStep(2);
  }

  function handleBackStep() {
    setStep(1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep2()) return;

    try {
      setLoading(true);
      setErrors({});

      const data = await registerTherapist({
        nomeCompleto: form.nomeCompleto.trim(),
        emailProfissional: form.emailProfissional.trim(),
        senha: form.senha,
        confirmarSenha: form.confirmarSenha,
        especialidade: form.especialidade,
        registroProfissional: form.registroProfissional.trim() || null,
        aceitouTermos: form.aceitouTermos,
      });

      setAuth(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.response?.data ||
        error?.message ||
        "Não foi possível criar sua conta agora. Tente novamente.";

      setErrors({
        geral: String(apiMessage),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-therapist-page">
      <div className="register-therapist-card">
        <div className="register-therapist-header">
          <img src={logo} alt="CliniMind" className="register-therapist-logo" />

          <h1 className="register-therapist-title">Criar Conta Profissional</h1>
          <p className="register-therapist-subtitle">
            Junte-se ao CliniMind e transforme sua prática terapêutica
          </p>

          <div className="register-therapist-badge">✨ Grátis por 30 dias</div>
        </div>

        <div className="register-therapist-stepper">
          <div className={`step-item ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
            <div className="step-badge">{step > 1 ? "✓" : "1"}</div>
            <span>Dados Pessoais</span>
          </div>

          <div className="step-line" />

          <div className={`step-item ${step === 2 ? "active" : ""}`}>
            <div className="step-badge">2</div>
            <span>Dados Profissionais</span>
          </div>
        </div>

        <form className="register-therapist-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="register-step-content">
              <div className="form-group">
                <label htmlFor="nomeCompleto">Nome Completo *</label>
                <input
                  id="nomeCompleto"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.nomeCompleto}
                  onChange={(e) => updateField("nomeCompleto", e.target.value)}
                />
                {errors.nomeCompleto && <span className="field-error">{errors.nomeCompleto}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="emailProfissional">E-mail Profissional *</label>
                <input
                  id="emailProfissional"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.emailProfissional}
                  onChange={(e) => updateField("emailProfissional", e.target.value)}
                />
                {errors.emailProfissional && (
                  <span className="field-error">{errors.emailProfissional}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="senha">Senha *</label>
                  <div className="password-input-wrapper">
                    <input
                      id="senha"
                      type={showSenha ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.senha}
                      onChange={(e) => updateField("senha", e.target.value)}
                    />
                    <button
                      type="button"
                      className="toggle-password-button"
                      onClick={() => setShowSenha((prev) => !prev)}
                    >
                      {showSenha ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {errors.senha && <span className="field-error">{errors.senha}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmarSenha">Confirmar Senha *</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirmarSenha"
                      type={showConfirmarSenha ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmarSenha}
                      onChange={(e) => updateField("confirmarSenha", e.target.value)}
                    />
                    <button
                      type="button"
                      className="toggle-password-button"
                      onClick={() => setShowConfirmarSenha((prev) => !prev)}
                    >
                      {showConfirmarSenha ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <span className="field-error">{errors.confirmarSenha}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="register-primary-button"
                onClick={handleNextStep}
              >
                Próximo Passo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="register-step-content">
              <div className="form-group">
                <label htmlFor="especialidade">Especialidade / Área de Atuação *</label>
                <select
                  id="especialidade"
                  value={form.especialidade}
                  onChange={(e) => updateField("especialidade", e.target.value)}
                >
                  <option value="">Selecione sua especialidade</option>
                  {especialidades.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.especialidade && (
                  <span className="field-error">{errors.especialidade}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="registroProfissional">Registro Profissional (Opcional)</label>
                <input
                  id="registroProfissional"
                  type="text"
                  placeholder="Ex.: CRP 12/34567 ou CRTH 1234"
                  value={form.registroProfissional}
                  onChange={(e) => updateField("registroProfissional", e.target.value)}
                />
                <small className="field-help">
                  Informe seu CRP, CRTH, CRMTC ou outro registro profissional, se aplicável
                </small>
              </div>

              <label className={`terms-box ${errors.aceitouTermos ? "has-error" : ""}`}>
                <input
                  type="checkbox"
                  checked={form.aceitouTermos}
                  onChange={(e) => updateField("aceitouTermos", e.target.checked)}
                />
                <span>
                  Eu li e aceito os <a href="#">Termos de Uso</a> e a{" "}
                  <a href="#">Política de Privacidade</a> do CliniMind. Declaro que sou
                  profissional de saúde/terapia devidamente habilitado.
                </span>
              </label>

              {errors.aceitouTermos && (
                <span className="field-error terms-error">{errors.aceitouTermos}</span>
              )}

              <div className="register-actions-row">
                <button
                  type="button"
                  className="register-secondary-button"
                  onClick={handleBackStep}
                  disabled={loading}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="register-primary-button"
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar Conta Grátis"}
                </button>
              </div>
            </div>
          )}

          {errors.geral && <div className="form-message error">{errors.geral}</div>}
        </form>

        <div className="register-benefits-card">
          <h3>✨ Benefícios inclusos:</h3>
          <ul>
            <li>Prontuários automatizados com IA</li>
            <li>Agenda inteligente e lembretes automáticos</li>
            <li>Análise de padrões energéticos dos pacientes</li>
            <li>Geração de documentos profissionais</li>
            <li>Suporte técnico prioritário</li>
          </ul>
        </div>

        <div className="register-footer">
          <span>Já tem uma conta?</span>
          <Link to="/login">Fazer login</Link>
        </div>
      </div>
    </div>
  );
}