import type { Role } from "./constants";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: Role;
  company?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  name: string;
  client: string;
  type: "aderencia" | "disponibilidade" | "pu";
  target: number;
  active: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  contract_id: string;
  leader_id?: string;
  leader_name?: string;
  member_count: number;
  created_at: string;
}

export interface Battery {
  id: string;
  name: string;
  furnace_count: number;
  status: "operational" | "partial" | "maintenance" | "idle";
  created_at: string;
}

export interface Furnace {
  id: string;
  battery_id: string;
  number: number;
  status: "operational" | "repair" | "maintenance" | "idle";
  region?: string;
  last_repair?: string;
}

export interface Activity {
  id: string;
  contract_id: string;
  team_id: string;
  furnace_id?: string;
  region?: string;
  description: string;
  planned_hh: number;
  actual_hh?: number;
  status: "pending" | "in_progress" | "completed" | "delayed" | "cancelled";
  deviation_reason?: string;
  scheduled_date: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
}

export interface KPI {
  id: string;
  contract_id: string;
  period_start: string;
  period_end: string;
  hh_programmed: number;
  hh_realized: number;
  adherence: number;
  activities_planned: number;
  activities_completed: number;
  deviations: number;
  deviations_resolved: number;
  availability: number;
  workforce: number;
  attendance: number;
  labor_cost?: number;
  material_cost?: number;
  pu_revenue?: number;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  location: string;
  created_at: string;
}

export interface MaterialMovement {
  id: string;
  material_id: string;
  type: "entrada" | "saida" | "transferencia";
  quantity: number;
  origin?: string;
  destination?: string;
  responsible_id: string;
  notes?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  team_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  requested_role: Role;
  justification: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}
