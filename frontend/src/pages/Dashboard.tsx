import { useEffect, useState } from 'react'
import { getTotalPacientes } from '../services/dashboardService'

function Card({
  title,
  value,
  subtitle,
  icon
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 14,
      padding: 16,
      background: '#fff',
      display: 'grid',
      gap: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: '#555', fontWeight: 700 }}>{title}</div>
        <div style={{ opacity: 0.9 }}>{icon}</div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{subtitle}</div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  icon,
  children
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 14,
      background: '#fff',
      padding: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 900 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: '#666' }}>{subtitle}</div>}
        </div>
        {icon}
      </div>

      {children}
    </div>
  )
}

function RowItem({
  initials,
  name,
  therapy,
  rightTop,
  rightBottom,
}: {
  initials: string
  name: string
  therapy: string
  rightTop: string
  rightBottom: string
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderTop: '1px solid #f2f2f2',
      gap: 12
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: '#7c3aed',
          color: '#fff',
          fontWeight: 900,
          display: 'grid',
          placeItems: 'center',
          fontSize: 13,
          flexShrink: 0
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>{therapy}</div>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13 }}>{rightTop}</div>
        <div style={{ fontSize: 12, color: '#666' }}>{rightBottom}</div>
      </div>
    </div>
  )
}

function Insight({
  name,
  text,
  accent
}: {
  name: string
  text: string
  accent: string
}) {
  return (
    <div style={{
      border: '1px solid #eee',
      borderLeft: `4px solid ${accent}`,
      borderRadius: 12,
      padding: 12,
      background: '#fafafa',
      display: 'grid',
      gap: 6
    }}>
      <div style={{ fontWeight: 900, fontSize: 13 }}>{name}</div>
      <div style={{ fontSize: 12, color: '#555' }}>{text}</div>
    </div>
  )
}

function ActionButton({
  title,
  subtitle,
  icon
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 14,
      padding: 14,
      background: '#fff',
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        background: '#f3e8ff',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#666' }}>{subtitle}</div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [totalPacientes, setTotalPacientes] = useState<number | null>(null)

  useEffect(() => {
    getTotalPacientes()
      .then(setTotalPacientes)
      .catch(() => setTotalPacientes(0))
  }, [])

  // mocks (depois ligamos no backend)
  const sessoesHoje = 8
  const confirmadas = 3
  const prontuariosIA = 142
  const estaSemana = 23
  const progresso = 87

  return (
    <div>
      {/* CSS responsivo do dashboard */}
      <style>
        {`
          .dashWrap { display: grid; gap: 16px; }
          .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
          .mid { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; }
          .actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }

          @media (max-width: 1100px) {
            .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          }

          @media (max-width: 900px) {
            .mid { grid-template-columns: 1fr; }
            .actions { grid-template-columns: 1fr; }
          }

          @media (max-width: 520px) {
            .kpis { grid-template-columns: 1fr; }
          }
        `}
      </style>

      <div className="dashWrap">
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>Dashboard</h1>
          <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
            Visão geral do seu consultório de terapia holística
          </div>
        </div>

        {/* Cards topo */}
        <div className="kpis">
          <Card
            title="Total de Pacientes"
            value={totalPacientes === null ? '—' : String(totalPacientes)}
            subtitle="+12% este mês"
            icon={<span title="Pacientes">👥</span>}
          />
          <Card
            title="Sessões Hoje"
            value={String(sessoesHoje)}
            subtitle={`${confirmadas} confirmadas`}
            icon={<span title="Agenda">📅</span>}
          />
          <Card
            title="Prontuários IA"
            value={String(prontuariosIA)}
            subtitle={`+${estaSemana} esta semana`}
            icon={<span title="IA">🧠</span>}
          />
          <Card
            title="Taxa de Progresso"
            value={`${progresso}%`}
            subtitle="+5% vs mês anterior"
            icon={<span title="Progresso">📈</span>}
          />
        </div>

        {/* Meio */}
        <div className="mid">
          <SectionCard
            title="Pacientes Recentes"
            subtitle="Últimas atividades do consultório"
            icon={<span style={{ opacity: 0.7 }}>⋯</span>}
          >
            <div style={{ borderTop: '1px solid #f2f2f2' }} />
            <RowItem initials="M" name="Maria Silva" therapy="Reiki" rightTop="Hoje, 14:00" rightBottom="Em andamento" />
            <RowItem initials="J" name="João Santos" therapy="Acupuntura" rightTop="Ontem, 16:30" rightBottom="Concluída" />
            <RowItem initials="A" name="Ana Paula" therapy="Aromaterapia" rightTop="31/01/2026" rightBottom="Agendada" />
            <RowItem initials="C" name="Carlos Mendes" therapy="Florais" rightTop="30/01/2026" rightBottom="Concluída" />
          </SectionCard>

          <SectionCard
            title="Insights da IA"
            subtitle="Análises automáticas dos tratamentos"
            icon={<span title="IA">🧠</span>}
          >
            <div style={{ display: 'grid', gap: 10 }}>
              <Insight name="Maria Silva" text="Melhora significativa nos níveis de ansiedade (45% redução)" accent="#2563eb" />
              <Insight name="João Santos" text="Sugestão: aumentar frequência para 2x/semana" accent="#f97316" />
              <Insight name="Ana Paula" text="Padrão positivo detectado: excelente resposta ao tratamento" accent="#22c55e" />
            </div>
          </SectionCard>
        </div>

        {/* Ações rápidas */}
        <div className="actions">
          <ActionButton title="Gerenciar Pacientes" subtitle="Adicionar ou editar informações" icon={<span>👥</span>} />
          <ActionButton title="Prontuários com IA" subtitle="Criar e gerenciar prontuários" icon={<span>🧠</span>} />
          <ActionButton title="Agendar Sessão" subtitle="Agende novas sessões" icon={<span>📅</span>} />
        </div>
      </div>
    </div>
  )
}
