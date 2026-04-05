'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import { Usuario } from '@/lib/types/database'

type UsuarioComPerfil = Usuario & { perfis?: { nome_perfil: string } | null }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioComPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('usuarios')
        .select('*, perfis(nome_perfil)')
        .order('nome')
      setUsuarios(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtrados = usuarios.filter(u =>
    !busca ||
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase()) ||
    u.empresa?.toLowerCase().includes(busca.toLowerCase())
  )

  const totalAtivos = usuarios.filter(u => u.ativo).length

  const perfilBadge = (perfil: string | undefined) => {
    if (!perfil) return <span className="badge badge-gray">—</span>
    const map: Record<string, string> = {
      Administrador: 'badge-red',
      Planejamento: 'badge-blue',
      Supervisor: 'badge-blue',
      Lider: 'badge-green',
      Cliente: 'badge-yellow',
      Financeiro: 'badge-yellow',
      Consulta: 'badge-gray',
    }
    return <span className={`badge ${map[perfil] || 'badge-gray'}`}>{perfil}</span>
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">{totalAtivos} ativos de {usuarios.length} cadastrados</p>
          </div>
          <input
            type="search"
            placeholder="Buscar por nome, e-mail ou empresa..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="input w-72"
          />
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Nome','E-mail','Perfil','Empresa','Status','Criado em'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum usuário encontrado</td></tr>
                ) : filtrados.map(u => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          {u.nome?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">{perfilBadge(u.perfis?.nome_perfil)}</td>
                    <td className="px-4 py-3">{u.empresa || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.ativo ? 'badge-green' : 'badge-gray'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {u.criado_em ? new Date(u.criado_em).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
