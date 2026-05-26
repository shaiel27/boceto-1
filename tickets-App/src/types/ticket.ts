export type TicketStatus = 'Pendiente' | 'En Proceso' | 'Resuelto';
export type TicketPriority = 'Alta' | 'Media' | 'Baja';

export interface Ticket {
  id: number;
  ticket_code: string;
  fk_office: number;
  fk_user_requester: number;
  fk_ti_service: number;
  fk_problem_catalog: number;
  fk_boss_requester: number | null;
  fk_software_system: number | null;
  subject: string;
  property_number: string | null;
  description: string;
  system_priority: TicketPriority;
  resolution_notes: string | null;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;

  // Joined fields
  office_name: string;
  citizen_name: string;
  service_name: string;
  problem_name: string;
  technician_names: string[];
  comments: TicketComment[];
  timeline: TimelineEvent[];
  has_attachments: boolean;
}

export interface TicketComment {
  id: number;
  fk_service_request: number;
  fk_user: number;
  comment: string;
  created_at: string;
  // joined
  user_name: string;
  user_role: string;
  attachments: string[];
}

export interface TimelineEvent {
  id: number;
  fk_service_request: number;
  fk_user_actor: number;
  action_description: string;
  old_status: string | null;
  new_status: string | null;
  event_date: string;
  // joined
  actor: string;
}

export interface TicketTechnician {
  id: number;
  fk_service_request: number;
  fk_technician: number;
  is_lead: boolean;
  assignment_role: string | null;
  assigned_at: string;
  fk_assigned_by: number;
  status: string;
}

export interface Notification {
  id: number;
  fk_user: number;
  type: string;
  title: string;
  message: string;
  fk_service_request: number | null;
  is_read: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
}
