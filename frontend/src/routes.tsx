import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { DashboardPage } from './pages/Dashboard'
import { PacientesPage } from './pages/Pacientes'
import { AgendaPage } from './pages/Agenda'
import { ProntuariosPage } from './pages/Prontuarios'
import { InsightsPage } from './pages/Insights'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'pacientes', element: <PacientesPage /> },
      { path: 'agenda', element: <AgendaPage /> },
      { path: 'prontuarios', element: <ProntuariosPage /> },
      { path: 'insights', element: <InsightsPage /> }
    ]
  }
])
