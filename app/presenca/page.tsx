'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { PresencaDiaria } from '@/lib/types/database'
import { Users, Plus, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Presente':           'badge-green',
  'Ausente':            'badge-red',
  'Falta Justificada':  'badge-yellow',
  'Afastado':           'badge-gray',
  'Férias':             'badge-blue',
}

export default function PresencaPage() {
  const t = useT()
  const supabase = createClient()
  const [registros, setRegistros] = useState<PresencaDiaria[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => { carregar() }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('presenca_diaria')
      .select('*, colaboradores(nome, matricula), equipes(nome_equipe), funcoes_mao_obra(nome_funcao)')
      .eq('data', dataFiltro)
      .order('id')
    setRegistros(data ?? [])
    setLoading(false)
  }

  const resumo = {
    presente: registros.filter(r => r.status_presenca === 'Presente').length,
    ausente: registros.filter(r => r.status_presenca === 'Ausente').length,
    total: registros.length,
  }

  return (
    <AppShell titulo={t('presenca')}>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              {t('presenca')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Controle de presença diária por colaborador
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={dataFiltro} onChange={e => setDataFiltro(e.target.value)} className="input text-sm w-auto" />
            <button className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus size={15} /> Registrar
            </button>
          </div>
        </div>

        {/* Resumo */}
        {registros.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', valor: resumo.total, cor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
              { label: 'Presentes', valor: resumo.presente, cor: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
              { label: 'Ausentes', valor: resumo.ausente, cor: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
            ].map(item => (
              <div key={item.label} className={`card p-4 ${item.cor}`}>
                <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{item.label}</p>
                <p className="text-3xl font-bold mt-1">{item.valor}</p>
              </div>
            ))}
          </div>
        )}

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
                    {['Colaborador', 'Matrícula', 'Função', 'Equipe', 'Hora', 'Status'].map(col => (
                      <th key={col} className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, idx) => (
                    <tr key={r.id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${idx === registros.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{r.colaboradores?.nome ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.colaboradores?.matricula ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.funcoes_mao_obra?.nome_funcao ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.equipes?.nome_equipe ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.hora_registro ?? '—'}</td>
                      <td className="px-4 py-3"><span className={`badge ${COR_STATUS[r.status_presenca ?? ''] ?? 'badge-gray'}`}>{r.status_presenca ?? '—'}</span></td>
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
