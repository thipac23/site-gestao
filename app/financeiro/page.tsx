'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { Plus, Loader2, AlertCircle, Lock } from 'lucide-react'

type FinanceiroRow = {
  id: number
  quantidade_apurada: number | null
  valor_apurado: number | null
  status_financeiro: string | null
  registros_atividade?: { data?: string; descricao?: string } | null
}

// ──── Tipos do formulário ────────────────────────────────────
type FormFinanceiro = {
  registros_atividade_id: string
  quantidade_apurada: string
  status_financeiro: string
}

export default function FinanceiroPage() {
  const { perfil, permissoes } = useUserPermissions()
  const [registros, setRegistros] = useState<FinanceiroRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_financeiro ?? false
  const [formData, setFormData] = useState<FormFinanceiro>({
    registros_atividade_id: '',
    quantidade_apurada: '',
    status_financeiro: 'pendente',
  })
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [filtroStatus])

  async function carregar() {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase
        .from('financeiro_registros')
        .select('*, registros_atividade(data, descricao)')
        .order('id', { ascending: false })
        .limit(200)

      if (filtroStatus !== 'todos') {
        query = query.eq('status_financeiro', filtroStatus)
      }

      const { data, error } = await query
      if (error) throw error
      setRegistros(data || [])
    } catch (err) {
      console.error('Erro ao carregar:', err)
      setRegistros([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // 🔒 Verificar permissão
    if (!canCreate) {
      setErro('Você não tem permissão para registrar apurações financeiras.')
      return
    }

    // Validação rigorosa
    if (!formData.registros_atividade_id) { setErro('Atividade é obrigatória'); return }
    if (!formData.quantidade_apurada || parseInt(formData.quantidade_apurada) <= 0) { setErro('Quantidade deve ser maior que 0'); return }
    if (!formData.status_financeiro) { setErro('Status é obrigatório'); return }

    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from('financeiro_registros').insert({
        registros_atividade_id: parseInt(formData.registros_atividade_id),
        quantidade_apurada: parseInt(formData.quantidade_apurada),
        status_financeiro: formData.status_financeiro,
        // NOTA: valor_apurado é CALCULADO pelo banco, nunca inserido manualmente
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        registros_atividade_id: '',
        quantidade_apurada: '',
        status_financeiro: 'pendente',
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

  const totalApurado = registros.reduce((sum, r) => sum + Number(r.valor_apurado || 0), 0)

  const statusBadge = (status: string | null) => {
    if (!status) return <span className="badge badge-gray">—</span>
    const map: Record<string, string> = { aprovado: 'badge-green', pendente: 'badge-yellow', rejeitado: 'badge-red' }
    return <span className={`badge ${map[status.toLowerCase()] || 'badge-blue'}`}>{status}</span>
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
            <p className="text-sm text-muted-foreground mt-1">Apuração de valores por atividade</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="input text-sm">
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode registrar apurações financeiras.`}
              className={`flex items-center gap-2 text-sm py-2 whitespace-nowrap ${
                canCreate
                  ? 'btn-primary'
                  : 'px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {canCreate ? <Plus size={15} /> : <Lock size={15} />}
              {showForm ? 'Cancelar' : 'Novo Registro'}
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

            <p className="text-xs text-slate-600 dark:text-slate-400 italic">
              ℹ️ O valor apurado é calculado automaticamente pela matriz de preços
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs font-medium">Registro de Atividade (ID)*</label>
                <input
                  type="number"
                  placeholder="ID do registro de atividade"
                  value={formData.registros_atividade_id}
                  onChange={e => setFormData({ ...formData, registros_atividade_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Quantidade Apurada*</label>
                <input
                  type="number"
                  placeholder="Quantidade"
                  min="1"
                  value={formData.quantidade_apurada}
                  onChange={e => setFormData({ ...formData, quantidade_apurada: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Status*</label>
                <select
                  value={formData.status_financeiro}
                  onChange={e => setFormData({ ...formData, status_financeiro: e.target.value })}
                  className="input text-sm"
                  required
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? '⏳ Salvando...' : '✓ Registrar Apuração'}
            </button>
          </form>
        )}

        {/* Cards resumo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Apurado</p>
            <p className="text-2xl font-bold text-foreground">
              {registros.length > 0 ? `R$ ${totalApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Registros</p>
            <p className="text-2xl font-bold text-foreground">{registros.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-500">
              {registros.filter(r => r.status_financeiro?.toLowerCase() === 'pendente').length}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['ID','Atividade','Data','Qtd Apurada','Valor Apurado','Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : registros.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum registro encontrado</td></tr>
                ) : registros.map(r => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">#{r.id}</td>
                    <td className="px-4 py-3">{r.registros_atividade?.descricao?.substring(0, 40) || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.registros_atividade?.data || '—'}</td>
                    <td className="px-4 py-3 text-center">{r.quantidade_apurada ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {r.valor_apurado != null ? `R$ ${Number(r.valor_apurado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(r.status_financeiro)}</td>
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
