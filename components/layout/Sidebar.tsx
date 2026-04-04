'use client'
// ============================================================
// Sidebar — Navegação principal com controle por perfil
// ============================================================
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT, useAppStore } from '@/lib/hooks/useAppStore'
import { useAuth, temPermissao } from '@/lib/hooks/useAuth'
import type { NomePerfil } from '@/lib/types/database'
import {
  LayoutDashboard, CalendarDays, ClipboardList, Users,
  Clock, Package, BarChart3, DollarSign, FileText,
  Settings, ChevronLeft, X,
} from 'lucide-react'

interface NavItem {
  href: string
  labelKey: string
  icon: React.ReactNode
  modulo: string
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',          labelKey: 'dashboard',          icon: <LayoutDashboard size={18} />, modulo: 'dashboard' },
  { href: '/programacao',        labelKey: 'programacao',        icon: <CalendarDays size={18} />,    modulo: 'programacao' },
  { href: '/registro-atividade', labelKey: 'registro_atividade', icon: <ClipboardList size={18} />,  modulo: 'registro_atividade' },
  { href: '/presenca',           labelKey: 'presenca',           icon: <Users size={18} />,           modulo: 'presenca' },
  { href: '/hora-extra',         labelKey: 'hora_extra',         icon: <Clock size={18} />,           modulo: 'hora_extra' },
  { href: '/logistica',          labelKey: 'logistica',          icon: <Package size={18} />,         modulo: 'logistica' },
  { href: '/metricas',           labelKey: 'metricas',           icon: <BarChart3 size={18} />,       modulo: 'metricas' },
  { href: '/financeiro',         labelKey: 'financeiro',         icon: <DollarSign size={18} />,      modulo: 'financeiro' },
  { href: '/relatorios',         labelKey: 'relatorios',         icon: <FileText size={18} />,        modulo: 'relatorios' },
  { href: '/usuarios',           labelKey: 'usuarios',           icon: <Settings size={18} />,        modulo: 'usuarios' },
]

export function Sidebar() {
  const pathname = usePathname()
  const t = useT()
  const { sessao } = useAuth()
  const { sidebarAberta, setSidebarAberta } = useAppStore()

  const perfil = sessao?.perfil as NomePerfil | undefined

  const itensFiltrados = perfil
    ? NAV_ITEMS.filter(item =>
        item.modulo === 'dashboard' ||
        temPermissao(perfil, item.modulo) ||
        perfil === 'Administrador'
      )
    : [NAV_ITEMS[0]]

  return (
    <>
      {/* Overlay mobile */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-30
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          flex flex-col transition-all duration-300 ease-in-out
          ${sidebarAberta ? 'w-60' : 'w-16'}
          lg:relative lg:translate-x-0
          ${sidebarAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            {sidebarAberta && (
              <div className="overflow-hidden">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  PGO Operacional
                </p>
              </div>
            )}
          </div>

          {/* Botão colapsar (desktop) */}
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-slate-600
                       dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800
                       transition-colors shrink-0"
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-300 ${sidebarAberta ? '' : 'rotate-180'}`}
            />
          </button>

          {/* Fechar mobile */}
          <button
            onClick={() => setSidebarAberta(false)}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Empresa / Contrato */}
        {sidebarAberta && sessao && (
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {sessao.usuario.empresa ?? 'PGO Operacional'}
            </p>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
              {sessao.perfil}
            </p>
          </div>
        )}

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {itensFiltrados.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Fecha sidebar no mobile ao navegar
                  if (window.innerWidth < 1024) setSidebarAberta(false)
                }}
                title={!sidebarAberta ? t(item.labelKey as any) : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                  text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                  ${!sidebarAberta ? 'justify-center' : ''}
                `}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarAberta && (
                  <span className="truncate">{t(item.labelKey as any)}</span>
                )}
                {sidebarAberta && item.badge ? (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Usuário logado */}
        {sessao && (
          <div className={`p-3 border-t border-slate-200 dark:border-slate-800 ${sidebarAberta ? '' : 'flex justify-center'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {sessao.usuario.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarAberta && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">
                    {sessao.usuario.nome}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {sessao.usuario.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
