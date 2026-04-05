import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NomePerfil } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Mapeamento de Permissões por Perfil
// ──────────────────────────────────────────────────────────────

export const PERMISOS = {
  // Admin: tudo liberado
  Administrador: {
    view_programacao: true,
    create_programacao: true,
    view_atividade: true,
    create_atividade: true,
    view_presenca: true,
    create_presenca: true,
    view_hora_extra: true,
    create_hora_extra: true,
    view_logistica: true,
    create_logistica: true,
    view_financeiro: true,
    create_financeiro: true,
    view_usuarios: true,
    create_usuarios: true,
    view_metricas: true,
    view_relatorios: true,
  },

  // Planejamento: registra programações, acesso total
  Planejamento: {
    view_programacao: true,
    create_programacao: true,
    view_atividade: true,
    create_atividade: true,
    view_presenca: true,
    create_presenca: true,
    view_hora_extra: true,
    create_hora_extra: true,
    view_logistica: true,
    create_logistica: true,
    view_financeiro: false,
    create_financeiro: false,
    view_usuarios: false,
    create_usuarios: false,
    view_metricas: true,
    view_relatorios: true,
  },

  // Lider: registra atividades e hora extra, sem financeiro
  Lider: {
    view_programacao: true,
    create_programacao: false,
    view_atividade: true,
    create_atividade: true,
    view_presenca: true,
    create_presenca: false,
    view_hora_extra: true,
    create_hora_extra: true,
    view_logistica: false,
    create_logistica: false,
    view_financeiro: false,
    create_financeiro: false,
    view_usuarios: false,
    create_usuarios: false,
    view_metricas: true,
    view_relatorios: true,
  },

  // Supervisor: apenas visualização
  Supervisor: {
    view_programacao: true,
    create_programacao: false,
    view_atividade: true,
    create_atividade: false,
    view_presenca: true,
    create_presenca: false,
    view_hora_extra: true,
    create_hora_extra: false,
    view_logistica: true,
    create_logistica: false,
    view_financeiro: false,
    create_financeiro: false,
    view_usuarios: false,
    create_usuarios: false,
    view_metricas: true,
    view_relatorios: true,
  },

  // Cliente (Ternium): apenas visualização, sem financeiro
  Cliente: {
    view_programacao: true,
    create_programacao: false,
    view_atividade: true,
    create_atividade: false,
    view_presenca: false,
    create_presenca: false,
    view_hora_extra: false,
    create_hora_extra: false,
    view_logistica: false,
    create_logistica: false,
    view_financeiro: false,
    create_financeiro: false,
    view_usuarios: false,
    create_usuarios: false,
    view_metricas: true,
    view_relatorios: false,
  },

  // Financeiro: acesso a financeiro apenas
  Financeiro: {
    view_programacao: true,
    create_programacao: false,
    view_atividade: true,
    create_atividade: false,
    view_presenca: false,
    create_presenca: false,
    view_hora_extra: false,
    create_hora_extra: false,
    view_logistica: false,
    create_logistica: false,
    view_financeiro: true,
    create_financeiro: true,
    view_usuarios: false,
    create_usuarios: false,
    view_metricas: true,
    view_relatorios: false,
  },

  // Consulta: apenas leitura geral
  Consulta: {
    view_programacao: true,
    create_programacao: false,
    view_atividade: true,
    create_atividade: false,
    view_presenca: false,
    create_presenca: false,
    view_hora_extra: false,
    create_hora_extra: false,
    view_logistica: false,
    create_logistica: false,
    view_financeiro: false,
    create_financeiro: false,
    view_usuarios: false,
    create_usuarios: false,
    view_metricas: true,
    view_relatorios: false,
  },
} as const

export type Permissoes = (typeof PERMISOS)[NomePerfil]

// ──────────────────────────────────────────────────────────────
// Hook de Permissões
// ──────────────────────────────────────────────────────────────

export function useUserPermissions() {
  const supabase = createClient()
  const [perfil, setPerfil] = useState<NomePerfil | null>(null)
  const [permissoes, setPermissoes] = useState<Permissoes | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPermissoes()
  }, [])

  async function carregarPermissoes() {
    try {
      setLoading(true)

      // 1. Obter sessão do usuário
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.email) {
        console.warn('Usuário não logado')
        setLoading(false)
        return
      }

      // 2. Obter perfil do usuário
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*, perfis(nome_perfil)')
        .eq('email', user.email)
        .single()

      if (error || !usuario?.perfis?.nome_perfil) {
        console.warn('Perfil não encontrado')
        setLoading(false)
        return
      }

      const nomePerfil = usuario.perfis.nome_perfil as NomePerfil
      setPerfil(nomePerfil)
      setPermissoes(PERMISOS[nomePerfil] || PERMISOS.Consulta)
    } catch (err) {
      console.error('Erro ao carregar permissões:', err)
      setPermissoes(PERMISOS.Consulta) // Padrão: consulta apenas
    } finally {
      setLoading(false)
    }
  }

  return { perfil, permissoes, loading }
}
