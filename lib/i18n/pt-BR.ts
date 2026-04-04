// ============================================================
// Traduções — Português Brasil (padrão)
// ============================================================
export const ptBR = {
  // App
  app_name: 'PGO Operacional',
  app_tagline: 'Gestão de campo inteligente',

  // Auth
  login: 'Entrar',
  logout: 'Sair',
  email: 'E-mail',
  senha: 'Senha',
  esqueceu_senha: 'Esqueceu a senha?',
  entrando: 'Entrando...',
  login_titulo: 'Acesse sua conta',
  login_subtitulo: 'Sistema de gestão operacional industrial',
  solicitar_acesso: 'Solicitar acesso',
  email_placeholder: 'seu@email.com',
  senha_placeholder: '••••••••',
  erro_credenciais: 'E-mail ou senha incorretos.',
  erro_generico: 'Ocorreu um erro. Tente novamente.',

  // Navegação
  dashboard: 'Dashboard',
  programacao: 'Programação',
  registro_atividade: 'Registro de Atividade',
  presenca: 'Presença',
  hora_extra: 'Hora Extra',
  logistica: 'Logística',
  relatorios: 'Relatórios',
  financeiro: 'Financeiro',
  metricas: 'Métricas',
  usuarios: 'Usuários',
  configuracoes: 'Configurações',

  // Dashboard
  bem_vindo: 'Bem-vindo',
  hoje: 'Hoje',
  data_atual: 'Data atual',
  resumo_dia: 'Resumo do dia',
  total_programado: 'Programado',
  total_realizado: 'Realizado',
  total_pendente: 'Pendente',
  aderencia: 'Aderência',
  hh_total: 'HH Total',
  produtividade: 'Produtividade',
  carregando: 'Carregando...',
  sem_dados: 'Sem dados para exibir',

  // Tabela usuários
  nome: 'Nome',
  perfil: 'Perfil',
  empresa: 'Empresa',
  status: 'Status',
  ativo: 'Ativo',
  inativo: 'Inativo',
  criado_em: 'Criado em',
  acoes: 'Ações',

  // Perfis
  perfil_administrador: 'Administrador',
  perfil_planejamento: 'Planejamento',
  perfil_supervisor: 'Supervisor',
  perfil_lider: 'Líder',
  perfil_cliente: 'Cliente',
  perfil_financeiro: 'Financeiro',
  perfil_consulta: 'Consulta',

  // Status execução
  status_realizado: 'Realizado',
  status_parcial: 'Parcial',
  status_nao_realizado: 'Não Realizado',
  status_cancelado: 'Cancelado',
  status_nao_programado: 'Não Programado',
  status_programado: 'Programado',
  status_em_execucao: 'Em Execução',
  status_concluido: 'Concluído',

  // Presença
  status_presente: 'Presente',
  status_ausente: 'Ausente',
  status_falta_justificada: 'Falta Justificada',
  status_afastado: 'Afastado',
  status_ferias: 'Férias',

  // Campos comuns
  data: 'Data',
  bateria: 'Bateria',
  bloco: 'Bloco',
  forno: 'Forno',
  lado: 'Lado',
  equipe: 'Equipe',
  atividade: 'Atividade',
  os: 'OS',
  observacao: 'Observação',
  foto: 'Foto',
  percentual: 'Percentual',
  hora_inicio: 'Hora Início',
  hora_fim: 'Hora Fim',
  salvar: 'Salvar',
  cancelar: 'Cancelar',
  editar: 'Editar',
  excluir: 'Excluir',
  novo: 'Novo',
  buscar: 'Buscar',
  filtrar: 'Filtrar',
  exportar: 'Exportar',
  imprimir: 'Imprimir',
  voltar: 'Voltar',
  confirmar: 'Confirmar',
  sim: 'Sim',
  nao: 'Não',
  obrigatorio: 'Campo obrigatório',

  // Logística
  material: 'Material',
  quantidade: 'Quantidade',
  unidade: 'Unidade',
  local_retirada: 'Local de Retirada',
  local_entrega: 'Local de Entrega',
  solicitante: 'Solicitante',
  status_pendente: 'Pendente',
  status_em_separacao: 'Em Separação',
  status_entregue: 'Entregue',

  // Erros e feedback
  sucesso: 'Sucesso!',
  erro: 'Erro',
  registro_salvo: 'Registro salvo com sucesso.',
  registro_erro: 'Erro ao salvar registro.',
  sem_permissao: 'Você não tem permissão para acessar esta área.',

  // Tema e idioma
  tema: 'Tema',
  tema_claro: 'Claro',
  tema_escuro: 'Escuro',
  idioma: 'Idioma',
}

export type TranslationKey = keyof typeof ptBR
