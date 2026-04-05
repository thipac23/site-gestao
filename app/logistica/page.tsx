'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { SolicitacaoMaterial } from '@/lib/types/database'
import { useUserPermissions } from '@/lib/hooks/useUserPermissions'
import { Package, Plus, Loader2, AlertCircle, Lock, X } from 'lucide-react'
import { format } from 'date-fns'

const COR_STATUS: Record<string, string> = {
  'Pendente':       'badge-yellow',
  'Em Separação':   'badge-blue',
  'Entregue':       'badge-green',
  'Cancelado':      'badge-gray',
}

// ──── Tipos do formulário ────────────────────────────────────
type FormSolicitacao = {
  data: string
  material_id: string       // ID do relacionamento
  quantidade: string
  unidade: string
  usuario_id: string        // ID do relacionamento (solicitante)
  local_retirada: string
  local_entrega: string
  status_solicitacao: string
}

export default function LogisticaPage() {
  const t = useT()
  const supabase = createClient()
  const { perfil, permissoes } = useUserPermissions()
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [dataFiltro, setDataFiltro] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showForm, setShowForm] = useState(false)
  const canCreate = permissoes?.create_logistica ?? false
  const [formData, setFormData] = useState<FormSolicitacao>({
    data: dataFiltro,
    material_id: '',
    quantidade: '',
    unidade: '',
    usuario_id: '',
    local_retirada: '',
    local_entrega: '',
    status_solicitacao: 'Pendente',
  })
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar() }, [dataFiltro])

  async function carregar() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('solicitacoes_materiais')
        .select('*, materiais(*), usuarios(nome)')
        .eq('data', dataFiltro)
        .order('id', { ascending: false })

      if (error) throw error
      setSolicitacoes(data ?? [])
    } catch (err) {
      console.error('Erro ao carregar:', err)
      setSolicitacoes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    // 🔒 Verificar permissão
    if (!canCreate) {
      setErro('Você não tem permissão para registrar solicitações de materiais.')
      return
    }

    // Validação rigorosa
    if (!formData.data) { setErro('Data é obrigatória'); return }
    if (!formData.material_id) { setErro('Material é obrigatório'); return }
    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) { setErro('Quantidade deve ser maior que 0'); return }
    if (!formData.unidade.trim()) { setErro('Unidade é obrigatória'); return }
    if (!formData.usuario_id) { setErro('Solicitante é obrigatório'); return }
    if (!formData.local_retirada.trim()) { setErro('Local de retirada é obrigatório'); return }
    if (!formData.local_entrega.trim()) { setErro('Local de entrega é obrigatório'); return }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('solicitacoes_materiais').insert({
        data: formData.data,
        material_id: parseInt(formData.material_id),
        quantidade: parseInt(formData.quantidade),
        unidade: formData.unidade.trim(),
        usuario_id: parseInt(formData.usuario_id),
        local_retirada: formData.local_retirada.trim(),
        local_entrega: formData.local_entrega.trim(),
        status_solicitacao: formData.status_solicitacao,
      })

      if (error) throw error

      // Sucesso: limpa e recarrega
      setFormData({
        data: dataFiltro,
        material_id: '',
        quantidade: '',
        unidade: '',
        usuario_id: '',
        local_retirada: '',
        local_entrega: '',
        status_solicitacao: 'Pendente',
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
            <button
              onClick={() => setShowForm(!showForm)}
              disabled={!canCreate}
              title={canCreate ? '' : `Acesso restrito. Seu perfil (${perfil}) não pode registrar solicitações.`}
              className={`flex items-center gap-2 text-sm py-2 ${
                canCreate
                  ? 'btn-primary'
                  : 'px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
              }`}
            >
              {canCreate ? <Plus size={15} /> : <Lock size={15} />}
              {showForm ? 'Cancelar' : 'Nova Solicitação'}
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
                <label className="label text-xs font-medium">Material (ID)*</label>
                <input
                  type="number"
                  placeholder="ID do material"
                  value={formData.material_id}
                  onChange={e => setFormData({ ...formData, material_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Quantidade*</label>
                <input
                  type="number"
                  placeholder="Quantidade"
                  min="1"
                  value={formData.quantidade}
                  onChange={e => setFormData({ ...formData, quantidade: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Unidade*</label>
                <input
                  type="text"
                  placeholder="Ex: kg, m, un"
                  value={formData.unidade}
                  onChange={e => setFormData({ ...formData, unidade: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Solicitante (ID)*</label>
                <input
                  type="number"
                  placeholder="ID do usuário"
                  value={formData.usuario_id}
                  onChange={e => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="label text-xs font-medium">Status*</label>
                <select
                  value={formData.status_solicitacao}
                  onChange={e => setFormData({ ...formData, status_solicitacao: e.target.value })}
                  className="input text-sm"
                  required
                >
                  <option>Pendente</option>
                  <option>Em Separação</option>
                  <option>Entregue</option>
                  <option>Cancelado</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="label text-xs font-medium">Local de Retirada*</label>
                <input
                  type="text"
                  placeholder="Ex: Almoxarifado A"
                  value={formData.local_retirada}
                  onChange={e => setFormData({ ...formData, local_retirada: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div className="col-span-full">
                <label className="label text-xs font-medium">Local de Entrega*</label>
                <input
                  type="text"
                  placeholder="Ex: Frente de Obra A"
                  value={formData.local_entrega}
                  onChange={e => setFormData({ ...formData, local_entrega: e.target.value })}
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
              {submitting ? '⏳ Salvando...' : '✓ Registrar Solicitação'}
            </button>
          </form>
        )}

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
