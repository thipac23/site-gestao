'use client'
// ============================================================
// Programação — Lista e criação de programações diárias
// ============================================================
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { Programacao } from '@/lib/types/database'
import { CalendarDays, Plus, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Programado':    'badge-blue',
  'Em Execução':   'badge-yellow',
  'Concluído':     'badge-green',
  'Cancelado':     'badge-red',
  'Não Realizado': 'badge-gray',
}

export default function ProgramacaoPage() {
  const t = useT()
  const supabase = createClient()
  const [programacoes, setProgramacoes] = useState<Programacao[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    carregar()
  }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('programacao')
      .select('*, atividades_escopo(*), equipes(*), usuarios(nome)')
      .eq('data', dataFiltro)
      .order('id', { ascending: false })
    setProgramacoes(data ?? [])
    setLoading(false)
  }

  return (
    <AppShell titulo={t('programacao')}>
      <div className="space-y-5">

        {/* Header da página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={20} className="text-blue-600" />
              {t('programacao')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Programação diária de atividades por bateria / forno
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dataFiltro}
              onChange={e => setDataFiltro(e.target.value)}
              className="input text-sm w-auto"
            />
            <button className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus size={15} />
              Nova OS
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 size={22} className="animate-spin text-blue-600" />
            </div>
          ) : programacoes.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
              <AlertCircle size={28} />
              <p className="text-sm">{t('sem_dados')}</p>
              <p className="text-xs">Nenhuma programação para {format(new Date(dataFiltro + 'T12:00'), 'dd/MM/yyyy')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {['OS', 'Bateria', 'Bloco', 'Forno', 'Lado', 'Atividade', 'Equipe', 'Status'].map(col => (
                      <th key={col} className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programacoes.map((p, idx) => (
                    <tr key={p.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${idx === programacoes.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {p.os_numero ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{p.bateria ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.bloco ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.forno ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.lado ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                        {p.atividades_escopo?.nome_atividade ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {p.equipes?.nome_equipe ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${COR_STATUS[p.status_programacao ?? ''] ?? 'badge-gray'}`}>
                          {p.status_programacao ?? '—'}
                        </span>
                      </td>
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
