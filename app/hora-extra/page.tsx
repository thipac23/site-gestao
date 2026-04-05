'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { RegistroHoraExtra } from '@/lib/types/database'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { Clock, Plus, Loader2, AlertCircle, Lock, X } from 'lucide-react'
import { format } from 'date-fns'

// ──── Tipos do formulário ────────────────────────────────────
type FormHoraExtra = {
  data: string
  atividade_id: string       // ID do relacionamento
  equipe_id: string          // ID do relacionamento
  contrato_id: string        // ID do relacionamento
  bateria: string
  forno: string
  hora_inicio: string
  hora_fim: string
}

export default function HoraExtraPage() {
  const t = useT()
  const supabase = createClient()
  const { perfil, permissoes } = useUserPermissions()
  const [registros, setRegistros] = useState<RegistroHoraExtra[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_hora_extra ?? false
  const [formData, setFormData] = useState<FormHoraExtra>({
    data: dataFiltro,
    atividade_id: '',
    equipe_id: '',
    contrato_id: '',
    bateria: '',
    forno: '',
    hora_inicio: '',
    hora_fim: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('registros_hora_extra')
        .select('*, atividades_escopo(nome_atividade), equipes(nome_equipe), contratos(nome_contrato)')
        .eq('data', dataFiltro)
        .order('id', { ascending: false })

      if (error) throw error
      setRegistros(data ?? [])
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
      setErro('Você não tem permissão para registrar horas extras.')
      return
    }

    // Validação rigorosa
    if (!formData.data) { setErro('Data é obrigatória'); return }
    if (!formData.atividade_id) { setErro('Atividade é obrigatória'); return }
    if (!formData.equipe_id) { setErro('Equipe é obrigatória'); return }
    if (!formData.contrato_id) { setErro('Contrato é obrigatório'); return }
    if (!formData.hora_inicio) { setErro('Hora de início é obrigatória'); return }
    if (!formData.hora_fim) { setErro('Hora de fim é obrigatória'); return }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('registros_hora_extra').insert({
        data: formData.data,
        atividade_id: parseInt(formData.atividade_id),
        equipe_id: parseInt(formData.equipe_id),
        contrato_id: parseInt(formData.contrato_id),
        bateria: formData.bateria?.trim() || null,
        forno: formData.forno?.trim() || null,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        data: dataFiltro,
        atividade_id: '',
        equipe_id: '',
        contrato_id: '',
        bateria: '',
        forno: '',
        hora_inicio: '',
        hora_fim: '',
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
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode registrar horas extras.`}
              className={`flex items-center gap-2 text-sm py-2 ${
                canCreate
                  ? 'btn-primary'
                  : 'px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {canCreate ? <Plus size={15} /> : <Lock size={15} />}
              {showForm ? 'Cancelar' : 'Nova HE'}
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
                <label className="label text-xs font-medium">Data*</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={e => setFormData({ ...formData, data: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Atividade (ID)*</label>
                <input
                  type="number"
                  placeholder="ID da atividade"
                  value={formData.atividade_id}
                  onChange={e => setFormData({ ...formData, atividade_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Equipe (ID)*</label>
                <input
                  type="number"
                  placeholder="ID da equipe"
                  value={formData.equipe_id}
                  onChange={e => setFormData({ ...formData, equipe_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Contrato (ID)*</label>
                <input
                  type="number"
                  placeholder="ID do contrato"
                  value={formData.contrato_id}
                  onChange={e => setFormData({ ...formData, contrato_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Bateria</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={formData.bateria}
                  onChange={e => setFormData({ ...formData, bateria: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Forno</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={formData.forno}
                  onChange={e => setFormData({ ...formData, forno: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Hora de Início*</label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Hora de Fim*</label>
                <input
                  type="time"
                  value={formData.hora_fim}
                  onChange={e => setFormData({ ...formData, hora_fim: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? '⏳ Salvando...' : '✓ Registrar Hora Extra'}
            </button>
          </form>
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
