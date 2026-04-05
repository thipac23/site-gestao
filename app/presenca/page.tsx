'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { createClient } from '@/lib/supabase/client'
import type { PresencaDiaria } from '@/lib/types/database'
import { Users, Plus, Loader2, AlertCircle, Lock, X } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Presente':           'badge-green',
  'Ausente':            'badge-red',
  'Falta Justificada':  'badge-yellow',
  'Afastado':           'badge-gray',
  'Férias':             'badge-blue',
}

// ──── Tipos do formulário ────────────────────────────────────
type FormPresenca = {
  data: string
  colaborador_id: string    // ID do relacionamento
  equipe_id: string         // ID do relacionamento
  funcao_id: string         // ID do relacionamento (função/mão de obra)
  status_presenca: string
  hora_registro: string
}

export default function PresencaPage() {
  const t = useT()
  const supabase = createClient()
  const { perfil, permissoes } = useUserPermissions()
  const [registros, setRegistros] = useState<PresencaDiaria[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_presenca ?? false
  const [formData, setFormData] = useState<FormPresenca>({
    data: dataFiltro,
    colaborador_id: '',
    equipe_id: '',
    funcao_id: '',
    status_presenca: 'Presente',
    hora_registro: format(new Date(), 'HH:mm'),
  })
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('presenca_diaria')
        .select('*, colaboradores(nome, matricula), equipes(nome_equipe), funcoes_mao_obra(nome_funcao)')
        .eq('data', dataFiltro)
        .order('id')

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
      setErro('Você não tem permissão para registrar presença.')
      return
    }

    // Validação rigorosa
    if (!formData.data) { setErro('Data é obrigatória'); return }
    if (!formData.colaborador_id) { setErro('Colaborador é obrigatório'); return }
    if (!formData.equipe_id) { setErro('Equipe é obrigatória'); return }
    if (!formData.funcao_id) { setErro('Função é obrigatória'); return }
    if (!formData.status_presenca) { setErro('Status é obrigatório'); return }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('presenca_diaria').insert({
        data: formData.data,
        colaborador_id: parseInt(formData.colaborador_id),
        equipe_id: parseInt(formData.equipe_id),
        funcao_id: parseInt(formData.funcao_id),
        status_presenca: formData.status_presenca,
        hora_registro: formData.hora_registro || null,
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        data: dataFiltro,
        colaborador_id: '',
        equipe_id: '',
        funcao_id: '',
        status_presenca: 'Presente',
        hora_registro: format(new Date(), 'HH:mm'),
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
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode registrar presença.`}
              className={`flex items-center gap-2 text-sm py-2 ${
                canCreate
                  ? 'btn-primary'
                  : 'px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {canCreate ? <Plus size={15} /> : <Lock size={15} />}
              {showForm ? 'Cancelar' : 'Registrar'}
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
                <label className="label text-xs font-medium">Colaborador (ID)*</label>
                <input
                  type="number"
                  placeholder="ID do colaborador"
                  value={formData.colaborador_id}
                  onChange={e => setFormData({ ...formData, colaborador_id: e.target.value })}
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
                <label className="label text-xs font-medium">Função (ID)*</label>
                <input
                  type="number"
                  placeholder="ID da função"
                  value={formData.funcao_id}
                  onChange={e => setFormData({ ...formData, funcao_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Hora do Registro</label>
                <input
                  type="time"
                  value={formData.hora_registro}
                  onChange={e => setFormData({ ...formData, hora_registro: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Status*</label>
                <select
                  value={formData.status_presenca}
                  onChange={e => setFormData({ ...formData, status_presenca: e.target.value })}
                  className="input text-sm"
                  required
                >
                  <option>Presente</option>
                  <option>Ausente</option>
                  <option>Falta Justificada</option>
                  <option>Afastado</option>
                  <option>Férias</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? '⏳ Salvando...' : '✓ Registrar Presença'}
            </button>
          </form>
        )}

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
