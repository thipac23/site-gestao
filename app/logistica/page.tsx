'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { SolicitacaoMaterial } from '@/lib/types/database'
import { Package, Plus, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Pendente':       'badge-yellow',
  'Em Separação':   'badge-blue',
  'Entregue':       'badge-green',
  'Cancelado':      'badge-gray',
}

export default function LogisticaPage() {
  const t = useT()
  const supabase = createClient()
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => { carregar() }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('solicitacoes_materiais')
      .select('*, materiais(*), usuarios(nome)')
      .eq('data', dataFiltro)
      .order('id', { ascending: false })
    setSolicitacoes(data ?? [])
    setLoading(false)
  }

  return (
    <AppShell titulo={t('logistica')}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              {t('logistica')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Solicitações de materiais por atividade
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} className="input text-sm w-auto" />
            <button className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus size={15} /> Nova Solicitação
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 size={22} className="animate-spin text-blue-600" /></div>
          ) : solicitacoes.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-2 text-slate-400">
              <AlertCircle size={28} /><p className="text-sm">{t('sem_dados')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {['Material', 'Qtd', 'Un.', 'Solicitante', 'Retirada', 'Entrega', 'Status'].map(col => (
                      <th key={col} className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((s, idx) => (
                    <tr key={s.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${idx === solicitacoes.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{s.materiais?.nome_material ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.quantidade ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.unidade ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.usuarios?.nome ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[120px] truncate">{s.local_retirada ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-[120px] truncate">{s.local_entrega ?? '—'}</td>
                      <td className="px-4 py-3"><span className={`badge ${COR_STATUS[s.status_solicitacao ?? ''] ?? 'badge-gray'}`}>{s.status_solicitacao ?? '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
