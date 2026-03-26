import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

import { AppLayout } from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";

import { DashboardPage } from "./pages/Dashboard";
import { PacientesPage } from "./pages/Pacientes";
import { AgendaPage } from "./pages/Agenda";
import ProntuariosPage from "./pages/Prontuarios";
import { InsightsPage } from "./pages/Insights";
import { UsersPage } from "./pages/Users";

import PacienteNovoPage from "./pages/PacienteNovo";
import CadastroPacientePage from "./pages/CadastroPaciente";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "dashboard", element: <DashboardPage /> },

          { path: "pacientes", element: <PacientesPage /> },
          { path: "pacientes/novo", element: <PacienteNovoPage /> },
          { path: "pacientes/:id/cadastro", element: <CadastroPacientePage /> },
          { path: "pacientes/:id/prontuario", element: <ProntuariosPage /> },
          { path: "agenda", element: <AgendaPage /> },
          { path: "insights", element: <InsightsPage /> },
          { path: "users", element: <UsersPage /> },

          { path: "*", element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);