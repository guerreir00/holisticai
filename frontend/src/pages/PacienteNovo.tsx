import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarPaciente, type PacienteCreateDto } from "../services/pacientesService";
import api from "../services/api";
import "./PacienteNovo.css";

type PacienteNovoForm = PacienteCreateDto & {
  cpf?: string;
  endereco?: string;
  estadoCivil?: string;
  religiao?: string;
  profissao?: string;
  veioAtravesDe?: string;
  dataInicioTratamento?: string | null;
  motivoPrincipal?: string;
  familiaDeOrigem?: string;
  rotinaAtual?: string;
  saudeMedicacao?: string;
};

export default function PacienteNovoPage() {
  const nav = useNavigate();

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<PacienteNovoForm>({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: null,
    terapia: "",
    status: "Ativo",
    observacoes: "",

    cpf: "",
    endereco: "",
    estadoCivil: "",
    religiao: "",
    profissao: "",
    veioAtravesDe: "",
    dataInicioTratamento: null,

    motivoPrincipal: "",
    familiaDeOrigem: "",
    rotinaAtual: "",
    saudeMedicacao: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.nome?.trim()) {
      setErr("Nome completo é obrigatório.");
      return;
    }

    setSaving(true);

    try {
      // 1) cria paciente básico
      const created = await criarPaciente({
        nome: form.nome.trim(),
        email: form.email?.trim() || null,
        telefone: form.telefone?.trim() || null,
        dataNascimento: form.dataNascimento || null,
        terapia: form.terapia?.trim() || null,
        status: form.status || "Ativo",
        observacoes: form.observacoes?.trim() || null,
      });

      // 2) salva cadastro detalhado
      await api.post(`/api/pacientes/${created.id}/cadastro`, {
        cpf: form.cpf?.trim() || null,
        endereco: form.endereco?.trim() || null,
        estadoCivil: form.estadoCivil?.trim() || null,
        religiao: form.religiao?.trim() || null,
        profissao: form.profissao?.trim() || null,
        veioAtravesDe: form.veioAtravesDe?.trim() || null,
        dataInicioTratamento: form.dataInicioTratamento || null,
        motivoPrincipal: form.motivoPrincipal?.trim() || null,
        familiaOrigem: form.familiaDeOrigem?.trim() || null,
        rotinaAtual: form.rotinaAtual?.trim() || null,
        saudeMedicacao: form.saudeMedicacao?.trim() || null,
      });

      // 3) volta pra lista com o paciente recém-criado
      nav("/pacientes", {
        replace: true,
        state: { createdPaciente: created },
      });
    } catch (e: any) {
      setErr(e?.response?.data ?? "Erro ao salvar cadastro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pn-wrap">
      <div className="pn-top">
        <div>
          <h1 className="pn-title">Novo Paciente</h1>
          <p className="pn-sub">Preencha as informações completas do paciente</p>
        </div>

        <button
          type="button"
          className="pn-back"
          onClick={() => nav("/pacientes")}
          disabled={saving}
        >
          Voltar à Lista
        </button>
      </div>

      <form onSubmit={onSubmit} className="pn-card">
        <div className="pn-cardHeader">
          <div className="pn-cardTitle">Cadastro Completo do Paciente</div>
          <div className="pn-cardDesc">Informações detalhadas para anamnese holística</div>
        </div>

        <div className="pn-sectionTitle">Dados Pessoais</div>

        <label className="pn-label">
          Nome Completo *
          <input
            className="pn-input"
            value={form.nome}
            onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
            placeholder="Nome completo do paciente"
          />
        </label>

        <div className="pn-grid2">
          <label className="pn-label">
            Data de Nascimento
            <input
              className="pn-input"
              type="date"
              value={form.dataNascimento ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, dataNascimento: e.target.value || null }))
              }
            />
          </label>

          <label className="pn-label">
            CPF
            <input
              className="pn-input"
              value={form.cpf ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, cpf: e.target.value }))}
              placeholder="000.000.000-00"
            />
          </label>
        </div>

        <label className="pn-label">
          Endereço
          <input
            className="pn-input"
            value={form.endereco ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, endereco: e.target.value }))}
            placeholder="Rua, número, bairro, cidade - UF"
          />
        </label>

        <div className="pn-grid2">
          <label className="pn-label">
            Estado Civil
            <input
              className="pn-input"
              value={form.estadoCivil ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, estadoCivil: e.target.value }))}
              placeholder="Ex: Solteiro(a), Casado(a)"
            />
          </label>

          <label className="pn-label">
            Religião
            <input
              className="pn-input"
              value={form.religiao ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, religiao: e.target.value }))}
              placeholder="Religião ou crença espiritual"
            />
          </label>
        </div>

        <div className="pn-grid2">
          <label className="pn-label">
            Profissão
            <input
              className="pn-input"
              value={form.profissao ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, profissao: e.target.value }))}
              placeholder="Área de atuação profissional"
            />
          </label>

          <label className="pn-label">
            Veio através de
            <input
              className="pn-input"
              value={form.veioAtravesDe ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, veioAtravesDe: e.target.value }))}
              placeholder="Indicação, rede social, busca, etc."
            />
          </label>
        </div>

        <div className="pn-grid2">
          <label className="pn-label">
            E-mail
            <input
              className="pn-input"
              value={form.email ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
          </label>

          <label className="pn-label">
            Telefone
            <input
              className="pn-input"
              value={form.telefone ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, telefone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </label>
        </div>

        <div className="pn-grid2">
          <label className="pn-label">
            Terapia
            <input
              className="pn-input"
              value={form.terapia ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, terapia: e.target.value }))}
              placeholder="Ex: Reiki"
            />
          </label>

          <label className="pn-label">
            Status
            <select
              className="pn-input"
              value={form.status ?? "Ativo"}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}
            >
              <option value="Ativo">Ativo</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Inativo">Inativo</option>
            </select>
          </label>
        </div>

        <label className="pn-label" style={{ maxWidth: 420 }}>
          Data de Início do Tratamento
          <input
            className="pn-input"
            type="date"
            value={form.dataInicioTratamento ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, dataInicioTratamento: e.target.value || null }))
            }
          />
        </label>

        <label className="pn-label">
          Observações
          <textarea
            className="pn-textarea"
            rows={4}
            value={form.observacoes ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
            placeholder="Condições, histórico, pontos importantes..."
          />
        </label>

        <div className="pn-sectionTitle">Anamnese</div>

        <label className="pn-label">
          Motivo Principal
          <textarea
            className="pn-textarea"
            rows={3}
            value={form.motivoPrincipal ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, motivoPrincipal: e.target.value }))}
            placeholder="Por que o paciente buscou a terapia holística?"
          />
        </label>

        <label className="pn-label">
          Família de Origem
          <textarea
            className="pn-textarea"
            rows={3}
            value={form.familiaDeOrigem ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, familiaDeOrigem: e.target.value }))}
            placeholder="Dinâmica familiar, relacionamento com pais e irmãos..."
          />
        </label>

        <label className="pn-label">
          Rotina Atual
          <textarea
            className="pn-textarea"
            rows={3}
            value={form.rotinaAtual ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, rotinaAtual: e.target.value }))}
            placeholder="Descreva o dia a dia, hábitos, atividades..."
          />
        </label>

        <label className="pn-label">
          Saúde / Medicação
          <textarea
            className="pn-textarea"
            rows={3}
            value={form.saudeMedicacao ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, saudeMedicacao: e.target.value }))}
            placeholder="Condições de saúde, medicamentos em uso, alergias..."
          />
        </label>

        {err && <div className="pn-error">{String(err)}</div>}

        <div className="pn-actions">
          <button
            type="button"
            className="pn-outline"
            onClick={() => nav("/pacientes")}
            disabled={saving}
          >
            Cancelar
          </button>

          <button type="submit" className="pn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Cadastro"}
          </button>
        </div>
      </form>
    </div>
  );
}