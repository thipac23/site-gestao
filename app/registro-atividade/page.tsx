'use client'
// ============================================================
// Registro de Atividade — RDO Digital
// ============================================================
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { RegistroAtividade } from '@/lib/types/database'
import { ClipboardList, Plus, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Realizado':         'badge-green',
  'Parcial':           'badge-yellow',
  'Não Realizado':     'badge-red',
  'Cancelado':         'badge-gray',
  'Não Programado':    'badge-blue',
}

export default function RegistroAtividadePage() {
  const t = useT()
  const supabase = createClient()
  const [registros, setRegistros] = useState<RegistroAtividade[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    carregar()
  }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    const { data } = await supabase
      .from('registros_atividade')
      .select('*, atividades_escopo(*), equipes(*), programacao(os_numero)')
      .eq('data', dataFiltro)
      .order('criado_em', { ascending: false })
    setRegistros(data ?? [])
    setLoading(false)
  }

  return (
    <AppShell titulo={t('registro_atividade')}>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-blue-600" />
              {t('registro_atividade')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Registro de execução diária de campo
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
              Novo Registro
            </button>
          </div>
        </div>

        {/* Grid de cards de registros */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-blue-600" />
          </div>
        ) : registros.length === 0 ? (
          <div className="card p-16 flex flex-col items-center gap-3 text-slate-400">
            <AlertCircle size={28} />
            <p className="text-sm">{t('sem_dados')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {registros.map(r => (
              <div key={r.id} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
                {/* Header do card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <ClipboardList size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {r.programacao?.os_numero ?? 'S/OS'}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[140px]">
                        {r.atividades_escopo?.nome_atividade ?? '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${COR_STATUS[r.status_execucao ?? ''] ?? 'badge-gray'}`}>
                    {r.status_execucao ?? '—'}
                  </span>
                </div>

                {/* Localização */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Bat.', valor: r.bateria },
                    { label: 'Bloco', valor: r.bloco },
                    { label: 'Forno', valor: r.forno },
                    { label: 'Lado', valor: r.lado },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-400 uppercase">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                        {item.valor ?? '—'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Percentual */}
                {r.percentual != null && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Execução</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {r.percentual}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${r.percentual >= 100 ? 'bg-green-500' : r.percentual >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(r.percentual, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{r.equipes?.nome_equipe ?? '—'}</span>
                  <div className="flex items-center gap-1.5">
                    {r.foto_inicial_url && (
                      <span className="flex items-center gap-0.5 text-blue-500">
                        <ImageIcon size={11} /> Foto
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
