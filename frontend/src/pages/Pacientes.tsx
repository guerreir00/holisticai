import { useEffect, useMemo, useState } from "react";
import type { Paciente } from "../types/Paciente";
import { listarPacientes } from "../services/pacientesService";
import "./Pacientes.css";
import { useLocation, useNavigate } from "react-router-dom";

function formatDateBR(iso?: string | null) {
  if (!iso) return "--/--/----";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--/--/----";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function statusClass(status?: string | null) {
  const s = (status ?? "Ativo").toLowerCase();
  if (s === "inativo") return "pc-status inativo";
  if (s === "aguardando") return "pc-status aguardando";
  return "pc-status ativo";
}

type NavState = {
  createdPaciente?: Paciente;
};

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as NavState;

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const data = await listarPacientes();
      setPacientes(data);
    } catch (e: any) {
      setErr(e?.response?.data ?? "Erro ao carregar pacientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const created = state?.createdPaciente;
    if (!created) return;

    setPacientes((prev) => {
      const exists = prev.some((p) => p.id === created.id);
      if (exists) return prev;
      return [created, ...prev];
    });

    window.history.replaceState({}, document.title);
  }, [state?.createdPaciente]);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pacientes;

    return pacientes.filter((p) => {
      const nome = (p.nome ?? "").toLowerCase();
      const terapia = (p.terapia ?? "").toLowerCase();
      return nome.includes(q) || terapia.includes(q);
    });
  }, [pacientes, search]);

  return (
    <div className="pc-wrapper">
      <div className="pc-header">
        <div>
          <h1>Pacientes</h1>
          <p>Gerencie todos os seus pacientes em um só lugar</p>
        </div>

        <button className="pc-primaryBtn" onClick={() => nav("/pacientes/novo")}>
          + Novo Paciente
        </button>
      </div>

      <div className="pc-search">
        <input
          placeholder="Buscar pacientes por nome ou terapia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {err && <div className="pc-error">{String(err)}</div>}

      {loading ? (
        <div className="pc-loading">Carregando...</div>
      ) : (
        <div className="pc-grid">
          {filtrados.map((p) => (
            <div key={p.id} className="pc-card">
              <div className="pc-cardTop">
                <div className="pc-avatar">
                  {(p.nome?.[0] ?? "P").toUpperCase()}
                </div>

                <div className="pc-info">
                  <strong>{p.nome}</strong>
                  <span>{p.terapia ? p.terapia : p.email ?? ""}</span>
                </div>

                <div className={statusClass(p.status)}>
                  {p.status ?? "Ativo"}
                </div>
              </div>

              <div className="pc-meta">
                <div className="pc-metaRow">✉ {p.email ?? "-"}</div>
                <div className="pc-metaRow">📞 {p.telefone ?? "-"}</div>
              </div>

              <div className="pc-cardBody">
                <div>
                  <small>Última visita</small>
                  <div>{formatDateBR(p.ultimaVisita)}</div>
                </div>

                <div className="pc-sessoes">
                  <small>Sessões</small>
                  <div>{(p as any).totalSessoes ?? 0}</div>
                </div>
              </div>

              <div className="pc-cardActions">
                <button
                  className="pc-secondaryBtn"
                  onClick={() => nav(`/pacientes/${p.id}/prontuario`)}
                >
                  Prontuário
                </button>

                <button
                  className="pc-outlineBtn"
                  onClick={() => nav(`/pacientes/${p.id}/cadastro`)}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}