'use client'
// ============================================================
// Store global — Zustand
// Auth, tema, idioma, usuário logado
// ============================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessaoUsuario } from '@/lib/types/database'
import type { Idioma } from '@/lib/i18n'

interface AppState {
  // Auth
  sessao: SessaoUsuario | null
  setSessao: (sessao: SessaoUsuario | null) => void

  // UI
  tema: 'claro' | 'escuro'
  setTema: (tema: 'claro' | 'escuro') => void
  toggleTema: () => void

  idioma: Idioma
  setIdioma: (idioma: Idioma) => void

  // Sidebar
  sidebarAberta: boolean
  setSidebarAberta: (v: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      sessao: null,
      setSessao: (sessao) => set({ sessao }),

      // Tema
      tema: 'escuro',
      setTema: (tema) => set({ tema }),
      toggleTema: () =>
        set({ tema: get().tema === 'escuro' ? 'claro' : 'escuro' }),

      // Idioma
      idioma: 'pt-BR',
      setIdioma: (idioma) => set({ idioma }),

      // Sidebar
      sidebarAberta: true,
      setSidebarAberta: (v) => set({ sidebarAberta: v }),
      toggleSidebar: () => set({ sidebarAberta: !get().sidebarAberta }),
    }),
    {
      name: 'pgo-app-store',
      // Não persiste a sessão (segurança) — ela vem do Supabase Auth
      partialize: (state) => ({
        tema: state.tema,
        idioma: state.idioma,
        sidebarAberta: state.sidebarAberta,
      }),
    }
  )
)

// Hook de tradução
import { t } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

export function useT() {
  const idioma = useAppStore((s) => s.idioma)
  return (chave: TranslationKey) => t(idioma, chave)
}
