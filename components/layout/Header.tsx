'use client'
// ============================================================
// Header — Barra superior do app
// ============================================================
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useT, useAppStore } from '@/lib/hooks/useAppStore'
import { idiomas, type Idioma } from '@/lib/i18n'
import { Menu, Sun, Moon, Globe, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function Header({ titulo }: { titulo?: string }) {
  const router = useRouter()
  const t = useT()
  const { sessao, logout } = useAuth()
  const { tema, toggleTema, idioma, setIdioma, toggleSidebar } = useAppStore()
  const [menuUsuario, setMenuUsuario] = useState(false)
  const [menuIdioma, setMenuIdioma] = useState(false)

  const idiomaAtual = idiomas.find(i => i.value === idioma)

  const dataHoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-6 shrink-0">

      {/* Esquerda */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800
                     dark:text-slate-400 transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>
        {titulo && (
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 hidden sm:block">
            {titulo}
          </h1>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:block capitalize">
          {dataHoje}
        </span>
      </div>

      {/* Direita */}
      <div className="flex items-center gap-1">

        {/* Idioma */}
        <div className="relative">
          <button
            onClick={() => { setMenuIdioma(!menuIdioma); setMenuUsuario(false) }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm
                       text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                       transition-colors"
          >
            <Globe size={15} />
            <span className="hidden sm:inline text-xs">{idiomaAtual?.flag} {idiomaAtual?.label}</span>
          </button>
          {menuIdioma && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 min-w-[160px] overflow-hidden animate-fadeIn">
              {idiomas.map(i => (
                <button
                  key={i.value}
                  onClick={() => { setIdioma(i.value as Idioma); setMenuIdioma(false) }}
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

        {/* Tema */}
        <button
          onClick={toggleTema}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {tema === 'escuro' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Usuário */}
        {sessao && (
          <div className="relative ml-1">
            <button
              onClick={() => { setMenuUsuario(!menuUsuario); setMenuIdioma(false) }}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg
                         hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                  {sessao.usuario.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block max-w-[120px] truncate">
                {sessao.usuario.nome.split(' ')[0]}
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {menuUsuario && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden animate-fadeIn">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {sessao.usuario.nome}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {sessao.usuario.email}
                  </p>
                  <span className="inline-flex mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                    {sessao.perfil}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={14} />
                  {t('logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlays */}
      {(menuUsuario || menuIdioma) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setMenuUsuario(false); setMenuIdioma(false) }}
        />
      )}
    </header>
  )
}
