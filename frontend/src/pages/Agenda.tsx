import { useEffect, useMemo, useState } from 'react'
import { createSessao, getSessoesByDate } from '../services/sessoesService'
import type { CreateSessaoDto, Sessao, SessaoStatus } from '../types/Sessao'

function formatDia(d: Date) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function getWeekDays(anchor: Date) {
  // semana começando na segunda
  const date = new Date(anchor)
  const day = date.getDay() // 0 dom - 6 sab
  const diffToMonday = (day === 0 ? -6 : 1) - day
  date.setDate(date.getDate() + diffToMonday)

  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(date)
    d.setDate(date.getDate() + i)
    days.push(d)
  }
  return days
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function monthLabel(d: Date) {
  const meses = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ]
  return `${meses[d.getMonth()]} ${d.getFullYear()}`
}

function weekdayShort(d: Date) {
  const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return names[d.getDay()]
}

function minutesToHoursLabel(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function Badge({ status }: { status: SessaoStatus }) {
  const map: Record<SessaoStatus, { bg: string; fg: string; label: string }> = {
    Confirmada: { bg: '#dcfce7', fg: '#166534', label: 'Confirmada' },
    Pendente: { bg: '#fef9c3', fg: '#854d0e', label: 'Pendente' },
    Concluida: { bg: '#e5e7eb', fg: '#111827', label: 'Concluída' },
    Cancelada: { bg: '#fee2e2', fg: '#991b1b', label: 'Cancelada' },
  }

  const s = map[status]
  return (
    <span style={{
      background: s.bg,
      color: s.fg,
      borderRadius: 999,
      padding: '4px 10px',
      fontSize: 12,
      fontWeight: 700,
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      {s.label}
    </span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || '?'

  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 999,
      background: '#7c3aed',
      color: '#fff',
      fontWeight: 900,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        zIndex: 50
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(720px, 100%)',
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #eee',
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
        }}
      >
        <div style={{ padding: 14, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button
            onClick={onClose}
            style={{ border: '1px solid #eee', background: '#fff', borderRadius: 10, padding: '6px 10px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 14 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function toDatetimeLocalValue(date: Date) {
  // yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function AgendaPage() {
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const [modalOpen, setModalOpen] = useState(false)

  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // FORM (MVP): pacienteId por enquanto
  const [form, setForm] = useState<CreateSessaoDto>(() => ({
    pacienteId: 1,
    dataInicio: new Date().toISOString(),
    duracaoMinutos: 60,
    terapia: 'Reiki',
    status: 'Pendente',
    observacoes: ''
  }))

  // Carrega sessões do backend quando trocar o dia
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getSessoesByDate(selectedDay)
        setSessoes(data)
      } catch (e: any) {
        setError(e?.message ?? 'Erro ao carregar sessões')
        setSessoes([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedDay])

  // Week cards
  const weekDays = useMemo(() => getWeekDays(selectedDay), [selectedDay])

  // Sessões do dia (já vem filtrado do backend, mas mantém ordenação)
  const sessoesDoDia = useMemo(() => {
    return [...sessoes].sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
  }, [sessoes])

  const resumo = useMemo(() => {
    const total = sessoesDoDia.length
    const totalMin = sessoesDoDia.reduce((acc, s) => acc + s.duracaoMinutos, 0)
    const confirmadas = sessoesDoDia.filter(s => s.status === 'Confirmada').length
    const pendentes = sessoesDoDia.filter(s => s.status === 'Pendente').length
    return { total, totalMin, confirmadas, pendentes }
  }, [sessoesDoDia])

  async function handleSaveSessao() {
    // dataInicio vem do input datetime-local => vira Date => ISO
    try {
      setLoading(true)
      setError(null)

      const created = await createSessao(form)

      // Se a sessão criada for do dia selecionado, adiciona na lista
      if (sameDay(new Date(created.dataInicio), selectedDay)) {
        setSessoes(prev => [...prev, created])
      }

      setModalOpen(false)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao salvar sessão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* CSS responsivo */}
      <style>
        {`
          .agendaHead {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }
          .agendaTitle { margin: 0; font-size: 26px; font-weight: 900; }
          .agendaSub { margin-top: 6px; font-size: 14px; color: #6b7280; }

          .btnPrimary {
            background: #111827;
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

          .weekBox {
            border: 1px solid #eee;
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
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 10px;
            background: #fff;
            cursor: pointer;
            text-align: center;
          }

          .dayCardActive {
            border: 1px solid #7c3aed;
            box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
          }

          .gridMain {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 12px;
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

      <div style={{ display: 'grid', gap: 16 }}>
        {/* Header */}
        <div className="agendaHead">
          <div>
            <h1 className="agendaTitle">Agenda de Sessões</h1>
            <div className="agendaSub">Gerencie seus agendamentos e horários</div>
            {error && <div style={{ marginTop: 10, fontSize: 14, color: '#b91c1c', fontWeight: 700 }}>{error}</div>}
          </div>

          <button
            className="btnPrimary"
            onClick={() => {
              // quando abrir modal, inicializa com o dia selecionado (10:00)
              const base = new Date(selectedDay)
              base.setHours(10, 0, 0, 0)

              setForm({
                pacienteId: 1,
                dataInicio: base.toISOString(),
                duracaoMinutos: 60,
                terapia: 'Reiki',
                status: 'Pendente',
                observacoes: ''
              })

              setModalOpen(true)
            }}
          >
            <span style={{ fontSize: 16 }}>＋</span>
            Nova Sessão
          </button>
        </div>

        {/* Semana */}
        <div className="weekBox">
          <div style={{ fontWeight: 900 }}>{monthLabel(selectedDay)}</div>

          <div className="weekGrid">
            {weekDays.map((d) => {
              const isActive = sameDay(d, selectedDay)
              return (
                <div
                  key={d.toISOString()}
                  className={`dayCard ${isActive ? 'dayCardActive' : ''}`}
                  onClick={() => setSelectedDay(d)}
                >
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{weekdayShort(d)}</div>
                  <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>{String(d.getDate()).padStart(2, '0')}</div>
                  {isActive && (
                    <div style={{ marginTop: 6, display: 'grid', placeItems: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: 999, background: '#7c3aed' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="gridMain">
          {/* Lista do dia */}
          <div style={{ border: '1px solid #eee', borderRadius: 14, background: '#fff', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>📅</span>
              <div>
                <div style={{ fontWeight: 900 }}>
                  Sessões — {formatDia(selectedDay)}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {loading ? 'Carregando...' : `${resumo.total} sessões`}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              {!loading && sessoesDoDia.length === 0 && (
                <div style={{ padding: 12, border: '1px dashed #e5e7eb', borderRadius: 14, color: '#6b7280' }}>
                  Nenhuma sessão para este dia.
                </div>
              )}

              {sessoesDoDia.map((s) => {
                const time = new Date(s.dataInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                const pacienteLabel = s.pacienteNome

                return (
                  <div
                    key={s.id}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 14,
                      padding: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                      <Avatar name={pacienteLabel} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pacienteLabel}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{s.terapia}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>⏱ {time}</span>
                        <Badge status={s.status} />
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                        {s.duracaoMinutos} min
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lateral */}
          <div style={{ display: 'grid', gap: 12 }}>
            {/* Resumo do Dia */}
            <div style={{ border: '1px solid #eee', borderRadius: 14, background: '#fff', padding: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Resumo do Dia</div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Total de Sessões</span>
                  <span style={{ fontWeight: 900 }}>{resumo.total}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Horas Trabalhadas</span>
                  <span style={{ fontWeight: 900 }}>{minutesToHoursLabel(resumo.totalMin)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Confirmadas</span>
                  <span style={{ fontWeight: 900, color: '#16a34a' }}>{resumo.confirmadas}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Pendentes</span>
                  <span style={{ fontWeight: 900, color: '#a16207' }}>{resumo.pendentes}</span>
                </div>
              </div>
            </div>

            {/* Dica IA (mock visual) */}
            <div style={{
              border: '1px solid #e9d5ff',
              borderRadius: 14,
              background: '#faf5ff',
              padding: 16
            }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Dica da IA</div>
              <div style={{ fontSize: 12, color: '#444', lineHeight: 1.4 }}>
                Você tem 30 minutos livres entre as sessões. Perfeito para uma pausa!
              </div>
            </div>

            {/* Terapias (mock visual) */}
            <div style={{ border: '1px solid #eee', borderRadius: 14, background: '#fff', padding: 16 }}>
              <div style={{ fontWeight: 900, marginBottom: 12 }}>Terapias Mais Usadas</div>

              {[
                { name: 'Reiki', pct: 35 },
                { name: 'Acupuntura', pct: 25 },
                { name: 'Aromaterapia', pct: 20 },
              ].map((t) => (
                <div key={t.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#444' }}>
                    <span>{t.name}</span>
                    <span style={{ fontWeight: 900 }}>{t.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: '#eee', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
                    <div style={{ width: `${t.pct}%`, height: '100%', background: '#7c3aed' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal: Nova Sessão */}
        <Modal open={modalOpen} title="Nova Sessão" onClose={() => setModalOpen(false)}>
          <form
            style={{ display: 'grid', gap: 12 }}
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveSessao()
            }}
          >
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#444', fontWeight: 700 }}>Paciente ID</label>
              <input
                type="number"
                value={form.pacienteId}
                onChange={(e) => setForm({ ...form, pacienteId: Number(e.target.value) })}
                style={{ border: '1px solid #eee', borderRadius: 12, padding: 10 }}
              />
              <div style={{ fontSize: 12, color: '#6b7280' }}>MVP: depois vamos trocar para buscar por nome.</div>
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#444', fontWeight: 700 }}>Data e hora</label>
              <input
                type="datetime-local"
                value={toDatetimeLocalValue(new Date(form.dataInicio))}
                onChange={(e) => {
                  const local = e.target.value // yyyy-MM-ddTHH:mm
                  const iso = new Date(local).toISOString()
                  setForm({ ...form, dataInicio: iso })
                }}
                style={{ border: '1px solid #eee', borderRadius: 12, padding: 10 }}
              />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#444', fontWeight: 700 }}>Terapia</label>
              <input
                value={form.terapia}
                onChange={(e) => setForm({ ...form, terapia: e.target.value })}
                style={{ border: '1px solid #eee', borderRadius: 12, padding: 10 }}
              />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#444', fontWeight: 700 }}>Duração (minutos)</label>
              <input
                type="number"
                value={form.duracaoMinutos}
                onChange={(e) => setForm({ ...form, duracaoMinutos: Number(e.target.value) })}
                style={{ border: '1px solid #eee', borderRadius: 12, padding: 10 }}
              />
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#444', fontWeight: 700 }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as SessaoStatus })}
                style={{ border: '1px solid #eee', borderRadius: 12, padding: 10 }}
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Concluida">Concluída</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: 12, color: '#444', fontWeight: 700 }}>Observações</label>
              <textarea
                value={form.observacoes ?? ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={4}
                style={{ border: '1px solid #eee', borderRadius: 12, padding: 10, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  border: '1px solid #eee',
                  background: '#fff',
                  borderRadius: 12,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#111827',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 900,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
