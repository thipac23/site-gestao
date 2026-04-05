'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import { Usuario } from '@/lib/types/database'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { Plus, AlertCircle, Loader2, Lock } from 'lucide-react'

type UsuarioComPerfil = Usuario & { perfis?: { nome_perfil: string } | null }

// ──── Tipos do formulário ────────────────────────────────────
type FormUsuario = {
  nome: string
  email: string
  empresa: string
  perfil_id: string
  ativo: boolean
}

export default function UsuariosPage() {
  const { perfil, permissoes } = useUserPermissions()
  const [usuarios, setUsuarios] = useState<UsuarioComPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_usuarios ?? false
  const [formData, setFormData] = useState<FormUsuario>({
    nome: '',
    email: '',
    empresa: '',
    perfil_id: '',
    ativo: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, perfis(nome_perfil)')
        .order('nome')

      if (error) throw error
      setUsuarios(data || [])
    } catch (err) {
      console.error('Erro ao carregar:', err)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // 🔒 Verificar permissão
    if (!canCreate) {
      setErro('Você não tem permissão para criar usuários.')
      return
    }

    // Validação rigorosa
    if (!formData.nome.trim()) { setErro('Nome é obrigatório'); return }
    if (!formData.email.trim()) { setErro('E-mail é obrigatório'); return }
    if (!formData.email.includes('@')) { setErro('E-mail inválido'); return }
    if (!formData.perfil_id) { setErro('Perfil é obrigatório'); return }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('usuarios').insert({
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        empresa: formData.empresa?.trim() || null,
        perfil_id: parseInt(formData.perfil_id),
        ativo: formData.ativo,
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        nome: '',
        email: '',
        empresa: '',
        perfil_id: '',
        ativo: true,
      })
      setShowForm(false)
      carregar()
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setErro(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">{totalAtivos} ativos de {usuarios.length} cadastrados</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Buscar por nome, e-mail ou empresa..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="input text-sm"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode criar usuários.`}
              className={`flex items-center gap-2 text-sm py-2 whitespace-nowrap ${
                canCreate
                  ? 'btn-primary'
                  : 'px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {canCreate ? <Plus size={15} /> : <Lock size={15} />}
              {showForm ? 'Cancelar' : 'Novo Usuário'}
            </button>
          </div>
        </div>

        {/* Formulário de criação */}
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            {erro && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs font-medium">Nome*</label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">E-mail*</label>
                <input
                  type="email"
                  placeholder="Ex: joao@empresa.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Empresa</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={formData.empresa}
                  onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Perfil (ID)*</label>
                <input
                  type="number"
                  placeholder="ID do perfil"
                  value={formData.perfil_id}
                  onChange={e => setFormData({ ...formData, perfil_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div className="col-span-full">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Ativo</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? '⏳ Salvando...' : '✓ Criar Usuário'}
            </button>
          </form>
        )}

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
