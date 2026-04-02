import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase.js'
import {
  LayoutDashboard, Calendar, ClipboardList, Users, AlertTriangle,
  Package, Truck, FileText, Settings, LogOut, Menu, X, Sun, Moon,
  Flame, Bell, ChevronDown, Plus, Search, Download, RefreshCw,
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Filter,
  ChevronRight, Eye, Edit3, Trash2, BarChart3, Activity, Target,
  HardHat, Wrench, User, Building2, Save, Check, Upload
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

// ── THEME ──────────────────────────────────────────────────────────────────
const useTheme = () => {
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('theme')
    return s ? s === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, () => setDark(d => !d)]
}

// ── TOAST ──────────────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} onClick={() => remove(t.id)}
        className={`pointer-events-auto animate-fadeIn flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer
          ${t.type === 'success' ? 'bg-emerald-500 text-white' : t.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
        {t.type === 'success' ? <CheckCircle size={16}/> : t.type === 'error' ? <XCircle size={16}/> : <Bell size={16}/>}
        {t.msg}
      </div>
    ))}
  </div>
)

const useToast = () => {
  const [toasts, setToasts] = useState([])
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])
  return { toasts, add, remove }
}

// ── MODAL ─────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  if (!open) return null
  const w = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className={`relative card w-full ${w} max-h-[90vh] overflow-y-auto animate-fadeIn p-0`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── LOADING ───────────────────────────────────────────────────────────────
const Spinner = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>
)

const LoadingPage = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size={32} />
  </div>
)

// ── KPI CARD ─────────────────────────────────────────────────────────────
const KPICard = ({ title, value, unit, icon: Icon, color = 'sky', trend, sub }) => {
  const colors = {
    sky:     'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    amber:   'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    rose:    'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20',
    violet:  'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20',
  }
  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon size={18} />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
        {value}<span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────
const Empty = ({ icon: Icon = ClipboardList, title = 'Nenhum registro', sub = 'Adicione o primeiro registro' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Icon size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
  </div>
)

// ── CSV EXPORT ────────────────────────────────────────────────────────────
const exportCSV = (data, filename) => {
  if (!data?.length) return
  const keys = Object.keys(data[0])
  const csv = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
}

// ── FORMAT HELPERS ────────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '-'
const fmtTs = d => d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'
const today = () => new Date().toISOString().slice(0, 10)

// ══════════════════════════════════════════════════════════════════════════
// PAGE: LOGIN
// ══════════════════════════════════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // login | request | forgot
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('E-mail ou senha inválidos')
    } else {
      const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
      onLogin(user || { email, role: 'supervisor', name: data.user?.email?.split('@')[0] || 'Usuário' })
    }
    setLoading(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/#reset-password`
    })
    if (err) setError('Erro ao enviar email. Tente novamente.')
    else setForgotSent(true)
    setLoading(false)
  }

  const [reqForm, setReqForm] = useState({ name: '', email: '', company: '', requested_role: 'supervisor', justification: '' })
  const [reqSent, setReqSent] = useState(false)
  const handleRequest = async (e) => {
    e.preventDefault()
    await supabase.from('access_requests').insert({ ...reqForm, status: 'pending' })
    setReqSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25 mb-4">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">REFRAMAX</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Portal de Gestão Operacional</p>
        </div>

        <div className="card p-7 shadow-xl shadow-gray-200/50 dark:shadow-black/30">
          {(mode === 'login' || mode === 'forgot') ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Entrar na plataforma</h2>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">E-mail corporativo</label>
                  <input className="input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Senha</label>
                  <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button className="btn-primary w-full flex items-center justify-center gap-2 mt-2" disabled={loading}>
                  {loading ? <Spinner /> : null} Entrar
                </button>
              </form>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <button onClick={() => { setMode('forgot'); setError('') }} className="text-sm text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Esqueci minha senha
                </button>
                <button onClick={() => setMode('request')} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">
                  Solicitar acesso
                </button>
              </div>
            </>
          ) : reqSent ? (
            <div className="text-center py-6">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Solicitação enviada!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">O administrador receberá sua solicitação.</p>
              <button onClick={() => { setMode('login'); setReqSent(false) }} className="btn-secondary">Voltar ao login</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setMode('login')} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={16} className="rotate-180 text-gray-400" /></button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Solicitar acesso</h2>
              </div>
              <form onSubmit={handleRequest} className="space-y-3">
                <div><label className="label">Nome completo</label><input className="input" placeholder="Seu nome" value={reqForm.name} onChange={e => setReqForm({ ...reqForm, name: e.target.value })} required /></div>
                <div><label className="label">E-mail</label><input className="input" type="email" placeholder="email@empresa.com" value={reqForm.email} onChange={e => setReqForm({ ...reqForm, email: e.target.value })} required /></div>
                <div><label className="label">Empresa</label><input className="input" placeholder="Empresa" value={reqForm.company} onChange={e => setReqForm({ ...reqForm, company: e.target.value })} /></div>
                <div>
                  <label className="label">Perfil solicitado</label>
                  <select className="input" value={reqForm.requested_role} onChange={e => setReqForm({ ...reqForm, requested_role: e.target.value })}>
                    <option value="supervisor">Supervisor</option>
                    <option value="lider">Líder de Equipe</option>
                    <option value="planejamento">Planejamento</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
                <div><label className="label">Justificativa</label><textarea className="input" rows={2} placeholder="Por que precisa de acesso?" value={reqForm.justification} onChange={e => setReqForm({ ...reqForm, justification: e.target.value })} /></div>
                <button className="btn-primary w-full mt-1">Enviar solicitação</button>
              </form>
            </>
          )}
        </div>

        {/* Forgot Password Modal */}
        {mode === 'forgot' && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="card p-7 w-full max-w-sm shadow-xl animate-fadeIn">
              {forgotSent ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email enviado!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Verifique sua caixa de entrada para redefinir a senha.</p>
                  <button onClick={() => { setMode('login'); setForgotSent(false); setForgotEmail('') }} className="btn-primary w-full">Voltar ao login</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <button onClick={() => { setMode('login'); setError('') }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight size={16} className="rotate-180 text-gray-400" /></button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recuperar senha</h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Informe seu e-mail e enviaremos um link para redefinir a senha.</p>
                  {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="label">E-mail corporativo</label>
                      <input className="input" type="email" placeholder="seu@email.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                    </div>
                    <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                      {loading ? <Spinner /> : null} Enviar link de recuperação
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">© 2026 Reframax · Acesso restrito e monitorado</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const [stats, setStats] = useState({ activities: 0, attendance: 0, deviations: 0, materials: 0 })
  const [contracts, setContracts] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const load = async () => {
      const [{ count: ac }, { count: at }, { count: dv }, { count: mc }, { data: ct }, { data: ra }] = await Promise.all([
        supabase.from('activities').select('*', { count: 'exact', head: true }),
        supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('attendance_date', today()),
        supabase.from('deviations').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('material_consumption').select('*', { count: 'exact', head: true }),
        supabase.from('contracts').select('*').eq('active', true),
        supabase.from('activities').select('id,activity_date,repair_region,activity_description').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({ activities: ac || 0, attendance: at || 0, deviations: dv || 0, materials: mc || 0 })
      setContracts(ct || [])
      setRecentActivities(ra || [])
      // Build last 7 days chart
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const ds = d.toISOString().slice(0, 10)
        const { count } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('activity_date', ds)
        days.push({ day: d.toLocaleDateString('pt-BR', { weekday: 'short' }), atividades: count || 0 })
      }
      setChartData(days)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Atividades registradas" value={stats.activities} icon={ClipboardList} color="sky" />
        <KPICard title="Presença hoje" value={stats.attendance} unit="pessoas" icon={Users} color="emerald" />
        <KPICard title="Desvios em aberto" value={stats.deviations} icon={AlertTriangle} color="amber" />
        <KPICard title="Consumos de material" value={stats.materials} icon={Package} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Atividades — últimos 7 dias</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, fontSize: 12, color: '#f1f5f9' }} />
              <Bar dataKey="atividades" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contracts */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contratos ativos</h3>
          <div className="space-y-3">
            {contracts.length === 0 ? <Empty title="Sem contratos" /> : contracts.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.code}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{c.name}</p>
                </div>
                <span className="badge badge-info">Meta {c.target_percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Últimas atividades registradas</h3>
        {recentActivities.length === 0 ? <Empty /> : (
          <div className="space-y-2">
            {recentActivities.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
                  <Activity size={14} className="text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{a.activity_description || a.repair_region || 'Atividade'}</p>
                  <p className="text-xs text-gray-400">{fmtDate(a.activity_date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: ACTIVITIES (Registro de Atividades)
// ══════════════════════════════════════════════════════════════════════════
const ActivitiesPage = ({ user, toast }) => {
  const [rows, setRows] = useState([])
  const [teams, setTeams] = useState([])
  const [batteries, setBatteries] = useState([])
  const [scopes, setScopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    team_id: '', battery_id: '', furnace_number: '', repair_region: '',
    activity_scope_id: '', activity_description: '', activity_date: today(),
    ref_qty: 0, mec_qty: 0, sol_qty: 0, and_qty: 0, op_qty: 0,
    leader_present: false, supervisor_present: false, activity_type: 'programada'
  })

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('activities').select(`
      id, activity_date, repair_region, activity_description, activity_type,
      furnace_number, ref_qty, mec_qty, sol_qty, and_qty, op_qty,
      teams(name), batteries(name), activity_scopes(name)
    `).order('activity_date', { ascending: false }).limit(100)
    if (filterDate) q = q.eq('activity_date', filterDate)
    const { data } = await q
    setRows(data || [])
    setLoading(false)
  }, [filterDate])

  useEffect(() => {
    load()
    supabase.from('teams').select('id,name').then(r => setTeams(r.data || []))
    supabase.from('batteries').select('id,name').then(r => setBatteries(r.data || []))
    supabase.from('activity_scopes').select('id,name').eq('active', true).then(r => setScopes(r.data || []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('activities').insert({
      ...form,
      furnace_number: parseInt(form.furnace_number) || null,
      ref_qty: parseInt(form.ref_qty) || 0,
      mec_qty: parseInt(form.mec_qty) || 0,
      sol_qty: parseInt(form.sol_qty) || 0,
      and_qty: parseInt(form.and_qty) || 0,
      op_qty: parseInt(form.op_qty) || 0,
      registered_by: user?.id || null
    })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Atividade registrada!', 'success')
    setShowModal(false)
    setForm({ team_id: '', battery_id: '', furnace_number: '', repair_region: '', activity_scope_id: '', activity_description: '', activity_date: today(), ref_qty: 0, mec_qty: 0, sol_qty: 0, and_qty: 0, op_qty: 0, leader_present: false, supervisor_present: false, activity_type: 'programada' })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão?')) return
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (error) toast(error.message, 'error')
    else { toast('Excluído', 'success'); load() }
  }

  const filtered = rows.filter(r => {
    const s = search.toLowerCase()
    return !s || (r.activity_description || '').toLowerCase().includes(s) || (r.repair_region || '').toLowerCase().includes(s)
  })

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Registro de Atividades</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rows.length} registros</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(rows, 'atividades')} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Exportar</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> Nova atividade</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm py-2" placeholder="Buscar por região ou descrição..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input type="date" className="input w-auto text-sm py-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} title="Filtrar por data" />
        <button onClick={() => { setSearch(''); setFilterDate(''); }} className="btn-secondary text-sm py-2 px-3"><RefreshCw size={14}/></button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Data','Equipe','Bateria','Forno','Região','Descrição','HH Total','Tipo','Ações'].map(h => (
                  <th key={h} className="table-header text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8"><Spinner /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9}><Empty /></td></tr>
              ) : filtered.map(r => {
                const hh = (r.ref_qty||0)+(r.mec_qty||0)+(r.sol_qty||0)+(r.and_qty||0)+(r.op_qty||0)
                return (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell font-medium">{fmtDate(r.activity_date)}</td>
                    <td className="table-cell">{r.teams?.name || '-'}</td>
                    <td className="table-cell">{r.batteries?.name || '-'}</td>
                    <td className="table-cell">{r.furnace_number || '-'}</td>
                    <td className="table-cell">{r.repair_region || '-'}</td>
                    <td className="table-cell max-w-xs truncate">{r.activity_description || r.activity_scopes?.name || '-'}</td>
                    <td className="table-cell"><span className="badge badge-info">{hh}</span></td>
                    <td className="table-cell">
                      <span className={`badge ${r.activity_type === 'programada' ? 'badge-success' : r.activity_type === 'emergencial' ? 'badge-danger' : 'badge-warning'}`}>
                        {r.activity_type || 'programada'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova atividade" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div>
              <label className="label">Data *</label>
              <input type="date" className="input" value={form.activity_date} onChange={e => setForm({...form, activity_date: e.target.value})} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.activity_type} onChange={e => setForm({...form, activity_type: e.target.value})}>
                <option value="programada">Programada</option>
                <option value="emergencial">Emergencial</option>
                <option value="corretiva">Corretiva</option>
              </select>
            </div>
            <div>
              <label className="label">Equipe</label>
              <select className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}>
                <option value="">Selecione</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Bateria</label>
            <select className="input" value={form.battery_id} onChange={e => setForm({...form, battery_id: e.target.value})}>
              <option value="">Selecione</option>
              {batteries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">N° do Forno</label>
            <input type="number" className="input" placeholder="Ex: 42" value={form.furnace_number} onChange={e => setForm({...form, furnace_number: e.target.value})} />
          </div>
          <div>
            <label className="label">Região de Reparo</label>
            <select className="input" value={form.repair_region} onChange={e => setForm({...form, repair_region: e.target.value})}>
              <option value="">Selecione</option>
              {['Porta','Soleira','Teto','Parede Lateral','Parede Testeira','Canal Ascendente','Canal Soleflue','Downcomer','Primária','Quadrante'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Escopo</label>
            <select className="input" value={form.activity_scope_id} onChange={e => setForm({...form, activity_scope_id: e.target.value})}>
              <option value="">Selecione</option>
              {scopes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Descrição da atividade</label>
            <textarea className="input" rows={2} placeholder="Descreva a atividade..." value={form.activity_description} onChange={e => setForm({...form, activity_description: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="label">Efetivo por função</label>
            <div className="grid grid-cols-5 gap-2">
              {[['ref_qty','REF'],['mec_qty','MEC'],['sol_qty','SOL'],['and_qty','AND'],['op_qty','OP']].map(([k,l]) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 mb-1 block text-center">{l}</label>
                  <input type="number" min="0" className="input text-center px-2" value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.leader_present} onChange={e => setForm({...form, leader_present: e.target.checked})} />
              Líder presente
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.supervisor_present} onChange={e => setForm({...form, supervisor_present: e.target.checked})} />
              Supervisor presente
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Spinner size={14}/> : <Save size={14}/>} Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: ATTENDANCE (Efetivo)
// ══════════════════════════════════════════════════════════════════════════
const AttendancePage = ({ user, toast }) => {
  const [rows, setRows] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterDate, setFilterDate] = useState(today())
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    team_id: '', worker_name: '', workforce_type: 'REF', attendance_date: today(), status: 'presente'
  })

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('attendance').select('*, teams(name)').order('created_at', { ascending: false }).limit(200)
    if (filterDate) q = q.eq('attendance_date', filterDate)
    const { data } = await q
    setRows(data || [])
    setLoading(false)
  }, [filterDate])

  useEffect(() => {
    load()
    supabase.from('teams').select('id,name').then(r => setTeams(r.data || []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('attendance').insert({ ...form, registered_by: user?.id || null })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Presença registrada!', 'success')
    setShowModal(false)
    setForm({ team_id: '', worker_name: '', workforce_type: 'REF', attendance_date: today(), status: 'presente' })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Confirmar exclusão?')) return
    const { error } = await supabase.from('attendance').delete().eq('id', id)
    if (error) toast(error.message, 'error')
    else { toast('Excluído', 'success'); load() }
  }

  const statusColor = { presente: 'badge-success', ausente: 'badge-danger', afastado: 'badge-warning', ferias: 'badge-info' }
  const totalHH = rows.filter(r => r.status === 'presente').length * 8

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Efetivo & Presença</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rows.length} registros · HH estimado: <strong>{totalHH}h</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(rows, 'efetivo')} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Exportar</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> Registrar presença</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Presentes', status: 'presente', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Ausentes', status: 'ausente', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
          { label: 'Afastados', status: 'afastado', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Férias', status: 'ferias', color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20' },
        ].map(s => (
          <div key={s.status} className={`card p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{rows.filter(r => r.status === s.status).length}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card p-3 flex gap-3">
        <input type="date" className="input w-auto text-sm py-2" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <button onClick={() => setFilterDate('')} className="btn-secondary text-sm py-2 px-3">Todos</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{['Data','Nome','Função','Equipe','Status','Ações'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8"><Spinner /></td></tr>
              : rows.length === 0 ? <tr><td colSpan={6}><Empty /></td></tr>
              : rows.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-cell">{fmtDate(r.attendance_date)}</td>
                  <td className="table-cell font-medium">{r.worker_name}</td>
                  <td className="table-cell"><span className="badge badge-default">{r.workforce_type}</span></td>
                  <td className="table-cell">{r.teams?.name || '-'}</td>
                  <td className="table-cell"><span className={`badge ${statusColor[r.status] || 'badge-default'}`}>{r.status}</span></td>
                  <td className="table-cell">
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar presença">
        <div className="space-y-4">
          <div><label className="label">Data</label><input type="date" className="input" value={form.attendance_date} onChange={e => setForm({...form, attendance_date: e.target.value})} /></div>
          <div><label className="label">Nome do trabalhador</label><input className="input" placeholder="Nome completo" value={form.worker_name} onChange={e => setForm({...form, worker_name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Função</label>
              <select className="input" value={form.workforce_type} onChange={e => setForm({...form, workforce_type: e.target.value})}>
                {['REF','MEC','SOL','AND','OP','LD'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {['presente','ausente','afastado','ferias'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Equipe</label>
            <select className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}>
              <option value="">Selecione</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.worker_name} className="btn-primary flex items-center gap-2">
            {saving ? <Spinner size={14}/> : <Save size={14}/>} Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: DEVIATIONS
// ══════════════════════════════════════════════════════════════════════════
const DeviationsPage = ({ user, toast }) => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({
    deviation_date: today(), reason: '', description: '', team_id: '',
    impact_hh: 0, corrective_action: '', status: 'open'
  })
  const [teams, setTeams] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('deviations').select('*, teams(name)').order('created_at', { ascending: false }).limit(200)
    if (filterStatus) q = q.eq('status', filterStatus)
    const { data } = await q
    setRows(data || [])
    setLoading(false)
  }, [filterStatus])

  useEffect(() => {
    load()
    supabase.from('teams').select('id,name').then(r => setTeams(r.data || []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('deviations').insert({ ...form, impact_hh: parseFloat(form.impact_hh) || 0, registered_by: user?.id })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Desvio registrado!', 'success')
    setShowModal(false)
    setForm({ deviation_date: today(), reason: '', description: '', team_id: '', impact_hh: 0, corrective_action: '', status: 'open' })
    load()
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('deviations').update({ status }).eq('id', id)
    if (error) toast(error.message, 'error')
    else { toast('Status atualizado', 'success'); load() }
  }

  const REASONS = ['Falta de material','Condição climática','Falta de efetivo','Acesso bloqueado','Equipamento indisponível','Segurança','Alteração de prioridade','Outro']

  const filtered = rows.filter(r => {
    const s = search.toLowerCase()
    return !s || (r.description||'').toLowerCase().includes(s) || (r.reason||'').toLowerCase().includes(s)
  })

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Desvios & Ocorrências</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rows.filter(r=>r.status==='open').length} em aberto</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(rows, 'desvios')} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Exportar</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> Registrar desvio</button>
        </div>
      </div>

      <div className="card p-3 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm py-2" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto text-sm py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="open">Em aberto</option>
          <option value="resolved">Resolvido</option>
          <option value="pending">Pendente</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{['Data','Motivo','Descrição','Equipe','HH Impacto','Status','Ações'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-8"><Spinner /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7}><Empty icon={AlertTriangle} title="Nenhum desvio registrado" /></td></tr>
              : filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-cell">{fmtDate(r.deviation_date)}</td>
                  <td className="table-cell font-medium">{r.reason || '-'}</td>
                  <td className="table-cell max-w-xs truncate">{r.description || '-'}</td>
                  <td className="table-cell">{r.teams?.name || '-'}</td>
                  <td className="table-cell"><span className="badge badge-warning">{r.impact_hh}h</span></td>
                  <td className="table-cell">
                    <span className={`badge ${r.status === 'resolved' ? 'badge-success' : r.status === 'open' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span>
                  </td>
                  <td className="table-cell">
                    {r.status === 'open' && (
                      <button onClick={() => updateStatus(r.id, 'resolved')} className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" title="Marcar resolvido">
                        <Check size={13}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar desvio" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data</label><input type="date" className="input" value={form.deviation_date} onChange={e => setForm({...form, deviation_date: e.target.value})} /></div>
            <div>
              <label className="label">Equipe</label>
              <select className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}>
                <option value="">Selecione</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Motivo *</label>
            <select className="input" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}>
              <option value="">Selecione o motivo</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div><label className="label">Descrição</label><textarea className="input" rows={2} placeholder="Detalhes do desvio..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Impacto (HH)</label><input type="number" min="0" step="0.5" className="input" value={form.impact_hh} onChange={e => setForm({...form, impact_hh: e.target.value})} /></div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="open">Em aberto</option>
                <option value="pending">Pendente</option>
                <option value="resolved">Resolvido</option>
              </select>
            </div>
          </div>
          <div><label className="label">Ação corretiva</label><textarea className="input" rows={2} placeholder="Ação tomada ou planejada..." value={form.corrective_action} onChange={e => setForm({...form, corrective_action: e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.reason} className="btn-primary flex items-center gap-2">
            {saving ? <Spinner size={14}/> : <Save size={14}/>} Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: MATERIALS
// ══════════════════════════════════════════════════════════════════════════
const MaterialsPage = ({ user, toast }) => {
  const [rows, setRows] = useState([])
  const [materials, setMaterials] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ material_id: '', team_id: '', quantity: '', consumption_date: today(), notes: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('material_consumption')
      .select('*, materials(name,unit_of_measure), teams(name)')
      .order('consumption_date', { ascending: false }).limit(200)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('materials').select('id,name,unit_of_measure').eq('active', true).then(r => setMaterials(r.data || []))
    supabase.from('teams').select('id,name').then(r => setTeams(r.data || []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('material_consumption').insert({ ...form, quantity: parseFloat(form.quantity) || 0, registered_by: user?.id })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Consumo registrado!', 'success')
    setShowModal(false)
    setForm({ material_id: '', team_id: '', quantity: '', consumption_date: today(), notes: '' })
    load()
  }

  const filtered = rows.filter(r => {
    const s = search.toLowerCase()
    return !s || (r.materials?.name||'').toLowerCase().includes(s)
  })

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Consumo de Materiais</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rows.length} registros</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(rows, 'materiais')} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Exportar</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> Registrar consumo</button>
        </div>
      </div>

      <div className="card p-3 flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9 text-sm py-2" placeholder="Buscar material..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{['Data','Material','UN','Quantidade','Equipe','Observação'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-8"><Spinner /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6}><Empty icon={Package} title="Nenhum consumo registrado" /></td></tr>
              : filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-cell">{fmtDate(r.consumption_date)}</td>
                  <td className="table-cell font-medium">{r.materials?.name || '-'}</td>
                  <td className="table-cell">{r.materials?.unit_of_measure || '-'}</td>
                  <td className="table-cell"><span className="badge badge-info">{r.quantity}</span></td>
                  <td className="table-cell">{r.teams?.name || '-'}</td>
                  <td className="table-cell text-gray-500">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Registrar consumo de material">
        <div className="space-y-4">
          <div><label className="label">Data</label><input type="date" className="input" value={form.consumption_date} onChange={e => setForm({...form, consumption_date: e.target.value})} /></div>
          <div>
            <label className="label">Material *</label>
            <select className="input" value={form.material_id} onChange={e => setForm({...form, material_id: e.target.value})}>
              <option value="">Selecione</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit_of_measure})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Quantidade *</label><input type="number" min="0" step="0.01" className="input" placeholder="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
            <div>
              <label className="label">Equipe</label>
              <select className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}>
                <option value="">Selecione</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Observações</label><input className="input" placeholder="Obs..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.material_id || !form.quantity} className="btn-primary flex items-center gap-2">
            {saving ? <Spinner size={14}/> : <Save size={14}/>} Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: LOGISTICS
// ══════════════════════════════════════════════════════════════════════════
const LogisticsPage = ({ user, toast }) => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    request_date: today(), item_description: '', quantity: '', unit: 'un',
    priority: 'normal', team_id: '', notes: '', status: 'pending'
  })
  const [teams, setTeams] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('logistics_requests').select('*, teams(name)').order('created_at', { ascending: false }).limit(200)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('teams').select('id,name').then(r => setTeams(r.data || []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('logistics_requests').insert({ ...form, quantity: parseFloat(form.quantity) || 1, requested_by: user?.id })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Solicitação registrada!', 'success')
    setShowModal(false)
    setForm({ request_date: today(), item_description: '', quantity: '', unit: 'un', priority: 'normal', team_id: '', notes: '', status: 'pending' })
    load()
  }

  const updateStatus = async (id, status) => {
    await supabase.from('logistics_requests').update({ status }).eq('id', id)
    load()
  }

  const priorityColor = { urgente: 'badge-danger', alta: 'badge-warning', normal: 'badge-info', baixa: 'badge-default' }
  const statusColor = { pending: 'badge-warning', approved: 'badge-success', delivered: 'badge-info', cancelled: 'badge-danger' }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Logística & Solicitações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rows.filter(r=>r.status==='pending').length} pendentes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(rows, 'logistica')} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Exportar</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> Nova solicitação</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{['Data','Descrição','Qtd','Prioridade','Equipe','Status','Ações'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-8"><Spinner /></td></tr>
              : rows.length === 0 ? <tr><td colSpan={7}><Empty icon={Truck} title="Nenhuma solicitação" /></td></tr>
              : rows.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-cell">{fmtDate(r.request_date)}</td>
                  <td className="table-cell font-medium">{r.item_description}</td>
                  <td className="table-cell">{r.quantity} {r.unit}</td>
                  <td className="table-cell"><span className={`badge ${priorityColor[r.priority]||'badge-default'}`}>{r.priority}</span></td>
                  <td className="table-cell">{r.teams?.name || '-'}</td>
                  <td className="table-cell"><span className={`badge ${statusColor[r.status]||'badge-default'}`}>{r.status}</span></td>
                  <td className="table-cell flex gap-1">
                    {r.status === 'pending' && <>
                      <button onClick={() => updateStatus(r.id, 'approved')} className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-lg transition-colors" title="Aprovar"><Check size={13}/></button>
                      <button onClick={() => updateStatus(r.id, 'cancelled')} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors" title="Cancelar"><X size={13}/></button>
                    </>}
                    {r.status === 'approved' && <button onClick={() => updateStatus(r.id, 'delivered')} className="p-1.5 text-gray-400 hover:text-sky-500 rounded-lg transition-colors" title="Entregue"><CheckCircle size={13}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova solicitação logística" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Data</label><input type="date" className="input" value={form.request_date} onChange={e => setForm({...form, request_date: e.target.value})} /></div>
            <div>
              <label className="label">Prioridade</label>
              <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {['urgente','alta','normal','baixa'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Descrição do item *</label><input className="input" placeholder="Ex: Massa refratária MR-50" value={form.item_description} onChange={e => setForm({...form, item_description: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="label">Quantidade *</label><input type="number" min="0" step="0.01" className="input" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
            <div>
              <label className="label">Unidade</label>
              <select className="input" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                {['un','kg','m','m²','litros','cx','rolo'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Equipe</label>
            <select className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}>
              <option value="">Selecione</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.item_description || !form.quantity} className="btn-primary flex items-center gap-2">
            {saving ? <Spinner size={14}/> : <Save size={14}/>} Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: REPORTS
// ══════════════════════════════════════════════════════════════════════════
const ReportsPage = ({ toast }) => {
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(1)).toISOString().slice(0,10))
  const [dateTo, setDateTo] = useState(today())
  const [data, setData] = useState(null)

  const buildReport = async () => {
    setLoading(true)
    const [{ data: acts }, { data: atts }, { data: devs }, { data: mats }] = await Promise.all([
      supabase.from('activities').select('*').gte('activity_date', dateFrom).lte('activity_date', dateTo),
      supabase.from('attendance').select('*').gte('attendance_date', dateFrom).lte('attendance_date', dateTo),
      supabase.from('deviations').select('*').gte('deviation_date', dateFrom).lte('deviation_date', dateTo),
      supabase.from('material_consumption').select('*, materials(name,unit_of_measure)').gte('consumption_date', dateFrom).lte('consumption_date', dateTo),
    ])
    const totalHH = (atts||[]).filter(a => a.status === 'presente').length * 8
    const presentes = (atts||[]).filter(a => a.status === 'presente').length
    const totalAtts = (atts||[]).length
    setData({
      activities: acts || [], attendance: atts || [], deviations: devs || [], materials: mats || [],
      kpis: {
        totalActivities: (acts||[]).length,
        totalHH,
        presenca: totalAtts > 0 ? ((presentes / totalAtts) * 100).toFixed(1) : 0,
        desviosAbertos: (devs||[]).filter(d => d.status === 'open').length,
        desviosResolvidos: (devs||[]).filter(d => d.status === 'resolved').length,
        impactoHH: (devs||[]).reduce((s, d) => s + (parseFloat(d.impact_hh) || 0), 0),
      }
    })
    setLoading(false)
  }

  const exportAll = (type) => {
    if (!data) return
    const map = { activities: data.activities, attendance: data.attendance, deviations: data.deviations, materials: data.materials }
    exportCSV(map[type] || [], `relatorio_${type}_${dateFrom}_${dateTo}`)
    toast('Exportado com sucesso!', 'success')
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Exporte dados e visualize indicadores por período</p>
      </div>

      {/* Period selector */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Período de análise</h3>
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="label">De</label>
            <input type="date" className="input w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Até</label>
            <input type="date" className="input w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button onClick={buildReport} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Spinner size={14}/> : <BarChart3 size={14}/>} Gerar relatório
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Atividades', value: data.kpis.totalActivities, color: 'sky' },
              { label: 'HH Total', value: data.kpis.totalHH + 'h', color: 'emerald' },
              { label: 'Presença', value: data.kpis.presenca + '%', color: 'violet' },
              { label: 'Desvios Abertos', value: data.kpis.desviosAbertos, color: 'amber' },
              { label: 'Desvios Resolvidos', value: data.kpis.desviosResolvidos, color: 'emerald' },
              { label: 'Impacto HH', value: data.kpis.impactoHH + 'h', color: 'rose' },
            ].map(k => (
              <div key={k.label} className="card p-4 text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{k.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Export buttons */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Exportar dados</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'activities', label: 'Atividades', count: data.activities.length, icon: ClipboardList },
                { key: 'attendance', label: 'Efetivo', count: data.attendance.length, icon: Users },
                { key: 'deviations', label: 'Desvios', count: data.deviations.length, icon: AlertTriangle },
                { key: 'materials', label: 'Materiais', count: data.materials.length, icon: Package },
              ].map(r => (
                <button key={r.key} onClick={() => exportAll(r.key)} className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow cursor-pointer border-dashed text-center">
                  <r.icon size={20} className="text-sky-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{r.label}</span>
                  <span className="badge badge-info">{r.count} registros</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Download size={11}/> CSV</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: SCHEDULING
// ══════════════════════════════════════════════════════════════════════════
const SchedulingPage = ({ user, toast }) => {
  const [rows, setRows] = useState([])
  const [teams, setTeams] = useState([])
  const [batteries, setBatteries] = useState([])
  const [scopes, setScopes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    team_id: '', battery_id: '', furnace_number: '', repair_region: '',
    activity_scope_id: '', activity_description: '', scheduled_date: today(),
    ref_qty: 0, mec_qty: 0, sol_qty: 0, and_qty: 0, op_qty: 0
  })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('schedules')
      .select('*, teams(name), batteries(name), activity_scopes(name)')
      .order('scheduled_date', { ascending: true }).limit(200)
    setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    supabase.from('teams').select('id,name').then(r => setTeams(r.data || []))
    supabase.from('batteries').select('id,name').then(r => setBatteries(r.data || []))
    supabase.from('activity_scopes').select('id,name').eq('active', true).then(r => setScopes(r.data || []))
  }, [load])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('schedules').insert({
      ...form,
      furnace_number: parseInt(form.furnace_number) || null,
      ref_qty: parseInt(form.ref_qty) || 0, mec_qty: parseInt(form.mec_qty) || 0,
      sol_qty: parseInt(form.sol_qty) || 0, and_qty: parseInt(form.and_qty) || 0,
      op_qty: parseInt(form.op_qty) || 0,
      created_by: user?.id
    })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Programação salva!', 'success')
    setShowModal(false)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir programação?')) return
    await supabase.from('schedules').delete().eq('id', id)
    load()
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Programação Diária</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{rows.length} atividades programadas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(rows, 'programacao')} className="btn-secondary flex items-center gap-2 text-sm"><Download size={14}/> Exportar</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={14}/> Programar atividade</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{['Data','Equipe','Bateria','Forno','Região','Atividade','HH Prev.','Ações'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center py-8"><Spinner /></td></tr>
              : rows.length === 0 ? <tr><td colSpan={8}><Empty icon={Calendar} title="Nenhuma atividade programada" /></td></tr>
              : rows.map(r => {
                const hh = (r.ref_qty||0)+(r.mec_qty||0)+(r.sol_qty||0)+(r.and_qty||0)+(r.op_qty||0)
                return (
                  <tr key={r.id} className="table-row">
                    <td className="table-cell font-medium">{fmtDate(r.scheduled_date)}</td>
                    <td className="table-cell">{r.teams?.name || '-'}</td>
                    <td className="table-cell">{r.batteries?.name || '-'}</td>
                    <td className="table-cell">{r.furnace_number || '-'}</td>
                    <td className="table-cell">{r.repair_region || '-'}</td>
                    <td className="table-cell truncate max-w-xs">{r.activity_description || r.activity_scopes?.name || '-'}</td>
                    <td className="table-cell"><span className="badge badge-info">{hh}</span></td>
                    <td className="table-cell">
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={13}/></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Programar atividade" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div><label className="label">Data *</label><input type="date" className="input" value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} /></div>
            <div>
              <label className="label">Equipe</label>
              <select className="input" value={form.team_id} onChange={e => setForm({...form, team_id: e.target.value})}>
                <option value="">Selecione</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Bateria</label>
              <select className="input" value={form.battery_id} onChange={e => setForm({...form, battery_id: e.target.value})}>
                <option value="">Selecione</option>
                {batteries.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">N° Forno</label><input type="number" className="input" value={form.furnace_number} onChange={e => setForm({...form, furnace_number: e.target.value})} /></div>
          <div>
            <label className="label">Região</label>
            <select className="input" value={form.repair_region} onChange={e => setForm({...form, repair_region: e.target.value})}>
              <option value="">Selecione</option>
              {['Porta','Soleira','Teto','Parede Lateral','Parede Testeira','Canal Ascendente','Canal Soleflue','Downcomer','Primária','Quadrante'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Escopo</label>
            <select className="input" value={form.activity_scope_id} onChange={e => setForm({...form, activity_scope_id: e.target.value})}>
              <option value="">Selecione</option>
              {scopes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Descrição</label><input className="input" value={form.activity_description} onChange={e => setForm({...form, activity_description: e.target.value})} /></div>
          <div className="col-span-2">
            <label className="label">Efetivo previsto</label>
            <div className="grid grid-cols-5 gap-2">
              {[['ref_qty','REF'],['mec_qty','MEC'],['sol_qty','SOL'],['and_qty','AND'],['op_qty','OP']].map(([k,l]) => (
                <div key={k}><label className="text-xs text-gray-500 mb-1 block text-center">{l}</label><input type="number" min="0" className="input text-center px-2" value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} /></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <Spinner size={14}/> : <Save size={14}/>} Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// PAGE: ADMIN
// ══════════════════════════════════════════════════════════════════════════
const AdminPage = ({ toast }) => {
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: r }, { data: u }] = await Promise.all([
        supabase.from('access_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50)
      ])
      setRequests(r || [])
      setUsers(u || [])
      setLoading(false)
    }
    load()
  }, [])

  const approveRequest = async (req) => {
    await supabase.from('access_requests').update({ status: 'approved' }).eq('id', req.id)
    await supabase.from('users').upsert({ email: req.email, name: req.name, role: req.requested_role, company: req.company, active: true })
    setRequests(r => r.filter(x => x.id !== req.id))
    toast('Acesso aprovado!', 'success')
  }

  const denyRequest = async (id) => {
    await supabase.from('access_requests').update({ status: 'denied' }).eq('id', id)
    setRequests(r => r.filter(x => x.id !== id))
    toast('Solicitação negada', 'info')
  }

  if (loading) return <LoadingPage />

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Administração</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciar acessos e usuários</p>
      </div>

      {/* Access Requests */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          Solicitações de acesso
          {requests.length > 0 && <span className="badge badge-warning">{requests.length}</span>}
        </h3>
        {requests.length === 0 ? <Empty icon={CheckCircle} title="Nenhuma solicitação pendente" /> : (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.email} · {r.company} · {r.requested_role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.justification}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveRequest(r)} className="btn-secondary text-xs py-1.5 px-3 text-emerald-600 dark:text-emerald-400">Aprovar</button>
                  <button onClick={() => denyRequest(r.id)} className="btn-danger text-xs py-1.5 px-3">Negar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usuários cadastrados ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>{['Nome','E-mail','Perfil','Empresa','Status'].map(h => <th key={h} className="table-header text-left">{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.length === 0 ? <tr><td colSpan={5}><Empty /></td></tr>
              : users.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="table-cell font-medium">{u.name || '-'}</td>
                  <td className="table-cell">{u.email}</td>
                  <td className="table-cell"><span className="badge badge-default">{u.role}</span></td>
                  <td className="table-cell">{u.company || '-'}</td>
                  <td className="table-cell"><span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// LAYOUT: SIDEBAR + HEADER
// ══════════════════════════════════════════════════════════════════════════
const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scheduling', label: 'Programação', icon: Calendar },
  { id: 'activities', label: 'Atividades', icon: ClipboardList },
  { id: 'attendance', label: 'Efetivo', icon: Users },
  { id: 'deviations', label: 'Desvios', icon: AlertTriangle },
  { id: 'materials', label: 'Materiais', icon: Package },
  { id: 'logistics', label: 'Logística', icon: Truck },
  { id: 'reports', label: 'Relatórios', icon: FileText },
]

const Layout = ({ user, page, setPage, onLogout, toggleTheme, dark, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = user?.role === 'admin' || user?.role === 'gerente'

  const navItems = [...PAGES, ...(isAdmin ? [{ id: 'admin', label: 'Administração', icon: Settings }] : [])]

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sm">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">REFRAMAX</p>
            <p className="text-[10px] text-gray-400 tracking-wide">Gestão Operacional</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(p => (
            <button key={p.id} onClick={() => { setPage(p.id); setSidebarOpen(false) }}
              className={`nav-item w-full ${page === p.id ? 'active' : ''}`}>
              <p.icon size={16} />
              {p.label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(user?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user?.name || user?.email || 'Usuário'}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role || 'usuário'}</p>
            </div>
            <button onClick={onLogout} className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Sair">
              <LogOut size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(s => !s)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Menu size={18} className="text-gray-500" />
            </button>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {navItems.find(p => p.id === page)?.label || 'Portal'}
            </h2>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Alternar tema">
            {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-gray-500" />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, toggleTheme] = useTheme()
  const { toasts, add: toast, remove } = useToast()
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('users').select('*').eq('email', session.user.email).maybeSingle().then(({ data }) => {
          setUser(data || { email: session.user.email, name: session.user.email, role: 'supervisor', id: session.user.id })
        })
      }
      setAuthChecked(true)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) setUser(null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPage('dashboard')
  }

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Spinner size={36} />
    </div>
  )

  if (!user) return (
    <>
      <LoginPage onLogin={setUser} />
      <Toast toasts={toasts} remove={remove} />
    </>
  )

  const pageProps = { user, toast }
  const pages = {
    dashboard: <DashboardPage />,
    scheduling: <SchedulingPage {...pageProps} />,
    activities: <ActivitiesPage {...pageProps} />,
    attendance: <AttendancePage {...pageProps} />,
    deviations: <DeviationsPage {...pageProps} />,
    materials: <MaterialsPage {...pageProps} />,
    logistics: <LogisticsPage {...pageProps} />,
    reports: <ReportsPage {...pageProps} />,
    admin: <AdminPage {...pageProps} />,
  }

  return (
    <>
      <Layout user={user} page={page} setPage={setPage} onLogout={handleLogout} toggleTheme={toggleTheme} dark={dark}>
        {pages[page] || pages.dashboard}
      </Layout>
      <Toast toasts={toasts} remove={remove} />
    </>
  )
}
