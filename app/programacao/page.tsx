'use client'
// ============================================================
// Programação — Lista e criação de programações diárias
// ============================================================
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { createClient } from '@/lib/supabase/client'
import type { Programacao } from '@/lib/types/database'
import { CalendarDays, Plus, Loader2, AlertCircle, Lock, X } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Programado':    'badge-blue',
  'Em Execução':   'badge-yellow',
  'Concluído':     'badge-green',
  'Cancelado':     'badge-red',
  'Não Realizado': 'badge-gray',
}

// ──── Tipos do formulário ────────────────────────────────────
type FormProgramacao = {
  data: string
  os_numero: string
  bateria: string
  bloco: string
  forno: string
  lado: string
  atividade_escopo_id: string  // ID do relacionamento
  equipe_id: string             // ID do relacionamento
  status_programacao: string
}

export default function ProgramacaoPage() {
  const t = useT()
  const supabase = createClient()
  const { perfil, permissoes, loading: permLoading } = useUserPermissions()
  const [programacoes, setProgramacoes] = useState<Programacao[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_programacao ?? false
  const [formData, setFormData] = useState<FormProgramacao>({
    data: dataFiltro,
    os_numero: '',
    bateria: '',
    bloco: '',
    forno: '',
    lado: '',
    atividade_escopo_id: '',
    equipe_id: '',
    status_programacao: 'Programado',
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
        .from('programacao')
        .select('*, atividades_escopo(*), equipes(*), usuarios(nome)')
        .eq('data', dataFiltro)
        .order('id', { ascending: false })

      if (error) throw error
      setProgramacoes(data ?? [])
    } catch (err) {
      console.error('Erro ao carregar:', err)
      setProgramacoes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // 🔒 Verificar permissão
    if (!canCreate) {
      setErro('Você não tem permissão para registrar programações.')
      return
    }

    // Validação rigorosa
    if (!formData.data) { setErro('Data é obrigatória'); return }
    if (!formData.os_numero.trim()) { setErro('OS é obrigatória'); return }
    if (!formData.bateria.trim()) { setErro('Bateria é obrigatória'); return }
    if (!formData.atividade_escopo_id) { setErro('Atividade é obrigatória'); return }
    if (!formData.equipe_id) { setErro('Equipe é obrigatória'); return }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('programacao').insert({
        data: formData.data,
        os_numero: formData.os_numero.trim(),
        bateria: formData.bateria.trim(),
        bloco: formData.bloco?.trim() || null,
        forno: formData.forno?.trim() || null,
        lado: formData.lado?.trim() || null,
        atividade_id: parseInt(formData.atividade_escopo_id),
        equipe_id: parseInt(formData.equipe_id),
        status_programacao: formData.status_programacao,
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        data: dataFiltro,
        os_numero: '',
        bloco: '',
        forno: '',
        lado: '',
        bateria: '',
        atividade_escopo_id: '',
        equipe_id: '',
        status_programacao: 'Programado',
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
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode registrar programações.`}
              className={`flex items-center gap-2 text-sm py-2 ${
                canCreate
                  ? 'btn-primary'
                  : 'px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {canCreate ? <Plus size={15} /> : <Lock size={15} />}
              {showForm ? 'Cancelar' : 'Nova OS'}
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
                <label className="label text-xs font-medium">OS / Número*</label>
                <input
                  type="text"
                  placeholder="Ex: OS-001"
                  value={formData.os_numero}
                  onChange={e => setFormData({ ...formData, os_numero: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Bateria*</label>
                <input
                  type="text"
                  placeholder="Ex: Bateria A"
                  value={formData.bateria}
                  onChange={e => setFormData({ ...formData, bateria: e.target.value })}
                  className="input text-sm"
                  required
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
                <label className="label text-xs font-medium">Atividade (ID)*</label>
                <input
                  type="number"
                  placeholder="ID da atividade"
                  value={formData.atividade_escopo_id}
                  onChange={e => setFormData({ ...formData, atividade_escopo_id: e.target.value })}
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
                <label className="label text-xs font-medium">Status</label>
                <select
                  value={formData.status_programacao}
                  onChange={e => setFormData({ ...formData, status_programacao: e.target.value })}
                  className="input text-sm"
                >
                  <option>Programado</option>
                  <option>Em Execução</option>
                  <option>Concluído</option>
                  <option>Cancelado</option>
                  <option>Não Realizado</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? '⏳ Salvando...' : '✓ Salvar Programação'}
            </button>
          </form>
        )}

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
