import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPacientes } from "../services/pacientesService";
import { listarProntuarios } from "../services/prontuarioService";
import { getSessoesByDate } from "../services/sessoesService";
import type { Paciente } from "../types/Paciente";
import type { Sessao } from "../types/Sessao";
import "./Dashboard.css";

type BirthdayPaciente = Paciente & {
  aniversarioTexto: string;
  aniversarioOrder: number;
};

function formatDateBR(iso?: string | null) {
  if (!iso) return "--/--/----";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--/--/----";
  return d.toLocaleDateString("pt-BR");
}

function getInitial(nome?: string | null) {
  return (nome?.trim()?.charAt(0) ?? "P").toUpperCase();
}

function getBirthdayInNext7Days(dataNascimento?: string | null) {
  if (!dataNascimento) return null;

  const birth = new Date(dataNascimento);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);

    const sameDay =
      birth.getDate() === checkDate.getDate() &&
      birth.getMonth() === checkDate.getMonth();

    if (sameDay) {
      const age = checkDate.getFullYear() - birth.getFullYear();

      let whenText = "";
      if (i === 0) whenText = "hoje";
      else if (i === 1) whenText = "amanhã";
      else whenText = `em ${i} dias`;

      return {
        when: whenText,
        age,
        order: i,
      };
    }
  }

  return null;
}

function getStatusClass(status: string) {
  const s = status.toLowerCase();

  if (s.includes("confirm")) return "confirmada";
  if (s.includes("pendente")) return "pendente";
  if (s.includes("conclu")) return "concluida";
  if (s.includes("cancel")) return "cancelada";

  return "";
}

