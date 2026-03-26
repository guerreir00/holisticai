import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buscarPacientePorId } from "../services/pacientesService";
import { gerarProntuarioIaReal } from "../services/IAServices";
import {
  buscarProntuario,
  listarProntuarios,
  salvarProntuario,
  type ProntuarioItem,
} from "../services/prontuarioService";
import type { Paciente } from "../types/Paciente";
import "./Prontuarios.css";

type Aba = "novo" | "historico";

type FormState = {
  dataSessao: string;
  terapiaAplicada: string;
  duracaoMinutos: string;
  relatoInicial: string;
  situacaoEnergetica: string;
  chakraBase: string;
  chakraSacral: string;
  chakraPlexo: string;
  chakraCardiaco: string;
  chakraLaringeo: string;
  chakraFrontal: string;
  chakraCoronario: string;
  trabalho: string;
  familia: string;
  prosperidade: string;
  espiritualidade: string;
  relacoesAfetivas: string;
  tratamentoExecutado: string;
  orientacaoParaCasa: string;
  observacoesSessao: string;
  titulo: string;
  conteudoGeradoIa: string;
  conteudoFinal: string;
  modeloIa: string;
  geradoPorIa: boolean;
};

function hojeIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatarDataBR(iso?: string | null) {
  if (!iso) return "--/--/----";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--/--/----";
  return d.toLocaleDateString("pt-BR");
}

