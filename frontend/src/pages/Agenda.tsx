import { useEffect, useMemo, useState } from "react";
import {
  createSessao,
  deleteSessao,
  getSessoesByDate,
  updateSessao,
} from "../services/sessoesService";
import { listarPacientes } from "../services/pacientesService";
import type { Paciente } from "../types/Paciente";
import type { CreateSessaoDto, Sessao, SessaoStatus, UpdateSessaoDto } from "../types/Sessao";

function formatDia(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getWeekDays(anchor: Date) {
  const date = new Date(anchor);
  const day = date.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diffToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    days.push(d);
  }
  return days;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(d: Date) {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function weekdayShort(d: Date) {
  const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return names[d.getDay()];
}

function minutesToHoursLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function Badge({ status }: { status: SessaoStatus }) {
  const map: Record<SessaoStatus, { bg: string; fg: string; label: string }> = {
    Confirmada: { bg: "#dcfce7", fg: "#166534", label: "Confirmada" },
    Pendente: { bg: "#fef9c3", fg: "#854d0e", label: "Pendente" },
    Concluida: { bg: "#e5e7eb", fg: "#111827", label: "Concluída" },
    Cancelada: { bg: "#fee2e2", fg: "#991b1b", label: "Cancelada" },
  };

  const s = map[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {s.label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        background: "linear-gradient(135deg, #0ea5a4, #1d9bd1)",
        color: "#fff",
        fontWeight: 900,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e6eef5",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            padding: 14,
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #eee",
              background: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 14 }}>{children}</div>
      </div>
    </div>
  );
}

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type ModalMode = "create" | "edit";

export function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [sessaoEditandoId, setSessaoEditandoId] = useState<number | null>(null);

  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateSessaoDto>({
    pacienteId: 0,
    dataInicio: new Date().toISOString(),
    duracaoMinutos: 60,
    terapia: "Reiki",
    status: "Pendente",
    observacoes: "",
  });

  const [pacienteBusca, setPacienteBusca] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getSessoesByDate(selectedDay);
        setSessoes(data);
      } catch (e: any) {
        setError(e?.response?.data ?? e?.message ?? "Erro ao carregar sessões");
        setSessoes([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedDay]);

  useEffect(() => {
    async function loadPacientes() {
      try {
        setLoadingPacientes(true);
        const data = await listarPacientes();
        setPacientes(data);
      } catch (e: any) {
        console.error("Erro ao carregar pacientes:", e?.response?.data ?? e?.message);
      } finally {
        setLoadingPacientes(false);
      }
    }

    loadPacientes();
  }, []);

  const weekDays = useMemo(() => getWeekDays(selectedDay), [selectedDay]);

  const sessoesDoDia = useMemo(() => {
    return [...sessoes].sort(
      (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
    );
  }, [sessoes]);

  const resumo = useMemo(() => {
    const total = sessoesDoDia.length;
    const totalMin = sessoesDoDia.reduce((acc, s) => acc + s.duracaoMinutos, 0);
    const confirmadas = sessoesDoDia.filter((s) => s.status === "Confirmada").length;
    const pendentes = sessoesDoDia.filter((s) => s.status === "Pendente").length;
    return { total, totalMin, confirmadas, pendentes };
  }, [sessoesDoDia]);

  const pacientesFiltrados = useMemo(() => {
    const q = pacienteBusca.trim().toLowerCase();

    if (!q) return pacientes.slice(0, 8);

    return pacientes
      .filter((p) => {
        const nome = (p.nome ?? "").toLowerCase();
        const email = (p.email ?? "").toLowerCase();
        const terapia = (p.terapia ?? "").toLowerCase();
        return nome.includes(q) || email.includes(q) || terapia.includes(q);
      })
      .slice(0, 8);
  }, [pacienteBusca, pacientes]);

  function abrirModalNovaSessao() {
    const base = new Date(selectedDay);
    base.setHours(10, 0, 0, 0);

    setModalMode("create");
    setSessaoEditandoId(null);

    setForm({
      pacienteId: 0,
      dataInicio: base.toISOString(),
      duracaoMinutos: 60,
      terapia: "Reiki",
      status: "Pendente",
      observacoes: "",
    });

    setPacienteBusca("");
    setPacienteSelecionado(null);
    setModalOpen(true);
  }

  function abrirModalEditarSessao(sessao: Sessao) {
    const paciente = pacientes.find((p) => p.id === sessao.pacienteId) ?? null;

    setModalMode("edit");
    setSessaoEditandoId(sessao.id);

    setForm({
      pacienteId: sessao.pacienteId,
      dataInicio: sessao.dataInicio,
      duracaoMinutos: sessao.duracaoMinutos,
      terapia: sessao.terapia,
      status: sessao.status,
      observacoes: sessao.observacoes ?? "",
    });

    setPacienteSelecionado(paciente);
    setPacienteBusca(paciente?.nome ?? sessao.pacienteNome);
    setModalOpen(true);
  }

  function selecionarPaciente(paciente: Paciente) {
    setPacienteSelecionado(paciente);
    setPacienteBusca(paciente.nome ?? "");
    setForm((prev) => ({
      ...prev,
      pacienteId: paciente.id,
      terapia: prev.terapia?.trim() ? prev.terapia : paciente.terapia ?? "Reiki",
    }));
  }

  async function handleSaveSessao() {
    try {
      setLoading(true);
      setError(null);

      if (!form.pacienteId || form.pacienteId <= 0) {
        setError("Selecione um paciente pelo nome antes de salvar.");
        return;
      }

      if (!form.terapia?.trim()) {
        setError("Informe a terapia.");
        return;
      }

      if (form.duracaoMinutos < 15 || form.duracaoMinutos > 480) {
        setError("A duração deve estar entre 15 e 480 minutos.");
        return;
      }

      if (modalMode === "create") {
        const payload: CreateSessaoDto = {
          pacienteId: form.pacienteId,
          dataInicio: new Date(form.dataInicio).toISOString(),
          duracaoMinutos: Number(form.duracaoMinutos),
          terapia: form.terapia.trim(),
          status: form.status,
          observacoes: form.observacoes?.trim() || "",
        };

        const created = await createSessao(payload);

        if (sameDay(new Date(created.dataInicio), selectedDay)) {
          setSessoes((prev) => [...prev, created]);
        }
      } else {
        if (!sessaoEditandoId) {
          setError("Sessão inválida para edição.");
          return;
        }

        const payload: UpdateSessaoDto = {
          pacienteId: form.pacienteId,
          dataInicio: new Date(form.dataInicio).toISOString(),
          duracaoMinutos: Number(form.duracaoMinutos),
          terapia: form.terapia.trim(),
          status: form.status,
          observacoes: form.observacoes?.trim() || "",
        };

        const updated = await updateSessao(sessaoEditandoId, payload);

        setSessoes((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      }

      setModalOpen(false);
    } catch (e: any) {
      console.error("Erro ao salvar sessão:", e?.response?.data ?? e?.message);
      setError(e?.response?.data ?? e?.message ?? "Erro ao salvar sessão");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSessao(id: number) {
    const confirmou = window.confirm("Deseja realmente excluir esta sessão?");
    if (!confirmou) return;

    try {
      setLoading(true);
      setError(null);
      await deleteSessao(id);
      setSessoes((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      console.error("Erro ao excluir sessão:", e?.response?.data ?? e?.message);
      setError(e?.response?.data ?? e?.message ?? "Erro ao excluir sessão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <style>
        {`
          .agendaHead {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .agendaTitle {
            margin: 0;
            font-size: 26px;
            font-weight: 900;
          }

          .agendaSub {
            margin-top: 6px;
            font-size: 14px;
            color: #6b7280;
          }

          .btnPrimary {
            background: linear-gradient(135deg, #0b7f86, #1d9bd1);
            color: #fff;
            border: 1px solid rgba(0,0,0,0.08);
            padding: 10px 14px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 800;
            display: inline-flex;
            gap: 10px;
            align-items: center;
          }

          .btnOutline {
            border: 1px solid #dbe4ee;
            background: #fff;
            color: #0f172a;
            padding: 8px 12px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
          }

          .btnDanger {
            border: 1px solid #fecaca;
            background: #fff1f2;
            color: #b91c1c;
            padding: 8px 12px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
          }

          .weekBox {
            border: 1px solid #e6eef5;
            border-radius: 14px;
            background: #fff;
            padding: 16px;
            display: grid;
            gap: 12px;
          }

          .weekGrid {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 10px;
          }

          .dayCard {
            border: 1px solid #e6eef5;
            border-radius: 12px;
            padding: 10px;
            background: #fff;
            cursor: pointer;
            text-align: center;
          }

          .dayCardActive {
            border: 1px solid #0ea5a4;
            box-shadow: 0 0 0 3px rgba(14,165,164,0.12);
          }

          .gridMain {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 12px;
          }

          .agendaField {
            display: grid;
            gap: 6px;
          }

          .agendaLabel {
            font-size: 12px;
            color: #444;
            font-weight: 700;
          }

          .agendaInput {
            border: 1px solid #e6eef5;
            border-radius: 12px;
            padding: 10px;
            outline: none;
            width: 100%;
            box-sizing: border-box;
          }

          .agendaInput:focus {
            border-color: #0ea5a4;
            box-shadow: 0 0 0 3px rgba(14,165,164,0.10);
          }

          .agendaPatientList {
            display: grid;
            gap: 8px;
            max-height: 220px;
            overflow: auto;
            border: 1px solid #eef2f7;
            border-radius: 12px;
            padding: 8px;
            background: #fafdfd;
          }

          .agendaPatientOption {
            border: 1px solid #e6eef5;
            background: #fff;
            border-radius: 12px;
            padding: 10px 12px;
            cursor: pointer;
            text-align: left;
          }

          .agendaPatientOption:hover {
            background: #f0fdfc;
            border-color: rgba(14,165,164,0.25);
          }

          .agendaPatientOption strong {
            display: block;
            color: #0f172a;
          }

          .agendaPatientOption span {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            color: #64748b;
          }

          .agendaPatientSelected {
            padding: 10px 12px;
            border-radius: 12px;
            background: #ecfeff;
            border: 1px solid rgba(14,165,164,0.25);
            color: #0f172a;
            font-size: 13px;
          }

          .agendaActionsRow {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          @media (max-width: 900px) {
            .weekGrid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
            .gridMain { grid-template-columns: 1fr; }
          }

          @media (max-width: 520px) {
            .weekGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }
        `}
      </style>

      <div style={{ display: "grid", gap: 16 }}>
        <div className="agendaHead">
          <div>
            <h1 className="agendaTitle">Agenda de Sessões</h1>
            <div className="agendaSub">Gerencie seus agendamentos e horários</div>
            {error && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: "#b91c1c",
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}
          </div>

          <button className="btnPrimary" onClick={abrirModalNovaSessao}>
            <span style={{ fontSize: 16 }}>＋</span>
            Nova Sessão
          </button>
        </div>

        <div className="weekBox">
          <div style={{ fontWeight: 900 }}>{monthLabel(selectedDay)}</div>

          <div className="weekGrid">
            {weekDays.map((d) => {
              const isActive = sameDay(d, selectedDay);

              return (
                <div
                  key={d.toISOString()}
                  className={`dayCard ${isActive ? "dayCardActive" : ""}`}
                  onClick={() => setSelectedDay(d)}
                >
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{weekdayShort(d)}</div>
                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>
                    {String(d.getDate()).padStart(2, "0")}
                  </div>

                  {isActive && (
                    <div style={{ marginTop: 6, display: "grid", placeItems: "center" }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: "#0ea5a4",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="gridMain">
          <div
            style={{
              border: "1px solid #e6eef5",
              borderRadius: 14,
              background: "#fff",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>📅</span>
              <div>
                <div style={{ fontWeight: 900 }}>Sessões — {formatDia(selectedDay)}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {loading ? "Carregando..." : `${resumo.total} sessões`}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {!loading && sessoesDoDia.length === 0 && (
                <div
                  style={{
                    padding: 12,
                    border: "1px dashed #e5e7eb",
                    borderRadius: 14,
                    color: "#6b7280",
                  }}
                >
                  Nenhuma sessão para este dia.
                </div>
              )}

              {sessoesDoDia.map((s) => {
                const time = new Date(s.dataInicio).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={s.id}
                    style={{
                      border: "1px solid #e6eef5",
                      borderRadius: 14,
                      padding: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        minWidth: 0,
                      }}
                    >
                      <Avatar name={s.pacienteNome} />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.pacienteNome}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{s.terapia}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#6b7280" }}>⏱ {time}</span>
                        <Badge status={s.status} />
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                        {s.duracaoMinutos} min
                      </div>

                      <div className="agendaActionsRow" style={{ marginTop: 10 }}>
                        <button
                          type="button"
                          className="btnOutline"
                          onClick={() => abrirModalEditarSessao(s)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="btnDanger"
                          onClick={() => handleDeleteSessao(s.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                border: "1px solid #e6eef5",
                borderRadius: 14,
                background: "#fff",
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Resumo do Dia</div>

              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Total de Sessões</span>
                  <span style={{ fontWeight: 900 }}>{resumo.total}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Horas Trabalhadas</span>
                  <span style={{ fontWeight: 900 }}>{minutesToHoursLabel(resumo.totalMin)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Confirmadas</span>
                  <span style={{ fontWeight: 900, color: "#16a34a" }}>{resumo.confirmadas}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Pendentes</span>
                  <span style={{ fontWeight: 900, color: "#a16207" }}>{resumo.pendentes}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                border: "1px solid #d5f5f3",
                borderRadius: 14,
                background: "#f0fdfc",
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Dica da IA</div>
              <div style={{ fontSize: 12, color: "#444", lineHeight: 1.4 }}>
                Organize sessões com intervalos saudáveis para melhorar o ritmo do dia.
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e6eef5",
                borderRadius: 14,
                background: "#fff",
                padding: 16,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Terapias Mais Usadas</div>

              {[
                { name: "Reiki", pct: 35 },
                { name: "Acupuntura", pct: 25 },
                { name: "Aromaterapia", pct: 20 },
              ].map((t) => (
                <div key={t.name} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "#444",
                    }}
                  >
                    <span>{t.name}</span>
                    <span style={{ fontWeight: 900 }}>{t.pct}%</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#eee",
                      borderRadius: 999,
                      overflow: "hidden",
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${t.pct}%`,
                        height: "100%",
                        background: "linear-gradient(135deg, #0ea5a4, #1d9bd1)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Modal
          open={modalOpen}
          title={modalMode === "create" ? "Nova Sessão" : "Editar Sessão"}
          onClose={() => setModalOpen(false)}
        >
          <form
            style={{ display: "grid", gap: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSessao();
            }}
          >
            <div className="agendaField">
              <label className="agendaLabel">Paciente</label>
              <input
                className="agendaInput"
                value={pacienteBusca}
                onChange={(e) => {
                  setPacienteBusca(e.target.value);
                  setPacienteSelecionado(null);
                  setForm((prev) => ({ ...prev, pacienteId: 0 }));
                }}
                placeholder={loadingPacientes ? "Carregando pacientes..." : "Digite o nome do paciente"}
              />

              {pacienteSelecionado ? (
                <div className="agendaPatientSelected">
                  <strong>Selecionado:</strong> {pacienteSelecionado.nome}
                  {pacienteSelecionado.terapia ? ` • ${pacienteSelecionado.terapia}` : ""}
                </div>
              ) : (
                <div className="agendaPatientList">
                  {loadingPacientes ? (
                    <div style={{ fontSize: 12, color: "#64748b", padding: 8 }}>
                      Carregando pacientes...
                    </div>
                  ) : pacientesFiltrados.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#64748b", padding: 8 }}>
                      Nenhum paciente encontrado.
                    </div>
                  ) : (
                    pacientesFiltrados.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="agendaPatientOption"
                        onClick={() => selecionarPaciente(p)}
                      >
                        <strong>{p.nome}</strong>
                        <span>{p.terapia || p.email || "Sem informação adicional"}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="agendaField">
              <label className="agendaLabel">Data e hora</label>
              <input
                className="agendaInput"
                type="datetime-local"
                value={toDatetimeLocalValue(new Date(form.dataInicio))}
                onChange={(e) => {
                  const local = e.target.value;
                  const iso = new Date(local).toISOString();
                  setForm({ ...form, dataInicio: iso });
                }}
              />
            </div>

            <div className="agendaField">
              <label className="agendaLabel">Terapia</label>
              <input
                className="agendaInput"
                value={form.terapia}
                onChange={(e) => setForm({ ...form, terapia: e.target.value })}
              />
            </div>

            <div className="agendaField">
              <label className="agendaLabel">Duração (minutos)</label>
              <input
                className="agendaInput"
                type="number"
                value={form.duracaoMinutos}
                onChange={(e) =>
                  setForm({ ...form, duracaoMinutos: Number(e.target.value) })
                }
              />
            </div>

            <div className="agendaField">
              <label className="agendaLabel">Status</label>
              <select
                className="agendaInput"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as SessaoStatus })
                }
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Concluida">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="agendaField">
              <label className="agendaLabel">Observações</label>
              <textarea
                className="agendaInput"
                value={form.observacoes ?? ""}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={4}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btnOutline"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btnPrimary"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading
                  ? "Salvando..."
                  : modalMode === "create"
                  ? "Salvar"
                  : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
} 