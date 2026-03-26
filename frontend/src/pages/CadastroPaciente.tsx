import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarPaciente,
  buscarPacientePorId,
  type PacienteUpdateDto,
} from "../services/pacientesService";
import {
  buscarCadastroPaciente,
  salvarCadastroPaciente,
} from "../services/cadastroPacienteService";
import "./PacienteNovo.css";

type CadastroPacienteForm = PacienteUpdateDto & {
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

export default function CadastroPacientePage() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<CadastroPacienteForm>({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    terapia: "",
    status: "Ativo",
    observacoes: "",

    cpf: "",
    endereco: "",
    estadoCivil: "",
    religiao: "",
    profissao: "",
    veioAtravesDe: "",
    dataInicioTratamento: "",

    motivoPrincipal: "",
    familiaDeOrigem: "",
    rotinaAtual: "",
    saudeMedicacao: "",
  });

  useEffect(() => {
    carregarTudo();
  }, [pacienteId]);

  async function carregarTudo() {
    setLoading(true);
    setErr(null);

    try {
      const [paciente, cadastro] = await Promise.all([
        buscarPacientePorId(pacienteId),
        buscarCadastroPaciente(pacienteId),
      ]);

      setForm({
        nome: paciente.nome ?? "",
        email: paciente.email ?? "",
        telefone: paciente.telefone ?? "",
        dataNascimento: paciente.dataNascimento?.slice(0, 10) ?? "",
        terapia: paciente.terapia ?? "",
        status: (paciente.status as any) ?? "Ativo",
        observacoes: paciente.observacoes ?? "",

        cpf: cadastro?.cpf ?? "",
        endereco: cadastro?.endereco ?? "",
        estadoCivil: cadastro?.estadoCivil ?? "",
        religiao: cadastro?.religiao ?? "",
        profissao: cadastro?.profissao ?? "",
        veioAtravesDe: cadastro?.veioAtravesDe ?? "",
        dataInicioTratamento: cadastro?.dataInicioTratamento?.slice(0, 10) ?? "",

        motivoPrincipal: cadastro?.motivoPrincipal ?? "",
        familiaDeOrigem: cadastro?.familiaOrigem ?? "",
        rotinaAtual: cadastro?.rotinaAtual ?? "",
        saudeMedicacao: cadastro?.saudeMedicacao ?? "",
      });
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? "Erro ao carregar paciente.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErr(null);

    if (!form.nome?.trim()) {
      setErr("Nome completo é obrigatório.");
      return;
    }

    setSaving(true);

    try {
      const payloadPaciente: PacienteUpdateDto = {
        nome: form.nome.trim(),
        email: form.email?.trim() || null,
        telefone: form.telefone?.trim() || null,
        dataNascimento: form.dataNascimento
          ? new Date(`${form.dataNascimento}T12:00:00`).toISOString()
          : null,
        terapia: form.terapia?.trim() || null,
        status: form.status || "Ativo",
        observacoes: form.observacoes?.trim() || null,
      };

      await atualizarPaciente(pacienteId, payloadPaciente);

      const payloadCadastro = {
        cpf: form.cpf?.trim() || null,
        endereco: form.endereco?.trim() || null,
        estadoCivil: form.estadoCivil?.trim() || null,
        religiao: form.religiao?.trim() || null,
        profissao: form.profissao?.trim() || null,
        veioAtravesDe: form.veioAtravesDe?.trim() || null,
        dataInicioTratamento: form.dataInicioTratamento
          ? new Date(`${form.dataInicioTratamento}T12:00:00`).toISOString()
          : null,
        motivoPrincipal: form.motivoPrincipal?.trim() || null,
        familiaOrigem: form.familiaDeOrigem?.trim() || null,
        rotinaAtual: form.rotinaAtual?.trim() || null,
        saudeMedicacao: form.saudeMedicacao?.trim() || null,
      };

      await salvarCadastroPaciente(pacienteId, payloadCadastro);

      nav("/pacientes");
    } catch (e: any) {
      setErr(e?.response?.data ?? e?.message ?? "Erro ao salvar paciente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="pn-wrap">Carregando...</div>;
  }

  return (
    <div className="pn-wrap">
      <div className="pn-top">
        <div>
          <h1 className="pn-title">Editar Paciente</h1>
          <p className="pn-sub">Atualize os dados pessoais e a anamnese do paciente</p>
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
          <div className="pn-cardDesc">Edite as informações pessoais e clínicas já registradas</div>
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
                setForm((s) => ({ ...s, dataNascimento: e.target.value }))
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

        <label className="pn-label pn-max420">
          Data de Início do Tratamento
          <input
            className="pn-input"
            type="date"
            value={form.dataInicioTratamento ?? ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, dataInicioTratamento: e.target.value }))
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
            placeholder="Por que o paciente buscou atendimento?"
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
            placeholder="Descreva o dia a dia, hábitos e atividades..."
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
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}