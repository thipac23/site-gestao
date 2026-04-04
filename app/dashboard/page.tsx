'use client'
// ============================================================
// Dashboard inicial — PGO Operacional
// Lê tabela usuarios + métricas do dia
// ============================================================
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/lib/hooks/useAuth'
import { useT } from '@/lib/hooks/useAppStore'
import { createClient } from '@/lib/supabase/client'
import type { Usuario, MetricaDiaria } from '@/lib/types/database'
import {
  Users, CalendarDays, CheckCircle2, XCircle, Clock,
  TrendingUp, Activity, Loader2, AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Componente de card de KPI ────────────────────────────
function KpiCard({
  label, valor, unidade, icon, cor, loading,
}: {
  label: string
  valor: number | string | null
  unidade?: string
  icon: React.ReactNode
  cor: string
  loading?: boolean
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </p>
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mt-1.5" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              {valor ?? '—'}
              {unidade && (
                <span className="text-sm font-normal text-slate-500 ml-1">{unidade}</span>
              )}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${cor}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// ─── Componente de tabela de usuários ─────────────────────
function TabelaUsuarios({ usuarios, loading }: { usuarios: Usuario[], loading: boolean }) {
  const t = useT()

  const corPerfil: Record<string, string> = {
    Administrador: 'badge-blue',
    Planejamento:  'badge-blue',
    Supervisor:    'badge-yellow',
    Lider:         'badge-yellow',
    Cliente:       'badge-gray',
    Financeiro:    'badge-green',
    Consulta:      'badge-gray',
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-600" />
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
            {t('usuarios')}
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {!loading && `${usuarios.length} registro${usuarios.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {loading ? (
        <div className="p-8 flex justify-center">
          <Loader2 size={20} className="animate-spin text-blue-600" />
        </div>
      ) : usuarios.length === 0 ? (
        <div className="p-8 flex flex-col items-center gap-2 text-slate-400">
          <AlertCircle size={24} />
          <p className="text-sm">{t('sem_dados')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('nome')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('email')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('perfil')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('empresa')}
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors
                    ${idx === usuarios.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                          {u.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {u.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {u.email}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${corPerfil[u.perfis?.nome_perfil ?? ''] ?? 'badge-gray'}`}>
                      {u.perfis?.nome_perfil ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {u.empresa ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${u.ativo ? 'badge-green' : 'badge-red'}`}>
                      {u.ativo ? t('ativo') : t('inativo')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────
export default function DashboardPage() {
  const t = useT()
  const { sessao } = useAuth()
  const supabase = createClient()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [metrica, setMetrica] = useState<MetricaDiaria | null>(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [loadingMetrica, setLoadingMetrica] = useState(true)

  useEffect(() => {
    carregarUsuarios()
    carregarMetrica()
  }, [])

  async function carregarUsuarios() {
    setLoadingUsuarios(true)
    const { data } = await supabase
      .from('usuarios')
      .select('*, perfis(*)')
      .order('nome', { ascending: true })
    setUsuarios(data ?? [])
    setLoadingUsuarios(false)
  }

  async function carregarMetrica() {
    setLoadingMetrica(true)
    const hoje = format(new Date(), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('metricas_diarias')
      .select('*')
      .eq('data', hoje)
      .limit(1)
      .single()
    setMetrica(data ?? null)
    setLoadingMetrica(false)
  }

  const dataFormatada = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <AppShell titulo={t('dashboard')}>
      <div className="space-y-6">

        {/* ─── Boas vindas ──────────────────────────────── */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('bem_vindo')}, {sessao?.usuario.nome.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
            {dataFormatada}
          </p>
        </div>

        {/* ─── KPIs do dia ──────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label={t('total_programado')}
            valor={metrica?.total_programado ?? '—'}
            icon={<CalendarDays size={18} className="text-blue-600" />}
            cor="bg-blue-50 dark:bg-blue-900/20"
            loading={loadingMetrica}
          />
          <KpiCard
            label={t('total_realizado')}
            valor={metrica?.total_realizado ?? '—'}
            icon={<CheckCircle2 size={18} className="text-green-600" />}
            cor="bg-green-50 dark:bg-green-900/20"
            loading={loadingMetrica}
          />
          <KpiCard
            label={t('aderencia')}
            valor={metrica?.aderencia_reframax != null ? `${metrica.aderencia_reframax}` : '—'}
            unidade="%"
            icon={<TrendingUp size={18} className="text-purple-600" />}
            cor="bg-purple-50 dark:bg-purple-900/20"
            loading={loadingMetrica}
          />
          <KpiCard
            label={t('hh_total')}
            valor={metrica?.hh_total ?? '—'}
            unidade="h"
            icon={<Clock size={18} className="text-orange-600" />}
            cor="bg-orange-50 dark:bg-orange-900/20"
            loading={loadingMetrica}
          />
        </div>

        {/* ─── Segunda linha de KPIs ────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label={t('produtividade')}
            valor={metrica?.produtividade ?? '—'}
            unidade="%"
            icon={<Activity size={18} className="text-teal-600" />}
            cor="bg-teal-50 dark:bg-teal-900/20"
            loading={loadingMetrica}
          />
          <KpiCard
            label="Não Realizado"
            valor={metrica?.total_nao_realizado ?? '—'}
            icon={<XCircle size={18} className="text-red-600" />}
            cor="bg-red-50 dark:bg-red-900/20"
            loading={loadingMetrica}
          />
          <KpiCard
            label="HH Normal"
            valor={metrica?.hh_normal ?? '—'}
            unidade="h"
            icon={<Clock size={18} className="text-slate-500" />}
            cor="bg-slate-100 dark:bg-slate-700"
            loading={loadingMetrica}
          />
          <KpiCard
            label="HH Extra"
            valor={metrica?.hh_hora_extra ?? '—'}
            unidade="h"
            icon={<Clock size={18} className="text-amber-600" />}
            cor="bg-amber-50 dark:bg-amber-900/20"
            loading={loadingMetrica}
          />
        </div>

        {/* ─── Tabela de usuários ───────────────────────── */}
        <TabelaUsuarios usuarios={usuarios} loading={loadingUsuarios} />

      </div>
    </AppShell>
  )
}
