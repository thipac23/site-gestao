'use client'
// ============================================================
// Hook de autenticação — conecta Supabase Auth com tabela usuarios
// ============================================================
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from './useAppStore'
import type { SessaoUsuario } from '@/lib/types/database'
import type { NomePerfil } from '@/lib/types/database'

export function useAuth() {
  const { sessao, setSessao } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    // Escuta mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await carregarSessao(session.user.id, session.user.email!)
        } else {
          setSessao(null)
        }
      }
    )

    // Carrega sessão atual ao montar
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        await carregarSessao(user.id, user.email!)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function carregarSessao(authId: string, email: string) {
    // Busca dados na tabela usuarios pelo email (link por email)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*, perfis(*)')
      .eq('email', email)
      .eq('ativo', true)
      .single()

    if (!usuario) {
      // Usuário não encontrado na tabela — desloga
      await supabase.auth.signOut()
      setSessao(null)
      return
    }

    // Busca configurações do usuário
    const { data: config } = await supabase
      .from('configuracoes_usuario')
      .select('*')
      .eq('usuario_id', usuario.id)
      .single()

    const novaSessao: SessaoUsuario = {
      authId,
      usuario,
      perfil: (usuario.perfis?.nome_perfil ?? 'Consulta') as NomePerfil,
      config: config ?? null,
    }

    setSessao(novaSessao)

    // Sincroniza tema e idioma do usuário
    if (config) {
      useAppStore.setState({
        tema: config.tema as 'claro' | 'escuro',
        idioma: config.idioma as 'pt-BR' | 'en' | 'es' | 'ja',
      })
    }
  }

  async function login(email: string, senha: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    setSessao(null)
  }

  return {
    sessao,
    login,
    logout,
    isAutenticado: !!sessao,
  }
}

// Mapa de permissões por perfil
export const PERMISSOES: Record<NomePerfil, string[]> = {
  Administrador:  ['*'],
  Planejamento:   ['dashboard', 'programacao', 'registro_atividade', 'presenca', 'hora_extra', 'logistica', 'relatorios', 'metricas'],
  Supervisor:     ['dashboard', 'programacao', 'registro_atividade', 'presenca', 'hora_extra', 'logistica', 'relatorios', 'metricas'],
  Lider:          ['dashboard', 'registro_atividade', 'presenca', 'hora_extra', 'logistica'],
  Cliente:        ['dashboard', 'relatorios', 'metricas'],
  Financeiro:     ['dashboard', 'hora_extra', 'financeiro', 'relatorios', 'metricas'],
  Consulta:       ['dashboard', 'relatorios'],
}

export function temPermissao(perfil: NomePerfil, modulo: string): boolean {
  const perms = PERMISSOES[perfil]
  return perms.includes('*') || perms.includes(modulo)
}