function toNullableNumber(value: string) {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export default function ProntuariosPage() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const nav = useNavigate();

  const [aba, setAba] = useState<Aba>("novo");
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [gerandoIa, setGerandoIa] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [historico, setHistorico] = useState<ProntuarioItem[]>([]);
  const [prontuarioSelecionadoId, setProntuarioSelecionadoId] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({
    dataSessao: hojeIsoDate(),
    terapiaAplicada: "",
    duracaoMinutos: "60",
    relatoInicial: "",
    situacaoEnergetica: "",
    chakraBase: "",
    chakraSacral: "",
    chakraPlexo: "",
    chakraCardiaco: "",
    chakraLaringeo: "",
    chakraFrontal: "",
    chakraCoronario: "",
    trabalho: "",
    familia: "",
    prosperidade: "",
    espiritualidade: "",
    relacoesAfetivas: "",
    tratamentoExecutado: "",
    orientacaoParaCasa: "",
    observacoesSessao: "",
    titulo: "",
    conteudoGeradoIa: "",
    conteudoFinal: "",
    modeloIa: "",
    geradoPorIa: false,
  });

  const resumoPaciente = useMemo(() => {
    if (!paciente) return "Carregando paciente...";
    return `${paciente.terapia ?? "Sem terapia"} • ${paciente.status ?? "Sem status"}`;
  }, [paciente]);

  useEffect(() => {
    if (!pacienteId || Number.isNaN(pacienteId)) {
      setErr("Paciente inválido.");
      setLoadingPaciente(false);
      return;
    }

    carregarPaciente();
    carregarHistorico();
  }, [pacienteId]);

  async function carregarPaciente() {
    setLoadingPaciente(true);
    setErr(null);

    try {
      const pacienteEncontrado = await buscarPacientePorId(pacienteId);
      setPaciente(pacienteEncontrado);

      setForm((s) => ({
        ...s,
        terapiaAplicada: s.terapiaAplicada || pacienteEncontrado.terapia || "",
      }));
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? e?.message ?? "Erro ao carregar paciente.");
      setPaciente(null);
    } finally {
      setLoadingPaciente(false);
    }
  }

  async function carregarHistorico() {
    setLoadingHistorico(true);

    try {
      const itens = await listarProntuarios(pacienteId);
      setHistorico(itens);
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? e?.message ?? "Erro ao carregar histórico.");
    } finally {
      setLoadingHistorico(false);
    }
  }

  async function onGerarIa() {
    setErr(null);

    if (!paciente) {
      setErr("Paciente não carregado.");
      return;
    }

    if (!form.dataSessao) {
      setErr("Data da sessão é obrigatória.");
      return;
    }

    if (!form.terapiaAplicada.trim()) {
      setErr("Terapia aplicada é obrigatória.");
      return;
    }

    if (!form.duracaoMinutos.trim() || Number(form.duracaoMinutos) <= 0) {
      setErr("Duração da sessão é obrigatória.");
      return;
    }

    setGerandoIa(true);

    try {
      const result = await gerarProntuarioIaReal({
        nomePaciente: paciente.nome,
        terapia: form.terapiaAplicada,
        duracao: Number(form.duracaoMinutos),
        relato: form.relatoInicial,
        estadoEnergetico: form.situacaoEnergetica,
      });

      const tituloSugerido = `Prontuário - ${paciente.nome} - ${formatarDataBR(
        `${form.dataSessao}T12:00:00`
      )}`;

      setForm((s) => ({
        ...s,
        titulo: s.titulo?.trim() ? s.titulo : tituloSugerido,
        conteudoGeradoIa: result.conteudo ?? "",
        conteudoFinal: result.conteudo ?? "",
        modeloIa: "gpt-4o-mini",
        geradoPorIa: true,
      }));
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? e?.message ?? "Erro ao gerar prontuário com IA.");
    } finally {
      setGerandoIa(false);
    }
  }

  async function onSalvar() {
    setErr(null);

    if (!form.dataSessao) {
      setErr("Data da sessão é obrigatória.");
      return;
    }

    if (!form.conteudoFinal.trim()) {
      setErr("O conteúdo final do prontuário é obrigatório.");
      return;
    }

    setSalvando(true);

    try {
      const saved = await salvarProntuario(pacienteId, {
        titulo: form.titulo || null,
        conteudoFinal: form.conteudoFinal.trim(),
        conteudoGeradoIa: form.conteudoGeradoIa || null,
        geradoPorIa: form.geradoPorIa,
        modeloIa: form.modeloIa || null,
        dataSessao: new Date(`${form.dataSessao}T12:00:00`).toISOString(),
        terapiaAplicada: form.terapiaAplicada || null,
        duracaoMinutos: toNullableNumber(form.duracaoMinutos),
        observacoesSessao: form.observacoesSessao || null,
        relatoInicial: form.relatoInicial || null,
        situacaoEnergetica: form.situacaoEnergetica || null,
        chakraBase: toNullableNumber(form.chakraBase),
        chakraSacral: toNullableNumber(form.chakraSacral),
        chakraPlexo: toNullableNumber(form.chakraPlexo),
        chakraCardiaco: toNullableNumber(form.chakraCardiaco),
        chakraLaringeo: toNullableNumber(form.chakraLaringeo),
        chakraFrontal: toNullableNumber(form.chakraFrontal),
        chakraCoronario: toNullableNumber(form.chakraCoronario),
        trabalho: form.trabalho || null,
        familia: form.familia || null,
        prosperidade: form.prosperidade || null,
        espiritualidade: form.espiritualidade || null,
        relacoesAfetivas: form.relacoesAfetivas || null,
        tratamentoExecutado: form.tratamentoExecutado || null,
        orientacaoParaCasa: form.orientacaoParaCasa || null,
      });

      setHistorico((prev) => [saved, ...prev]);
      setProntuarioSelecionadoId(saved.id);
      setAba("historico");

      setForm({
        dataSessao: hojeIsoDate(),
        terapiaAplicada: paciente?.terapia ?? "",
        duracaoMinutos: "60",
        relatoInicial: "",
        situacaoEnergetica: "",
        chakraBase: "",
        chakraSacral: "",
        chakraPlexo: "",
        chakraCardiaco: "",
        chakraLaringeo: "",
        chakraFrontal: "",
        chakraCoronario: "",
        trabalho: "",
        familia: "",
        prosperidade: "",
        espiritualidade: "",
        relacoesAfetivas: "",
        tratamentoExecutado: "",
        orientacaoParaCasa: "",
        observacoesSessao: "",
        titulo: "",
        conteudoGeradoIa: "",
        conteudoFinal: "",
        modeloIa: "",
        geradoPorIa: false,
      });
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? e?.message ?? "Erro ao salvar prontuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function abrirProntuario(item: ProntuarioItem) {
    try {
      const full = await buscarProntuario(pacienteId, item.id);
      setProntuarioSelecionadoId(full.id);
      setAba("historico");

      setForm({
        dataSessao: full.dataSessao?.slice(0, 10) ?? hojeIsoDate(),
        terapiaAplicada: full.terapiaAplicada ?? "",
        duracaoMinutos: full.duracaoMinutos?.toString() ?? "",
        relatoInicial: full.relatoInicial ?? "",
        situacaoEnergetica: full.situacaoEnergetica ?? "",
        chakraBase: full.chakraBase?.toString() ?? "",
        chakraSacral: full.chakraSacral?.toString() ?? "",
        chakraPlexo: full.chakraPlexo?.toString() ?? "",
        chakraCardiaco: full.chakraCardiaco?.toString() ?? "",
        chakraLaringeo: full.chakraLaringeo?.toString() ?? "",
        chakraFrontal: full.chakraFrontal?.toString() ?? "",
        chakraCoronario: full.chakraCoronario?.toString() ?? "",
        trabalho: full.trabalho ?? "",
        familia: full.familia ?? "",
        prosperidade: full.prosperidade ?? "",
        espiritualidade: full.espiritualidade ?? "",
        relacoesAfetivas: full.relacoesAfetivas ?? "",
        tratamentoExecutado: full.tratamentoExecutado ?? "",
        orientacaoParaCasa: full.orientacaoParaCasa ?? "",
        observacoesSessao: full.observacoesSessao ?? "",
        titulo: full.titulo ?? "",
        conteudoGeradoIa: full.conteudoGeradoIa ?? "",
        conteudoFinal: full.conteudoFinal ?? "",
        modeloIa: full.modeloIa ?? "",
        geradoPorIa: full.geradoPorIa,
      });
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? e?.message ?? "Erro ao abrir prontuário.");
    }
  }

  return (
    <div className="pr-page">
      <div className="pr-head">
        <div>
          <h1 className="pr-title">Prontuários com IA</h1>
          <p className="pr-sub">
            Crie prontuários automaticamente com auxílio de inteligência artificial
          </p>
        </div>

        <div className="pr-headActions">
          <button className="pr-secondary" onClick={() => nav("/pacientes")}>
            Voltar para Pacientes
          </button>
        </div>
      </div>

      <div className="pr-patientCard">
        <div className="pr-avatar">
          {paciente?.nome?.charAt(0).toUpperCase() ?? "P"}
        </div>

        <div className="pr-patientInfo">
          <div className="pr-patientName">
            {loadingPaciente ? "Carregando..." : paciente?.nome ?? "Paciente"}
          </div>
          <div className="pr-patientMeta">{resumoPaciente}</div>
        </div>

        <div className="pr-patientSessions">
          <span>Total de prontuários</span>
          <strong>{historico.length}</strong>
        </div>
      </div>

      <div className="pr-tabs">
        <button
          className={`pr-tab ${aba === "novo" ? "active" : ""}`}
          onClick={() => setAba("novo")}
        >
          Novo Prontuário
        </button>

        <button
          className={`pr-tab ${aba === "historico" ? "active" : ""}`}
          onClick={() => setAba("historico")}
        >
          Histórico
        </button>
      </div>

      {err && <div className="pr-error">{String(err)}</div>}

      {aba === "novo" && (
        <div className="pr-grid">
          <div className="pr-card">
            <h2 className="pr-cardTitle">Nova Sessão</h2>
            <p className="pr-cardSub">
              Preencha os dados da sessão e gere um rascunho de prontuário com IA.
            </p>

            <div className="pr-field">
              <label>Data da Sessão</label>
              <input
                type="date"
                value={form.dataSessao}
                onChange={(e) => setForm((s) => ({ ...s, dataSessao: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Terapia Aplicada</label>
              <input
                value={form.terapiaAplicada}
                onChange={(e) => setForm((s) => ({ ...s, terapiaAplicada: e.target.value }))}
                placeholder="Ex: Reiki"
              />
            </div>

            <div className="pr-field">
              <label>Duração (minutos)</label>
              <input
                type="number"
                value={form.duracaoMinutos}
                onChange={(e) => setForm((s) => ({ ...s, duracaoMinutos: e.target.value }))}
                placeholder="60"
              />
            </div>

            <div className="pr-field">
              <label>Relato Inicial</label>
              <textarea
                rows={4}
                value={form.relatoInicial}
                onChange={(e) => setForm((s) => ({ ...s, relatoInicial: e.target.value }))}
                placeholder="Descreva os principais relatos da sessão..."
              />
            </div>

            <div className="pr-field">
              <label>Situação Energética</label>
              <textarea
                rows={3}
                value={form.situacaoEnergetica}
                onChange={(e) => setForm((s) => ({ ...s, situacaoEnergetica: e.target.value }))}
                placeholder="Descreva a percepção energética..."
              />
            </div>

            <div className="pr-chakraGrid">
              <div className="pr-field">
                <label>Base (%)</label>
                <input
                  type="number"
                  value={form.chakraBase}
                  onChange={(e) => setForm((s) => ({ ...s, chakraBase: e.target.value }))}
                />
              </div>

              <div className="pr-field">
                <label>Sacral (%)</label>
                <input
                  type="number"
                  value={form.chakraSacral}
                  onChange={(e) => setForm((s) => ({ ...s, chakraSacral: e.target.value }))}
                />
              </div>

              <div className="pr-field">
                <label>Plexo (%)</label>
                <input
                  type="number"
                  value={form.chakraPlexo}
                  onChange={(e) => setForm((s) => ({ ...s, chakraPlexo: e.target.value }))}
                />
              </div>

              <div className="pr-field">
                <label>Cardíaco (%)</label>
                <input
                  type="number"
                  value={form.chakraCardiaco}
                  onChange={(e) => setForm((s) => ({ ...s, chakraCardiaco: e.target.value }))}
                />
              </div>

              <div className="pr-field">
                <label>Laríngeo (%)</label>
                <input
                  type="number"
                  value={form.chakraLaringeo}
                  onChange={(e) => setForm((s) => ({ ...s, chakraLaringeo: e.target.value }))}
                />
              </div>

              <div className="pr-field">
                <label>Frontal (%)</label>
                <input
                  type="number"
                  value={form.chakraFrontal}
                  onChange={(e) => setForm((s) => ({ ...s, chakraFrontal: e.target.value }))}
                />
              </div>

              <div className="pr-field">
                <label>Coronário (%)</label>
                <input
                  type="number"
                  value={form.chakraCoronario}
                  onChange={(e) => setForm((s) => ({ ...s, chakraCoronario: e.target.value }))}
                />
              </div>
            </div>

            <div className="pr-field">
              <label>Trabalho</label>
              <input
                value={form.trabalho}
                onChange={(e) => setForm((s) => ({ ...s, trabalho: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Família</label>
              <input
                value={form.familia}
                onChange={(e) => setForm((s) => ({ ...s, familia: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Prosperidade</label>
              <input
                value={form.prosperidade}
                onChange={(e) => setForm((s) => ({ ...s, prosperidade: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Espiritualidade</label>
              <input
                value={form.espiritualidade}
                onChange={(e) => setForm((s) => ({ ...s, espiritualidade: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Relações Afetivas</label>
              <input
                value={form.relacoesAfetivas}
                onChange={(e) => setForm((s) => ({ ...s, relacoesAfetivas: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Tratamento Executado</label>
              <textarea
                rows={3}
                value={form.tratamentoExecutado}
                onChange={(e) => setForm((s) => ({ ...s, tratamentoExecutado: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Orientação para Casa</label>
              <textarea
                rows={3}
                value={form.orientacaoParaCasa}
                onChange={(e) => setForm((s) => ({ ...s, orientacaoParaCasa: e.target.value }))}
              />
            </div>

            <div className="pr-field">
              <label>Observações da Sessão</label>
              <textarea
                rows={4}
                value={form.observacoesSessao}
                onChange={(e) => setForm((s) => ({ ...s, observacoesSessao: e.target.value }))}
              />
            </div>

            <button className="pr-primary" onClick={onGerarIa} disabled={gerandoIa}>
              {gerandoIa ? "Gerando..." : "Gerar Prontuário com IA"}
            </button>
          </div>

          <div className="pr-card">
            <h2 className="pr-cardTitle">Rascunho Gerado</h2>
            <p className="pr-cardSub">
              Revise o conteúdo antes de salvar no histórico.
            </p>

            <div className="pr-field">
              <label>Título</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))}
                placeholder="Título sugerido"
              />
            </div>

            <div className="pr-field">
              <label>Conteúdo Final</label>
              <textarea
                rows={22}
                value={form.conteudoFinal}
                onChange={(e) => setForm((s) => ({ ...s, conteudoFinal: e.target.value }))}
                placeholder="O texto gerado aparecerá aqui..."
              />
            </div>

            <div className="pr-meta">
              <span>Gerado por IA: {form.geradoPorIa ? "Sim" : "Não"}</span>
              <span>Modelo: {form.modeloIa || "-"}</span>
            </div>

            <button className="pr-primary" onClick={onSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar no Histórico"}
            </button>
          </div>
        </div>
      )}

      {aba === "historico" && (
        <div className="pr-historyWrap">
          <div className="pr-card">
            <h2 className="pr-cardTitle">Histórico de Prontuários</h2>
            <p className="pr-cardSub">Todas as sessões registradas deste paciente.</p>

            {loadingHistorico ? (
              <div className="pr-empty">Carregando histórico...</div>
            ) : historico.length === 0 ? (
              <div className="pr-empty">Nenhum prontuário salvo ainda.</div>
            ) : (
              <div className="pr-historyList">
                {historico.map((item) => (
                  <button
                    key={item.id}
                    className={`pr-historyItem ${
                      prontuarioSelecionadoId === item.id ? "selected" : ""
                    }`}
                    onClick={() => abrirProntuario(item)}
                  >
                    <div className="pr-historyTop">
                      <strong>{item.titulo || `Prontuário ${formatarDataBR(item.dataSessao)}`}</strong>
                      <span>{formatarDataBR(item.dataSessao)}</span>
                    </div>

                    <div className="pr-historyMeta">
                      <span>{item.terapiaAplicada || "Sem terapia"}</span>
                      <span>{item.duracaoMinutos ? `${item.duracaoMinutos} min` : "--"}</span>
                      <span>{item.criadoPorNome || "Usuário"}</span>
                    </div>

                    <p className="pr-historyPreview">
                      {item.conteudoFinal?.slice(0, 180)}
                      {item.conteudoFinal?.length > 180 ? "..." : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pr-card">
            <h2 className="pr-cardTitle">Visualização</h2>
            <p className="pr-cardSub">Clique em um item do histórico para visualizar.</p>

            {!form.conteudoFinal ? (
              <div className="pr-empty">Selecione um prontuário para visualizar o conteúdo.</div>
            ) : (
              <>
                <div className="pr-viewHeader">
                  <strong>{form.titulo || "Sem título"}</strong>
                  <span>{formatarDataBR(form.dataSessao)}</span>
                </div>

                <div className="pr-viewMeta">
                  <span>Terapia: {form.terapiaAplicada || "-"}</span>
                  <span>Duração: {form.duracaoMinutos || "-"} min</span>
                  <span>IA: {form.geradoPorIa ? "Sim" : "Não"}</span>
                </div>

                <div className="pr-viewContent">{form.conteudoFinal}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}