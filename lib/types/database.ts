// ============================================================
// PGO OPERACIONAL - Tipos TypeScript gerados do schema Supabase
// Nomes mantidos em português conforme banco definitivo
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ─── Perfis ───────────────────────────────────────────────────
export interface Perfil {
  id: number
  nome_perfil: string
}

export type NomePerfil =
  | 'Administrador'
  | 'Planejamento'
  | 'Supervisor'
  | 'Lider'
  | 'Cliente'
  | 'Financeiro'
  | 'Consulta'

// ─── Usuários ─────────────────────────────────────────────────
export interface Usuario {
  id: number
  nome: string
  email: string
  perfil_id: number | null
  empresa: string | null
  ativo: boolean
  criado_em: string
  perfis?: Perfil
}

// ─── Configurações do usuário ─────────────────────────────────
export interface ConfiguracaoUsuario {
  id: number
  usuario_id: number | null
  tema: 'claro' | 'escuro'
  idioma: 'pt-BR' | 'en' | 'es' | 'ja'
}

// ─── Solicitações de acesso ───────────────────────────────────
export interface SolicitacaoAcesso {
  id: number
  nome: string | null
  email: string | null
  empresa: string | null
  aprovado: boolean
  analisado_por: string | null
  data_solicitacao: string
}

// ─── Log de acesso ────────────────────────────────────────────
export interface LogAcesso {
  id: number
  usuario_id: number | null
  data_hora: string
  ip: string | null
  dispositivo: string | null
}

// ─── Auditoria ────────────────────────────────────────────────
export interface AuditoriaAcao {
  id: number
  usuario_id: number | null
  modulo: string | null
  acao: string | null
  referencia_id: number | null
  data_hora: string
  detalhes: string | null
}

// ─── Contratos ────────────────────────────────────────────────
export interface Contrato {
  id: number
  nome_contrato: string | null
  modelo_medicao: 'PU' | 'Aderencia' | 'Disponibilidade' | string | null
  ativo: boolean
}

// ─── Equipes ──────────────────────────────────────────────────
export interface Equipe {
  id: number
  nome_equipe: string | null
  contrato_id: number | null
  tipo_turno: string | null
  lider: string | null
  status: string | null
  contratos?: Contrato
}

// ─── Funções de mão de obra ───────────────────────────────────
export interface FuncaoMaoObra {
  id: number
  nome_funcao: string | null
  tipo_mao_obra: string | null
}

// ─── Colaboradores ────────────────────────────────────────────
export interface Colaborador {
  id: number
  nome: string | null
  matricula: string | null
  funcao_id: number | null
  equipe_id: number | null
  data_admissao: string | null
  data_nascimento: string | null
  endereco: string | null
  rota_onibus: string | null
  status: string | null
  funcoes_mao_obra?: FuncaoMaoObra
  equipes?: Equipe
}

// ─── Materiais ────────────────────────────────────────────────
export interface Material {
  id: number
  nome_material: string | null
  unidade: string | null
  categoria: string | null
}

// ─── Equipamentos ─────────────────────────────────────────────
export interface Equipamento {
  id: number
  patrimonio: string | null
  tipo: string | null
  status: string | null
  local_atual: string | null
}

// ─── Atividades de escopo ─────────────────────────────────────
export interface AtividadeEscopo {
  id: number
  nome_atividade: string | null
  contrato_id: number | null
  equipe_id: number | null
  descricao: string | null
  contratos?: Contrato
  equipes?: Equipe
}

// ─── Programação ──────────────────────────────────────────────
export type StatusProgramacao =
  | 'Programado'
  | 'Em Execução'
  | 'Concluído'
  | 'Cancelado'
  | 'Não Realizado'

export interface Programacao {
  id: number
  data: string | null
  bateria: string | null
  bloco: string | null
  forno: string | null
  lado: string | null
  atividade_id: number | null
  equipe_id: number | null
  os_numero: string | null
  status_programacao: StatusProgramacao | null
  criado_por: number | null
  criado_em: string
  atividades_escopo?: AtividadeEscopo
  equipes?: Equipe
  usuarios?: Usuario
}

// ─── Registros de atividade ───────────────────────────────────
export type StatusExecucao =
  | 'Realizado'
  | 'Parcial'
  | 'Não Realizado'
  | 'Cancelado'
  | 'Não Programado'

export interface RegistroAtividade {
  id: number
  data: string | null
  bateria: string | null
  bloco: string | null
  forno: string | null
  lado: string | null
  atividade_id: number | null
  equipe_id: number | null
  status_execucao: StatusExecucao | null
  percentual: number | null
  observacao: string | null
  foto_inicial_url: string | null
  foto_final_url: string | null
  programacao_id: number | null
  criado_por: number | null
  criado_em: string
  atividades_escopo?: AtividadeEscopo
  equipes?: Equipe
  programacao?: Programacao
}

// ─── Interferências ───────────────────────────────────────────
export interface Interferencia {
  id: number
  registro_id: number | null
  inicio: string | null
  fim: string | null
  motivo: string | null
  responsavel: string | null
  impacto: string | null
  observacao: string | null
  foto_url: string | null
}

