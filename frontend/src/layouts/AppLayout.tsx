import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../auth/authStore";

const linkBase: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  textDecoration: "none",
  color: "#111",
  display: "block",
};

const activeStyle: React.CSSProperties = {
  ...linkBase,
  background: "#f3e8ff",
  border: "1px solid #e9d5ff",
};

function Sidebar({ user, onNavigate }: { user: any; onNavigate?: () => void }) {
  const role = user?.role;

  return (
    <aside
      style={{
        borderRight: "1px solid #eee",
        padding: 16,
        background: "#fff",
        height: "100%",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "#7c3aed",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: 900,
          }}
        >
          H
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>HolisticAI</div>
          <div style={{ fontSize: 12, color: "#666" }}>Terapia & IA</div>
        </div>
      </div>

      <nav style={{ display: "grid", gap: 6 }}>
        <NavLink to="/" end style={({ isActive }) => (isActive ? activeStyle : linkBase)} onClick={onNavigate}>
          Dashboard
        </NavLink>

        <NavLink to="/pacientes" style={({ isActive }) => (isActive ? activeStyle : linkBase)} onClick={onNavigate}>
          Pacientes
        </NavLink>

        <NavLink to="/agenda" style={({ isActive }) => (isActive ? activeStyle : linkBase)} onClick={onNavigate}>
          Agenda
        </NavLink>

        <NavLink to="/prontuarios" style={({ isActive }) => (isActive ? activeStyle : linkBase)} onClick={onNavigate}>
          Prontuários
        </NavLink>

        <NavLink to="/insights" style={({ isActive }) => (isActive ? activeStyle : linkBase)} onClick={onNavigate}>
          Insights IA
        </NavLink>

        {/* ✅ Só Owner vê */}
        {role === "Owner" && (
          <NavLink to="/users" style={({ isActive }) => (isActive ? activeStyle : linkBase)} onClick={onNavigate}>
            Usuários
          </NavLink>
        )}
      </nav>

      <div style={{ marginTop: 24, fontSize: 12, color: "#666" }}>v0.1 • Dev</div>
    </aside>
  );
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    nav("/login");
  }

  return (
    <div>
      <style>
        {`
          .layout {
            display: grid;
            grid-template-columns: 270px 1fr;
            min-height: 100vh;
          }
          .sidebar-desktop { display: block; }
          .topbar {
            border-bottom: 1px solid #eee;
            padding: 14px 18px;
            background: #fff;
            position: sticky;
            top: 0;
            z-index: 5;
          }
          .contentWrap {
            padding: 18px;
            background: #fafafa;
            min-height: calc(100vh - 52px);
          }
          .contentCard {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 14px;
            padding: 18px;
          }

          /* MOBILE */
          .mobileMenuBtn { display: none; }

          @media (max-width: 900px) {
            .layout {
              grid-template-columns: 1fr;
            }
            .sidebar-desktop { display: none; }
            .mobileMenuBtn { display: inline-flex; }
          }

          /* Drawer do menu no mobile */
          .drawerOverlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.35);
            z-index: 20;
            display: flex;
          }
          .drawerPanel {
            width: 280px;
            max-width: 85vw;
            background: #fff;
            height: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
        `}
      </style>

      <div className="layout">
        {/* Sidebar desktop */}
        <div className="sidebar-desktop">
          <Sidebar user={user} />
        </div>

        {/* Main */}
        <main>
          {/* Topbar */}
          <header className="topbar">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Botão menu (aparece só no mobile) */}
                <button
                  className="mobileMenuBtn"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{
                    border: "1px solid #eee",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "8px 10px",
                    cursor: "pointer",
                  }}
                  aria-label="Abrir menu"
                >
                  ☰
                </button>

                <div style={{ fontWeight: 700 }}>Sistema de Terapia Holística</div>
              </div>

              {/* Usuário logado + Logout */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, color: "#444" }}>
                  {user?.nome ?? "Usuário"} {user?.role ? `(${user.role})` : ""}
                </div>

                <button
                  onClick={handleLogout}
                  style={{
                    border: "1px solid #eee",
                    background: "#fff",
                    borderRadius: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </header>

          {/* Conteúdo */}
          <div className="contentWrap">
            <div className="contentCard">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Drawer (menu mobile) */}
      {mobileMenuOpen && (
        <div
          className="drawerOverlay"
          onClick={() => setMobileMenuOpen(false)}
          role="button"
          aria-label="Fechar menu"
        >
          <div className="drawerPanel" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: 12,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 900 }}>Menu</div>
              <button
                onClick={() => setMobileMenuOpen(false)}
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

            <Sidebar user={user} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}