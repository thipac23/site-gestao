export const ROLES = {
  ADMIN: "admin",
  GERENTE: "gerente",
  COORDENADOR: "coordenador",
  SUPERVISOR: "supervisor",
  PLANEJAMENTO: "planejamento",
  LIDER: "lider",
  CLIENTE: "cliente",
  CLIENTE_FINANCEIRO: "cliente_financeiro",
  LOGISTICA: "logistica",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: "Administrador",
  [ROLES.GERENTE]: "Gerente",
  [ROLES.COORDENADOR]: "Coordenador",
  [ROLES.SUPERVISOR]: "Supervisor",
  [ROLES.PLANEJAMENTO]: "Planejamento",
  [ROLES.LIDER]: "Líder de Equipe",
  [ROLES.CLIENTE]: "Cliente (Ternium)",
  [ROLES.CLIENTE_FINANCEIRO]: "Cliente Financeiro",
  [ROLES.LOGISTICA]: "Logística",
};

export const CAN_SEE_FINANCIAL: Role[] = [
  ROLES.ADMIN,
  ROLES.GERENTE,
  ROLES.COORDENADOR,
  ROLES.SUPERVISOR,
  ROLES.PLANEJAMENTO,
  ROLES.CLIENTE_FINANCEIRO,
];

export const CAN_SEE_OPERATIONS: Role[] = [
  ROLES.ADMIN,
  ROLES.GERENTE,
  ROLES.COORDENADOR,
  ROLES.SUPERVISOR,
  ROLES.PLANEJAMENTO,
  ROLES.LIDER,
  ROLES.CLIENTE,
  ROLES.CLIENTE_FINANCEIRO,
];

export const LOGISTICS_ROLES: Role[] = [ROLES.LOGISTICA, ROLES.ADMIN];

export const WORKFORCE_TYPES = [
  { code: "REF", label: "Refratarista", color: "#06b6d4" },
  { code: "MEC", label: "Mecânico", color: "#8b5cf6" },
  { code: "SOL", label: "Soldador", color: "#f59e0b" },
  { code: "AND", label: "Montador de Andaime", color: "#10b981" },
  { code: "OP", label: "Operador de Equipamento", color: "#ef4444" },
] as const;

export const REPAIR_REGIONS = [
  "Porta",
  "Soleira",
  "Teto",
  "Parede Lateral",
  "Parede Testeira",
  "Canal Ascendente",
  "Canal Soleflue",
  "Downcomer",
  "Primária",
  "Quadrante",
] as const;

export const DEVIATION_REASONS = [
  "Falta de material",
  "Condição climática",
  "Falta de efetivo",
  "Acesso bloqueado",
  "Equipamento indisponível",
  "Segurança (interrupção)",
  "Forno em operação",
  "Alteração de prioridade",
  "Outro",
] as const;

export const STATUS_COLORS = {
  operational: "#10b981",
  partial: "#f59e0b",
  maintenance: "#ef4444",
  idle: "#6b7280",
} as const;
