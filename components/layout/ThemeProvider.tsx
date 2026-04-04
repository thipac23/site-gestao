'use client'
// ============================================================
// ThemeProvider — aplica classe dark/light no <html>
// ============================================================
import { useEffect } from 'react'
import { useAppStore } from '@/lib/hooks/useAppStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const tema = useAppStore((s) => s.tema)

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'escuro') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [tema])

  return <>{children}</>
}
