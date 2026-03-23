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

  // ✅ Quando voltar do /pacientes/novo com um paciente criado,
  // coloca no topo e limpa o state pra não duplicar no refresh.
  useEffect(() => {
    const created = state?.createdPaciente;
    if (!created) return;

    setPacientes((prev) => {
      const exists = prev.some((p) => p.id === created.id);
      if (exists) return prev;
      return [created, ...prev];
    });

    // limpa state da navegação
    window.history.replaceState({}, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.createdPaciente]);

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pacientes;

    return pacientes.filter((p: any) => {
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
        <div style={{ padding: 12, color: "#666" }}>Carregando...</div>
      ) : (
        <div className="pc-grid">
          {filtrados.map((p: any) => (
            <div key={p.id} className="pc-card">
              <div className="pc-cardTop">
                <div className="pc-avatar">{(p.nome?.[0] ?? "P").toUpperCase()}</div>

                <div className="pc-info">
                  <strong>{p.nome}</strong>
                  <span>{p.terapia ? p.terapia : p.email ?? ""}</span>
                </div>

                <div className={statusClass(p.status)}>{p.status ?? "Ativo"}</div>
              </div>

              <div className="pc-meta">
                <div className="pc-metaRow">
                  <span>✉</span> <span>{p.email ?? "-"}</span>
                </div>
                <div className="pc-metaRow">
                  <span>📞</span> <span>{p.telefone ?? "-"}</span>
                </div>
              </div>

              <div className="pc-cardBody">
                <div>
                  <small>Última visita</small>
                  <div>{formatDateBR(p.ultimaVisita)}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <small>Sessões</small>
                  <div>{p.totalSessoes ?? 0}</div>
                </div>
              </div>

              <div className="pc-cardActions">
                <button className="pc-secondaryBtn" onClick={() => nav(`/pacientes/${p.id}/cadastro`)}>
                  Prontuário
                </button>

                <button className="pc-outlineBtn" onClick={() => nav(`/pacientes/${p.id}/cadastro`)}>
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