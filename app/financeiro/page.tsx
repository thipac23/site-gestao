'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'

type FinanceiroRow = {
  id: number
  quantidade_apurada: number | null
  valor_apurado: number | null
  status_financeiro: string | null
  registros_atividade?: { data?: string; descricao?: string } | null
}

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState<FinanceiroRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('financeiro_registros')
        .select('*, registros_atividade(data, descricao)')
        .order('id', { ascending: false })
        .limit(200)

      if (filtroStatus !== 'todos') {
        query = query.eq('status_financeiro', filtroStatus)
      }

      const { data } = await query
      setRegistros(data || [])
      setLoading(false)
    }
    load()
  }, [filtroStatus])

  const totalApurado = registros.reduce((sum, r) => sum + Number(r.valor_apurado || 0), 0)

  const statusBadge = (status: string | null) => {
    if (!status) return <span className="badge badge-gray">—</span>
    const map: Record<string, string> = { aprovado: 'badge-green', pendente: 'badge-yellow', rejeitado: 'badge-red' }
    return <span className={`badge ${map[status.toLowerCase()] || 'badge-blue'}`}>{status}</span>
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
            <p className="text-sm text-muted-foreground mt-1">Apuração de valores por atividade</p>
          </div>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="input w-44">
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
          </select>
        </div>

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
