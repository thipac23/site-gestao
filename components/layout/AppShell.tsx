'use client'
// ============================================================
// AppShell — Layout principal (Sidebar + Header + Content)
// ============================================================
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Loader2 } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
  titulo?: string
}

export function AppShell({ children, titulo }: AppShellProps) {
  const { sessao, isAutenticado } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Aguarda um tick para a sessão carregar via Supabase
    const timeout = setTimeout(() => {
      if (!sessao && !isAutenticado) {
        // Deixa o middleware lidar com o redirect
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [sessao, isAutenticado])

  // Loading enquanto carrega a sessão
  if (!sessao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090f1c]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">PG</span>
          </div>
          <Loader2 size={20} className="animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#090f1c]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header titulo={titulo} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
