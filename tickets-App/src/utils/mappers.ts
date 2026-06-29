import { Ticket, TicketComment, TicketAttachment, TimelineEvent } from '../types/ticket';
import { Technician, User } from '../types/user';
import {
  BackendTicket,
  BackendComment,
  BackendAttachment,
  BackendTimeline,
  BackendTechnicianProfile,
  BackendTechnicianSchedule,
  BackendUser,
} from '../types/api';

export function mapBackendUser(raw: BackendUser): User {
  const roleStr = (raw.Role || raw.role || raw.role_name || 'Tecnico').toLowerCase();
  let fkRole = 2;
  if (roleStr === 'admin') fkRole = 1;
  else if (roleStr === 'tecnico' || roleStr === 'technician') fkRole = 2;
  else if (roleStr === 'jefe' || roleStr === 'requester') fkRole = 3;
  else if (roleStr === 'auditor') fkRole = 4;

  return {
    id: parseInt(raw.ID_Users || raw.id || '0', 10),
    fk_role: parseInt(raw.ID_Role || '0', 10) || fkRole,
    email: raw.Email || raw.email || '',
    username: raw.Email ? raw.Email.split('@')[0] : '',
    full_name: raw.Full_Name || raw.full_name || '',
    is_system_user: true,
    last_login_at: raw.last_login_at || null,
    created_at: raw.created_at || '',
    office_id: raw.office_id ? parseInt(String(raw.office_id), 10) : null,
    office_name: raw.office_name || '',
    office_type: raw.office_type || '',
    role_name: raw.Role || raw.role || raw.role_name || 'Tecnico',
    status: 'Activo',
  };
}

const STATUS_MAP: Record<string, Ticket['status']> = {
  Pendiente: 'Pendiente',
  'En Proceso': 'En Proceso',
  EnProceso: 'En Proceso',
  'Pendiente de Verificación': 'Pendiente de Verificación',
  Resuelto: 'Resuelto',
  Cerrado: 'Resuelto',
};

export function mapBackendStatus(raw: string): Ticket['status'] {
  return STATUS_MAP[raw] || STATUS_MAP['Pendiente'];
}

export function mapBackendTicket(raw: BackendTicket, ticketAttachments?: TicketAttachment[]): Ticket {
  const techNames = (raw.technicians || []).map((t) => t.name);

  const ticket: Ticket = {
    id: raw.ID_Service_Request,
    ticket_code: raw.Ticket_Code || `TTT-${String(raw.ID_Service_Request).padStart(6, '0')}`,
    fk_office: raw.Fk_Office,
    fk_user_requester: raw.Fk_User_Requester,
    fk_ti_service: raw.Fk_TI_Service,
    fk_problem_catalog: raw.Fk_Problem_Catalog || 0,
    fk_boss_requester: raw.Fk_Boss_Requester || null,
    fk_software_system: raw.Fk_Software_System || null,
    subject: raw.Subject,
    property_number: raw.Property_Number || null,
    description: raw.Description || '',
    system_priority: mapPriority(raw.System_Priority),
    resolution_notes: raw.Resolution_Notes || null,
    status: mapBackendStatus(raw.Status),
    created_at: raw.Created_at,
    resolved_at: raw.Resolved_at || null,
    is_returned: Number(raw.is_returned) || 0,
    office_name: raw.office_name || '',
    citizen_name: raw.citizen_name || raw.user_name || '',
    citizen_email: raw.user_email || '',
    service_name: raw.service_type_name || '',
    problem_name: raw.problem_name || '',
    technician_names: techNames,
    comments: [],
    timeline: [],
    ticket_attachments: ticketAttachments || [],
    has_attachments: (ticketAttachments || []).length > 0,
  };
  return ticket;
}

function mapPriority(raw: string): Ticket['system_priority'] {
  const p = (raw || '').toLowerCase();
  if (p === 'alta') return 'Alta';
  if (p === 'media') return 'Media';
  return 'Baja';
}

export function mapBackendAttachment(raw: BackendAttachment): TicketAttachment {
  return {
    id: raw.ID_Attachment,
    fk_service_request: raw.Fk_Service_Request,
    fk_comment: raw.Fk_Comment || null,
    fk_user: raw.Fk_User,
    file_name: raw.File_Name,
    file_path: raw.File_Path,
    file_type: raw.File_Type,
    file_size: raw.File_Size,
    uploaded_at: raw.Uploaded_at,
  };
}

export function mapBackendComment(raw: BackendComment): TicketComment {
  return {
    id: raw.ID_Comment,
    fk_service_request: raw.Fk_Service_Request,
    fk_user: raw.Fk_User,
    comment: raw.Comment,
    created_at: raw.Created_at,
    user_name: raw.user_name || '',
    user_role: raw.user_role || '',
    attachments: (raw.attachments || []).map(mapBackendAttachment),
  };
}

export function mapBackendTimeline(raw: BackendTimeline): TimelineEvent {
  return {
    id: raw.ID_Timeline,
    fk_service_request: raw.Fk_Service_Request,
    fk_user_actor: raw.Fk_User_Actor,
    action_description: raw.Action_Description,
    old_status: raw.Old_Status || null,
    new_status: raw.New_Status || null,
    event_date: raw.Event_Date,
    actor: raw.User_Name || '',
  };
}

export function mapBackendTechnicianProfile(raw: BackendTechnicianProfile, user: User): Technician {
  const lunchHours =
    raw.lunch_start_time && raw.lunch_end_time
      ? `${raw.lunch_start_time.substring(0, 5)} - ${raw.lunch_end_time.substring(0, 5)}`
      : '';
  const techStatus = raw.status === 'Disponible'
    ? 'Disponible'
    : raw.status === 'Ocupado'
    ? 'Ocupado'
    : 'Disponible';

  return {
    ...user,
    technician_id: raw.id,
    first_name: raw.first_name || '',
    last_name: raw.last_name || '',
    fk_lunch_block: raw.lunch_block || null,
    technician_status: techStatus as Technician['technician_status'],
    services: (raw.services || []).map((s) => s.Type_Service),
    lunch_block: lunchHours,
    schedule: (raw.schedules || []).map(mapBackendSchedule),
    metrics: {
      resolved_today: 0,
      resolved_week: 0,
      resolved_month: 0,
      avg_resolution_time: 'N/A',
    },
  };
}

export function mapBackendSchedule(raw: BackendTechnicianSchedule): Technician['schedule'][0] {
  return {
    id: raw.ID_Schedule,
    fk_technician: raw.Fk_Technician,
    day_of_week: raw.Day_Of_Week,
    work_start_time: raw.Work_Start_Time,
    work_end_time: raw.Work_End_Time,
    day: raw.Day_Of_Week,
    start: raw.Work_Start_Time.substring(0, 5),
    end: raw.Work_End_Time.substring(0, 5),
  };
}
