import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../auth/authStore";
import logoCliniMind from "../assets/clinimind-logo.jpeg";
import "./AppLayout.css";

type NavItem = { to: string; label: string; icon: string; ownerOnly?: boolean };

function cnLink(isActive: boolean) {
  return isActive ? "al-link al-linkActive" : "al-link";
}

function getPageTitle(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    return {
      title: "Dashboard",
      sub: "Visão geral do seu consultório",
    };
  }

  if (pathname.startsWith("/pacientes")) {
    return {
      title: "Pacientes",
      sub: "Gerencie os dados e prontuários dos seus pacientes",
    };
  }

  if (pathname.startsWith("/agenda")) {
    return {
      title: "Agenda",
      sub: "Acompanhe sessões e compromissos",
    };
  }

  if (pathname.startsWith("/users")) {
    return {
      title: "Usuários",
      sub: "Gerencie acessos e permissões do sistema",
    };
  }

  if (pathname.startsWith("/configuracoes")) {
    return {
      title: "Configurações",
      sub: "Ajustes gerais da plataforma",
    };
  }

  return {
    title: "CliniMind",
    sub: "Inteligência para o cuidado",
  };
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const user = getUser();
  const role = user?.role as string | undefined;

  const pageInfo = getPageTitle(location.pathname);

  const items: NavItem[] = useMemo(
    () => [
      { to: "/", label: "Dashboard", icon: "▦" },
      { to: "/pacientes", label: "Pacientes", icon: "👤" },
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
        <img src={logoCliniMind} alt="CliniMind" className="al-brandImage" />
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

        <div className="al-version">CliniMind • v0.1</div>
      </div>
    </aside>
  );

  return (
    <div className="al-shell">
      <div className="al-sidebarDesktop">
        <Sidebar />
      </div>

      <main className="al-main">
        <header className="al-topbar">
          <div className="al-topbarLeft">
            <button
              className="al-menuBtn"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              ☰
            </button>

            <div className="al-topbarTitleWrap">
              <div className="al-topbarTitle">{pageInfo.title}</div>
              <div className="al-topbarSub">{pageInfo.sub}</div>
            </div>
          </div>

          <div className="al-topbarRight">
            <div className="al-pill">✦ Inteligência ativa</div>

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

        <section className="al-content">
          <Outlet />
        </section>
      </main>

      {mobileOpen && (
        <div
          className="al-overlay"
          onClick={() => setMobileOpen(false)}
          role="button"
          aria-label="Fechar menu"
        >
          <div className="al-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="al-drawerTop">
              <div className="al-drawerTitle">Menu</div>
              <button
                className="al-xBtn"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar"
              >
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