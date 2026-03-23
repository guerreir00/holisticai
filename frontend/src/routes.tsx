import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import { AppLayout } from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";

import { DashboardPage } from "./pages/Dashboard";
import { PacientesPage } from "./pages/Pacientes";
import { AgendaPage } from "./pages/Agenda";
import { ProntuariosPage } from "./pages/Prontuarios";
import { InsightsPage } from "./pages/Insights";
import { UsersPage } from "./pages/Users";

// ✅ NOVO
import  PacienteNovoPage  from "./pages/PacienteNovo";
import  CadastroPacientePage from "./pages/CadastroPaciente";

export const router = createBrowserRouter([
  // ✅ rota pública
  {
    path: "/login",
    element: <LoginPage />,
  },

  // ✅ rotas protegidas
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "dashboard", element: <DashboardPage /> },

          // ✅ pacientes
          { path: "pacientes", element: <PacientesPage /> },

          // ✅ NOVO: tela “Novo Paciente” (igual protótipo)
          { path: "pacientes/novo", element: <PacienteNovoPage /> },

          // ✅ NOVO: cadastro completo por paciente (quando você quiser editar depois)
          { path: "pacientes/:id/cadastro", element: <CadastroPacientePage /> },

          { path: "agenda", element: <AgendaPage /> },
          { path: "prontuarios", element: <ProntuariosPage /> },
          { path: "insights", element: <InsightsPage /> },
          { path: "users", element: <UsersPage /> },

          // fallback
          { path: "*", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);