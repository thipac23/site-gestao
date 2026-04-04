'use client'
// ============================================================
// Tela de Login — PGO Operacional
// ============================================================
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useT, useAppStore } from '@/lib/hooks/useAppStore'
import { idiomas, type Idioma } from '@/lib/i18n'
import {
  Eye, EyeOff, Moon, Sun, Globe, AlertCircle, Loader2,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const t = useT()
  const { tema, toggleTema, idioma, setIdioma } = useAppStore()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false)

  const idiomaAtual = idiomas.find(i => i.value === idioma)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)

    try {
      await login(email.trim(), senha)
      router.push('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid login') || msg.includes('Invalid credentials')) {
        setErro(t('erro_credenciais'))
      } else {
        setErro(t('erro_generico'))
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090f1c] flex flex-col">

      {/* ─── Barra superior ─────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Logo / marca */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PG</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
            {t('app_name')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de idioma */}
          <div className="relative">
            <button
              onClick={() => setMostrarIdiomas(!mostrarIdiomas)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                         text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                         transition-colors"
            >
              <Globe size={14} />
              <span>{idiomaAtual?.flag}</span>
              <span className="hidden sm:inline">{idiomaAtual?.label}</span>
            </button>

            {mostrarIdiomas && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden animate-fadeIn">
                {idiomas.map(i => (
                  <button
                    key={i.value}
                    onClick={() => {
                      setIdioma(i.value as Idioma)
                      setMostrarIdiomas(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left
                                hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                                ${idioma === i.value ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <span>{i.flag}</span>
                    <span>{i.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle tema */}
          <button
            onClick={toggleTema}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Alternar tema"
          >
            {tema === 'escuro' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* ─── Conteúdo central ───────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">

          {/* Card de login */}
          <div className="card p-8 animate-fadeIn">
            {/* Header do card */}
            <div className="mb-8 text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/25">
                <span className="text-white font-bold text-xl">PG</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('login_titulo')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                {t('login_subtitulo')}
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Erro */}
              {erro && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 animate-fadeIn">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-400">{erro}</span>
                </div>
              )}

              {/* E-mail */}
              <div>
                <label className="label" htmlFor="email">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={carregando}
                />
              </div>

              {/* Senha */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0" htmlFor="senha">
                    {t('senha')}
                  </label>
                  <button
                    type="button"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('esqueceu_senha')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder={t('senha_placeholder')}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={carregando}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                               transition-colors"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Botão */}
              <button
                type="submit"
                disabled={carregando || !email || !senha}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {carregando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t('entrando')}
                  </>
                ) : t('login')}
              </button>
            </form>

            {/* Solicitar acesso */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              {t('solicitar_acesso')}?{' '}
              <a
                href="/solicitar-acesso"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Clique aqui
              </a>
            </p>
          </div>

          {/* Rodapé */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
            © {new Date().getFullYear()} PGO Operacional. Todos os direitos reservados.
          </p>
        </div>
      </main>

      {/* Overlay para fechar dropdown */}
      {mostrarIdiomas && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMostrarIdiomas(false)}
        />
      )}
    </div>
  )
}