// ─── Presença diária ──────────────────────────────────────────
export type StatusPresenca =
  | 'Presente'
  | 'Ausente'
  | 'Falta Justificada'
  | 'Afastado'
  | 'Férias'

export interface PresencaDiaria {
  id: number
  data: string | null
  colaborador_id: number | null
  equipe_id: number | null
  funcao_id: number | null
  status_presenca: StatusPresenca | null
  hora_registro: string | null
  foto_url: string | null
  observacao: string | null
  colaboradores?: Colaborador
  equipes?: Equipe
  funcoes_mao_obra?: FuncaoMaoObra
}

// ─── Hora extra ───────────────────────────────────────────────
export interface RegistroHoraExtra {
  id: number
  data: string | null
  atividade_id: number | null
  contrato_id: number | null
  equipe_id: number | null
  bateria: string | null
  bloco: string | null
  forno: string | null
  lado: string | null
  hora_inicio: string | null
  hora_fim: string | null
  observacao: string | null
  criado_por: number | null
  atividades_escopo?: AtividadeEscopo
  contratos?: Contrato
  equipes?: Equipe
}

export interface RegistroHoraExtraColaborador {
  id: number
  registro_he_id: number | null
  colaborador_id: number | null
  funcao_id: number | null
  horas_trabalhadas: number | null
  valor_funcao_aplicado: number | null
  valor_total: number | null
  colaboradores?: Colaborador
  funcoes_mao_obra?: FuncaoMaoObra
}

export interface MatrizValorHoraExtra {
  id: number
  funcao_id: number | null
  contrato_id: number | null
  valor_hora: number | null
  vigencia_inicio: string | null
  vigencia_fim: string | null
}

// ─── Logística / Materiais ────────────────────────────────────
export type StatusSolicitacao =
  | 'Pendente'
  | 'Em Separação'
  | 'Entregue'
  | 'Cancelado'

export interface SolicitacaoMaterial {
  id: number
  data: string | null
  solicitante_id: number | null
  material_id: number | null
  quantidade: number | null
  unidade: string | null
  local_retirada: string | null
  local_entrega: string | null
  hora_solicitacao: string | null
  hora_entrega: string | null
  foto_url: string | null
  status_solicitacao: StatusSolicitacao | null
  atividade_origem_id: number | null
  materiais?: Material
  usuarios?: Usuario
}

// ─── Financeiro ───────────────────────────────────────────────
export interface MatrizValorContrato {
  id: number
  contrato_id: number | null
  atividade_id: number | null
  unidade_medicao: string | null
  valor_unitario: number | null
  modelo_medicao: string | null
  vigencia_inicio: string | null
  vigencia_fim: string | null
}

export interface FinanceiroRegistro {
  id: number
  registro_id: number | null
  matriz_valor_id: number | null
  quantidade_apurada: number | null
  valor_apurado: number | null
  status_financeiro: string | null
}

export interface FinanceiroHoraExtra {
  id: number
  registro_he_colaborador_id: number | null
  valor_apurado: number | null
  status_financeiro: string | null
}

// ─── Validação RDO ────────────────────────────────────────────
export interface ValidacaoRdo {
  id: number
  periodo_inicio: string | null
  periodo_fim: string | null
  validado_por: string | null
  tipo_validacao: 'email' | 'sistema' | string | null
  data_validacao: string
}

// ─── Métricas ─────────────────────────────────────────────────
export interface MetricaDiaria {
  id: number
  data: string | null
  equipe_id: number | null
  contrato_id: number | null
  total_programado: number | null
  total_realizado: number | null
  total_cancelado: number | null
  total_nao_realizado: number | null
  total_nao_programado: number | null
  total_hora_extra_atividades: number | null
  hh_total: number | null
  hh_normal: number | null
  hh_hora_extra: number | null
  aderencia_reframax: number | null
  aderencia_cliente: number | null
  produtividade: number | null
  perdas: number | null
  desvios: number | null
  valor_apurado: number | null
  equipes?: Equipe
  contratos?: Contrato
}

export interface MetricaAcumulada {
  id: number
  data_referencia: string | null
  equipe_id: number | null
  contrato_id: number | null
  previsto_acumulado: number | null
  realizado_acumulado: number | null
  hh_acumulado: number | null
  valor_acumulado: number | null
  produtividade_acumulada: number | null
  previsao_futura: number | null
}

// ─── Relatórios ───────────────────────────────────────────────
export interface Relatorio {
  id: number
  data_inicio: string | null
  data_fim: string | null
  equipe_id: number | null
  bateria: string | null
  contrato_id: number | null
  gerado_por: number | null
  arquivo_url: string | null
}

// ─── Contexto de auth / sessão ────────────────────────────────
export interface SessaoUsuario {
  authId: string           // UUID do Supabase Auth
  usuario: Usuario         // dados da tabela usuarios
  perfil: NomePerfil       // nome do perfil para controle de acesso
  config: ConfiguracaoUsuario | null
}
