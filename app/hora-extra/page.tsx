'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { RegistroHoraExtra } from '@/lib/types/database'
import { Clock, Plus, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function HoraExtraPage() {
  const t = useT()
  const supabase = createClient()
  const [registros, setRegistros] = useState<RegistroHoraExtra[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => { carregar() }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('registros_hora_extra')
      .select('*, atividades_escopo(nome_atividade), equipes(nome_equipe), contratos(nome_contrato)')
      .eq('data', dataFiltro)
      .order('id', { ascending: false })
    setRegistros(data ?? [])
    setLoading(false)
  }

  function calcHoras(inicio: string | null, fim: string | null): string {
    if (!inicio || !fim) return '—'
    const [hi, mi] = inicio.split(':').map(Number)
    const [hf, mf] = fim.split(':').map(Number)
    const diff = (hf * 60 + mf) - (hi * 60 + mi)
    if (diff <= 0) return '—'
    return `${Math.floor(diff / 60)}h${String(diff % 60).padStart(2, '0')}m`
  }

  return (
    <AppShell titulo={t('hora_extra')}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              {t('hora_extra')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Registro de horas extras por atividade e equipe
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} className="input text-sm w-auto" />
            <button className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus size={15} /> Nova HE
            </button>
          </div>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 size={22} className="animate-spin text-blue-600" /></div>
          ) : registros.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-2 text-slate-400">
              <AlertCircle size={28} /><p className="text-sm">{t('sem_dados')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {['Atividade', 'Equipe', 'Contrato', 'Bat/Forno', 'Início', 'Fim', 'Total'].map(col => (
                      <th key={col} className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, idx) => (
                    <tr key={r.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${idx === registros.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200 max-w-[180px] truncate">{r.atividades_escopo?.nome_atividade ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.equipes?.nome_equipe ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.contratos?.nome_contrato ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {[r.bateria, r.forno].filter(Boolean).join(' / ') || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{r.hora_inicio ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{r.hora_fim ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-blue">{calcHoras(r.hora_inicio, r.hora_fim)}</span>
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