function formatHora(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--:--";

  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardPage() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showBirthday, setShowBirthday] = useState(true);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [totalProntuarios, setTotalProntuarios] = useState(0);
  const [sessoesHoje, setSessoesHoje] = useState<Sessao[]>([]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setLoading(true);
    setErr(null);

    try {
      const [pacientesData, sessoesData] = await Promise.all([
        listarPacientes(),
        getSessoesByDate(new Date()),
      ]);

      setPacientes(pacientesData);
      setSessoesHoje(sessoesData);

      const contagens = await Promise.all(
        pacientesData.map(async (p) => {
          try {
            const prontuarios = await listarProntuarios(p.id);
            return prontuarios.length;
          } catch {
            return 0;
          }
        })
      );

      const total = contagens.reduce((acc, n) => acc + n, 0);
      setTotalProntuarios(total);
    } catch (e: any) {
      console.error(e);
      setErr(e?.response?.data ?? e?.message ?? "Erro ao carregar dashboard.");
    } finally {
      setLoading(false);
    }
  }

  const aniversariantes = useMemo<BirthdayPaciente[]>(() => {
    return pacientes
      .map((p) => {
        const info = getBirthdayInNext7Days(p.dataNascimento);
        if (!info) return null;

        return {
          ...p,
          aniversarioTexto: `${p.nome} faz ${info.age} anos ${info.when}`,
          aniversarioOrder: info.order,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.aniversarioOrder - b.aniversarioOrder) as BirthdayPaciente[];
  }, [pacientes]);

  const pacientesRecentes = useMemo(() => {
    return [...pacientes]
      .sort((a, b) => {
        const da = new Date(a.dataCadastro ?? 0).getTime();
        const db = new Date(b.dataCadastro ?? 0).getTime();
        return db - da;
      })
      .slice(0, 4);
  }, [pacientes]);

  const totalPacientes = pacientes.length;

  const totalSessoes = useMemo(() => {
    return pacientes.reduce((acc, p) => acc + ((p as any).totalSessoes ?? 0), 0);
  }, [pacientes]);

  const totalAtivos = useMemo(() => {
    return pacientes.filter((p) => (p.status ?? "").toLowerCase() === "ativo").length;
  }, [pacientes]);

  const taxaAtivos =
    totalPacientes > 0 ? Math.round((totalAtivos / totalPacientes) * 100) : 0;

  const resumoAgendaHoje = useMemo(() => {
    const total = sessoesHoje.length;
    const confirmadas = sessoesHoje.filter((s) =>
      s.status.toLowerCase().includes("confirm")
    ).length;
    const pendentes = sessoesHoje.filter((s) =>
      s.status.toLowerCase().includes("pendente")
    ).length;
    const concluidas = sessoesHoje.filter((s) =>
      s.status.toLowerCase().includes("conclu")
    ).length;

    return {
      total,
      confirmadas,
      pendentes,
      concluidas,
    };
  }, [sessoesHoje]);

  return (
    <div className="db-page">
      <div className="db-top">
        <h1>Dashboard</h1>
        <p>Visão geral do seu consultório de terapia holística</p>
      </div>

      {err && <div className="db-error">{String(err)}</div>}

      {showBirthday && aniversariantes.length > 0 && (
        <div className="db-birthday">
          <div>
            <strong>🎉 Aniversariantes da semana!</strong>
            <div className="db-birthdayText">
              {aniversariantes.map((a) => a.aniversarioTexto).join(" • ")}
            </div>
          </div>

          <button className="db-closeBtn" onClick={() => setShowBirthday(false)}>
            ×
          </button>
        </div>
      )}

      <div className="db-metrics">
        <div className="db-metricCard" onClick={() => nav("/pacientes")}>
          <div className="db-metricHeader">
            <span>Total de Pacientes</span>
            <span>👥</span>
          </div>
          <div className="db-metricValue">{loading ? "..." : totalPacientes}</div>
          <div className="db-metricSub">Pacientes cadastrados</div>
        </div>

        <div className="db-metricCard" onClick={() => nav("/agenda")}>
          <div className="db-metricHeader">
            <span>Sessões Registradas</span>
            <span>🗓️</span>
          </div>
          <div className="db-metricValue">{loading ? "..." : totalSessoes}</div>
          <div className="db-metricSub">Somando dados dos pacientes</div>
        </div>

        <div className="db-metricCard" onClick={() => nav("/pacientes")}>
          <div className="db-metricHeader">
            <span>Prontuários IA</span>
            <span>🧠</span>
          </div>
          <div className="db-metricValue">{loading ? "..." : totalProntuarios}</div>
          <div className="db-metricSub">Registros salvos no histórico</div>
        </div>

        <div className="db-metricCard" onClick={() => nav("/pacientes")}>
          <div className="db-metricHeader">
            <span>Pacientes Ativos</span>
            <span>📈</span>
          </div>
          <div className="db-metricValue">
            {loading ? "..." : `${taxaAtivos}%`}
          </div>
          <div className="db-metricSub">
            {loading ? "..." : `${totalAtivos} de ${totalPacientes} ativos`}
          </div>
        </div>
      </div>

      <div className="db-card db-agendaHojeCard">
        <div className="db-cardHeader">
          <div>
            <h2>Agenda de Hoje</h2>
            <p>Sessões agendadas para hoje</p>
          </div>

          <button className="db-outlineBtn" onClick={() => nav("/agenda")}>
            Ver Agenda Completa
          </button>
        </div>

        {loading ? (
          <div className="db-empty">Carregando sessões...</div>
        ) : sessoesHoje.length === 0 ? (
          <div className="db-empty">Nenhuma sessão para hoje.</div>
        ) : (
          <div className="db-agendaList">
            {sessoesHoje.map((s) => (
              <div key={s.id} className={`db-agendaItem ${getStatusClass(s.status)}`}>
                <div className="db-avatar">{getInitial(s.pacienteNome)}</div>

                <div className="db-agendaInfo">
                  <strong>{s.pacienteNome}</strong>
                  <span>
                    ⏰ {formatHora(s.dataInicio)} ({s.duracaoMinutos} min) • {s.terapia}
                  </span>
                </div>

                <div className="db-agendaActions">
                  <button
                    className="db-outlineBtn"
                    onClick={() => nav(`/pacientes/${s.pacienteId}/prontuario`)}
                  >
                    Histórico
                  </button>

                  <button
                    className="db-outlineBtn"
                    onClick={() => nav(`/pacientes/${s.pacienteId}/cadastro`)}
                  >
                    Revisar
                  </button>

                  <button className="db-primaryBtn">Iniciar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="db-contentGrid">
        <div className="db-card">
          <div className="db-cardHeader">
            <div>
              <h2>Pacientes Recentes</h2>
              <p>Últimos pacientes cadastrados</p>
            </div>

            <button className="db-outlineBtn" onClick={() => nav("/pacientes")}>
              Ver todos
            </button>
          </div>

          {loading ? (
            <div className="db-empty">Carregando pacientes...</div>
          ) : pacientesRecentes.length === 0 ? (
            <div className="db-empty">Nenhum paciente cadastrado ainda.</div>
          ) : (
            <div className="db-patientList">
              {pacientesRecentes.map((p) => (
                <div
                  key={p.id}
                  className="db-patientItem"
                  onClick={() => nav(`/pacientes/${p.id}/prontuario`)}
                >
                  <div className="db-avatar">{getInitial(p.nome)}</div>

                  <div className="db-patientInfo">
                    <strong>{p.nome}</strong>
                    <span>{p.terapia || p.email || "Sem informação"}</span>
                  </div>

                  <div className="db-patientMeta">
                    <div>{formatDateBR(p.dataCadastro)}</div>
                    <small>{p.status ?? "Ativo"}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="db-sideColumn">
          <div className="db-card">
            <div className="db-cardHeader">
              <div>
                <h2>Resumo do Dia</h2>
                <p>Métricas das sessões de hoje</p>
              </div>
            </div>

            <div className="db-summaryList">
              <div className="db-summaryRow">
                <span>Total de Sessões</span>
                <strong>{resumoAgendaHoje.total}</strong>
              </div>

              <div className="db-summaryRow">
                <span>Confirmadas</span>
                <strong className="db-ok">{resumoAgendaHoje.confirmadas}</strong>
              </div>

              <div className="db-summaryRow">
                <span>Pendentes</span>
                <strong className="db-warn">{resumoAgendaHoje.pendentes}</strong>
              </div>

              <div className="db-summaryRow">
                <span>Concluídas</span>
                <strong className="db-info">{resumoAgendaHoje.concluidas}</strong>
              </div>
            </div>
          </div>

          <div className="db-card">
            <div className="db-cardHeader">
              <div>
                <h2>Insights da IA</h2>
                <p>Sugestões automáticas do sistema</p>
              </div>
            </div>

            <div className="db-empty">
              Em breve esta área mostrará insights automáticos sobre sessões e evolução clínica.
            </div>
          </div>
        </div>
      </div>

      <div className="db-actions">
        <button className="db-actionCard" onClick={() => nav("/pacientes/novo")}>
          <div className="db-actionTitle">Novo Paciente</div>
          <div className="db-actionSub">Cadastrar novo paciente</div>
        </button>

        <button className="db-actionCard" onClick={() => nav("/pacientes")}>
          <div className="db-actionTitle">Gerenciar Pacientes</div>
          <div className="db-actionSub">Abrir lista de pacientes</div>
        </button>

        <button className="db-actionCard" onClick={() => nav("/agenda")}>
          <div className="db-actionTitle">Agenda</div>
          <div className="db-actionSub">Ver agenda e sessões</div>
        </button>
      </div>
    </div>
  );
}