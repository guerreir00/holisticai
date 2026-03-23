import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../auth/authStore";
import "./AppLayout.css";

type NavItem = { to: string; label: string; icon: string; ownerOnly?: boolean };

function cnLink(isActive: boolean) {
  return isActive ? "al-link al-linkActive" : "al-link";
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavigate();
  const user = getUser();
  const role = user?.role as string | undefined;

  const items: NavItem[] = useMemo(
    () => [
      { to: "/", label: "Dashboard", icon: "▦" },
      { to: "/pacientes", label: "Pacientes", icon: "👤" },
      { to: "/prontuarios", label: "Prontuários IA", icon: "🧾" },
      { to: "/agenda", label: "Agenda", icon: "🗓" },
      { to: "/configuracoes", label: "Configurações", icon: "⚙" },
      { to: "/users", label: "Usuários", icon: "🛡", ownerOnly: true },
    ],
    []
  );

  function logout() {
    clearAuth();
    nav("/login");
  }

  const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
    <aside className="al-sidebar">
      <div className="al-brand">
        <div className="al-logo">
          <span className="al-logoIcon">🧠</span>
        </div>
        <div>
          <div className="al-brandTitle">HolisticAI</div>
          <div className="al-brandSub">Terapia & IA</div>
        </div>
      </div>

      <nav className="al-nav">
        {items
          .filter((x) => !(x.ownerOnly && role !== "Owner"))
          .map((x) => (
            <NavLink
              key={x.to}
              to={x.to}
              end={x.to === "/"}
              className={({ isActive }) => cnLink(isActive)}
              onClick={onNavigate}
            >
              <span className="al-icon">{x.icon}</span>
              <span className="al-label">{x.label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="al-sidebarFooter">
        <div className="al-userRow">
          <div className="al-avatar">{(user?.nome?.[0] ?? "U").toUpperCase()}</div>
          <div className="al-userText">
            <div className="al-userName">{user?.nome ?? "Usuário"}</div>
            <div className="al-userMeta">{role ?? ""}</div>
          </div>
        </div>

        <button className="al-logoutBtn" onClick={logout}>
          Sair
        </button>

        <div className="al-version">v0.1 • Dev</div>
      </div>
    </aside>
  );

  return (
    <div className="al-shell">
      {/* Sidebar desktop */}
      <div className="al-sidebarDesktop">
        <Sidebar />
      </div>

      {/* Main */}
      <main className="al-main">
        {/* Topbar */}
        <header className="al-topbar">
          <div className="al-topbarLeft">
            <button className="al-menuBtn" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              ☰
            </button>
            <div className="al-topbarTitleWrap">
              <div className="al-topbarTitle">Dashboard</div>
              <div className="al-topbarSub">Visão geral do seu consultório</div>
            </div>
          </div>

          <div className="al-topbarRight">
            <div className="al-pill">⚡ Powered by AI</div>

            <div className="al-userPill">
              <div className="al-avatarSm">{(user?.nome?.[0] ?? "U").toUpperCase()}</div>
              <div className="al-userPillText">
                <div className="al-userPillName">{user?.nome ?? "Usuário"}</div>
                <div className="al-userPillMeta">{user?.email ?? ""}</div>
              </div>
              <button className="al-primaryBtn" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="al-content">
          <div className="al-contentCard">
            <Outlet />
          </div>
        </section>
      </main>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="al-overlay" onClick={() => setMobileOpen(false)} role="button" aria-label="Fechar menu">
          <div className="al-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="al-drawerTop">
              <div className="al-drawerTitle">Menu</div>
              <button className="al-xBtn" onClick={() => setMobileOpen(false)} aria-label="Fechar">
                ✕
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}