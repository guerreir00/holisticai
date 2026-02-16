import { useEffect, useState } from 'react'
import type { Paciente } from '../types/Paciente.ts'
import { criarPaciente, listarPacientes } from '../services/pacientesService'

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [observacoes, setObservacoes] = useState('')

  async function carregar() {
    try {
      setLoading(true)
      setError(null)
      const data = await listarPacientes()
      setPacientes(data)
    } catch (e) {
      setError('Falha ao carregar pacientes.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    try {
      await criarPaciente({
        nome,
        email,
        telefone,
        dataNascimento: null,
        observacoes
      })

      setNome('')
      setEmail('')
      setTelefone('')
      setObservacoes('')

      await carregar()
    } catch (e) {
      alert('Erro ao cadastrar paciente')
      console.error(e)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>Pacientes</h1>

      <form onSubmit={onSubmit} style={{ margin: '16px 0', padding: 16, border: '1px solid #ddd' }}>
        <h2>Novo paciente</h2>

        <div style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <textarea
            placeholder="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />

          <button type="submit">Cadastrar</button>
        </div>
      </form>

      <h2>Lista</h2>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && (
        <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Id</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.email}</td>
                <td>{p.telefone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
