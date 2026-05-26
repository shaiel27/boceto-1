export type UserRole = 1 | 2 | 3;

export interface User {
  id: number;
  fk_role: number;
  email: string;
  username: string;
  full_name: string;
  is_system_user: boolean;
  last_login_at: string | null;
  created_at: string;
  // joined
  role_name: string;
  status: string;
}

export interface Boss {
  id: number;
  name_boss: string;
  pronoun: string | null;
  fk_user: number;
}

export interface Technician extends User {
  technician_id: number;
  first_name: string;
  last_name: string;
  fk_lunch_block: number | null;
  technician_status: 'Disponible' | 'Ocupado' | 'Inactivo';
  // joined
  services: string[];
  lunch_block: string;
  schedule: TechnicianSchedule[];
  metrics: TechnicianMetrics;
}

export interface TechnicianSchedule {
  id: number;
  fk_technician: number;
  day_of_week: string;
  work_start_time: string;
  work_end_time: string;
  // display
  day: string;
  start: string;
  end: string;
}

export interface TechnicianMetrics {
  resolved_today: number;
  resolved_week: number;
  resolved_month: number;
  avg_resolution_time: string;
}

export interface Office {
  id: number;
  name_office: string;
  office_type: string;
  fk_parent_office: number | null;
  fk_boss_id: number | null;
}

export interface TI_Service {
  id: number;
  type_service: string;
  details: string;
}

export interface ServiceProblem {
  id: number;
  fk_ti_service: number;
  problem_name: string;
  typical_description: string;
  estimated_severity: string;
}

export const ROLE_NAMES: Record<UserRole, string> = {
  1: 'Admin',
  2: 'Tecnico',
  3: 'Solicitante',
};
