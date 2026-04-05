'use client'
// ============================================================
// Registro de Atividade — RDO Digital
// ============================================================
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { createClient } from '@/lib/supabase/client'
import type { RegistroAtividade } from '@/lib/types/database'
import { ClipboardList, Plus, Loader2, AlertCircle, Image as ImageIcon, Lock, X } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Realizado':         'badge-green',
  'Parcial':           'badge-yellow',
  'Não Realizado':     'badge-red',
  'Cancelado':         'badge-gray',
  'Não Programado':    'badge-blue',
}

// ──── Tipos do formulário ────────────────────────────────────
type FormRegistroAtividade = {
  data: string
  programacao_id: string      // ID do relacionamento
  atividade_id: string        // ID do relacionamento
  equipe_id: string           // ID do relacionamento
  bateria: string
  bloco: string
  forno: string
  lado: string
  status_execucao: string
  percentual: string
}

export default function RegistroAtividadePage() {
  const t = useT()
  const supabase = createClient()
  const { perfil, permissoes, loading: permLoading } = useUserPermissions()
  const [registros, setRegistros] = useState<RegistroAtividade[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_atividade ?? false
  const [formData, setFormData] = useState<FormRegistroAtividade>({
    data: dataFiltro,
    programacao_id: '',
    atividade_id: '',
    equipe_id: '',
    bateria: '',
    bloco: '',
    forno: '',
    lado: '',
    status_execucao: 'Realizado',
    percentual: '100',
  })
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('registros_atividade')
        .select('*, atividades_escopo(*), equipes(*), programacao(os_numero)')
        .eq('data', dataFiltro)
        .order('criado_em', { ascending: false })

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
      setErro('Você não tem permissão para registrar atividades.')
      return
    }

    // Validação rigorosa
    if (!formData.data) { setErro('Data é obrigatória'); return }
    if (!formData.programacao_id) { setErro('Programação é obrigatória'); return }
    if (!formData.atividade_id) { setErro('Atividade é obrigatória'); return }
    if (!formData.equipe_id) { setErro('Equipe é obrigatória'); return }
    if (!formData.status_execucao) { setErro('Status é obrigatório'); return }

    const percentualNum = parseInt(formData.percentual) || 0
    if (percentualNum < 0 || percentualNum > 100) { setErro('Percentual deve ser 0-100'); return }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('registros_atividade').insert({
        data: formData.data,
        programacao_id: parseInt(formData.programacao_id),
        atividade_id: parseInt(formData.atividade_id),
        equipe_id: parseInt(formData.equipe_id),
        bateria: formData.bateria?.trim() || null,
        bloco: formData.bloco?.trim() || null,
        forno: formData.forno?.trim() || null,
        lado: formData.lado?.trim() || null,
        status_execucao: formData.status_execucao,
        percentual: percentualNum,
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        data: dataFiltro,
        programacao_id: '',
        atividade_id: '',
        equipe_id: '',
        bateria: '',
        bloco: '',
        forno: '',
        lado: '',
        status_execucao: 'Realizado',
        percentual: '100',
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
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode registrar atividades.`}
              className={`flex items-center gap-2 text-sm py-2 ${
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
                <label className="label text-xs font-medium">Programação (ID)*</label>
                <input
                  type="number"
                  placeholder="ID da programação"
                  value={formData.programacao_id}
                  onChange={e => setFormData({ ...formData, programacao_id: e.target.value })}
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
                <label className="label text-xs font-medium">Bloco</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={formData.bloco}
                  onChange={e => setFormData({ ...formData, bloco: e.target.value })}
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
                <label className="label text-xs font-medium">Lado</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={formData.lado}
                  onChange={e => setFormData({ ...formData, lado: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Status*</label>
                <select
                  value={formData.status_execucao}
                  onChange={e => setFormData({ ...formData, status_execucao: e.target.value })}
                  className="input text-sm"
                  required
                >
                  <option>Realizado</option>
                  <option>Parcial</option>
                  <option>Não Realizado</option>
                  <option>Cancelado</option>
                  <option>Não Programado</option>
                </select>
              </div>

              <div>
                <label className="label text-xs font-medium">Percentual (%)*</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={formData.percentual}
                  onChange={e => setFormData({ ...formData, percentual: e.target.value })}
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
              {submitting ? '⏳ Salvando...' : '✓ Salvar Registro'}
            </button>
          </form>
        )}

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
