import { apiClient } from './api';
import { BackendTicket, BackendComment, BackendTimeline } from '../types/api';
import { mapBackendTicket, mapBackendComment, mapBackendTimeline } from '../utils/mappers';
import { Ticket } from '../types/ticket';

export interface ReportItem {
  action: string;
  label: string;
  desc: string;
}

export interface ReportData {
  summary?: any;
  monthly?: any[];
  daily?: any[];
  technicians?: any[];
  [key: string]: any;
}

export async function getReportsList(): Promise<{ success: boolean; reports?: ReportItem[] }> {
  const r = await apiClient.get('/api/reports');
  if (!r.success) return { success: false };
  return { success: true, reports: r.data as ReportItem[] };
}

export async function getReport(
  action: string,
  startDate?: string,
  endDate?: string,
  format: string = 'json'
): Promise<{ success: boolean; data?: ReportData; title?: string; message?: string }> {
  const params = new URLSearchParams();
  params.append('action', action);
  params.append('format', format);
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const r = await apiClient.get(`/api/reports?${params.toString()}`);
  if (!r.success) return { success: false, message: r.message };
  return { success: true, data: r.data as ReportData, title: (r.data as any)?.title };
}

export interface DashboardStats {
  pending_count: number;
  in_progress_count: number;
  resolved_count: number;
  critical_count: number;
  today_count: number;
  week_count: number;
  avg_resolution_hours: number;
  active_offices: number;
  active_technicians: number;
  total_tickets: number;
  resolution_rate: number;
}

export interface AdminRecentTicket {
  ID_Service_Request: string;
  Ticket_Code: string | null;
  Subject: string;
  System_Priority: string;
  Status: string;
  Created_at: string;
  Office_Name: string;
  Service_Name: string;
  Technician_Names: string | null;
  Time_Ago: string;
}

export interface AdminUser {
  ID_Users: number;
  Email: string;
  Full_Name: string;
  Fk_Role: number;
  role_name: string;
  created_at: string;
  boss_name: string | null;
  boss_pronoun: string | null;
  office_name: string | null;
  office_type: string | null;
}

export const ROLE_COLORS: Record<string, string> = {
  Admin: '#8b5cf6',
  Tecnico: '#3b82f6',
  Jefe: '#10b981',
  Auditor: '#f59e0b',
};

export async function getDashboardStats(): Promise<{ success: boolean; stats?: DashboardStats; message?: string }> {
  const response = await apiClient.get('/api/dashboard?action=stats');
  if (!response.success) return { success: false, message: response.message };
  return { success: true, stats: response.data as DashboardStats };
}

export async function getRecentTickets(limit = 10): Promise<{ success: boolean; tickets?: AdminRecentTicket[] }> {
  const response = await apiClient.get(`/api/dashboard?action=recent&limit=${limit}&offset=0`);
  if (!response.success) return { success: false };
  return { success: true, tickets: response.data as AdminRecentTicket[] };
}

export async function getAllTickets(
  params: { limit?: number; offset?: number; status?: string; priority?: string; service_id?: number } = {}
): Promise<{ success: boolean; tickets?: BackendTicket[]; total?: number }> {
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', String(params.limit));
  if (params.offset) query.append('offset', String(params.offset));

  const hasFilter = params.status || params.priority || params.service_id;

  if (hasFilter) {
    query.append('action', 'filter');
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.service_id) query.append('service_id', String(params.service_id));
  }

  const qs = query.toString();
  const response = await apiClient.get(`/api/tickets?${qs}`);
  if (!response.success) return { success: false };
  return { success: true, tickets: response.data as BackendTicket[] };
}

export async function getServices(): Promise<{ success: boolean; data?: { ID_TI_Service: number; Type_Service: string }[] }> {
  const response = await apiClient.get('/api/service?action=services');
  if (!response.success) return { success: false };
  return { success: true, data: response.data };
}

export async function getAdminTicketDetail(ticketId: number): Promise<{
  success: boolean; ticket?: Ticket; message?: string;
}> {
  const [ticketRes, commentsRes, timelineRes] = await Promise.all([
    apiClient.get(`/api/tickets?action=single&id=${ticketId}`),
    apiClient.get(`/api/tickets?action=comments&id=${ticketId}`),
    apiClient.get(`/api/tickets?action=timeline&id=${ticketId}`),
  ]);

  if (!ticketRes.success || !ticketRes.data) {
    return { success: false, message: ticketRes.message || 'Ticket no encontrado' };
  }

  const ticket = mapBackendTicket(ticketRes.data as BackendTicket);

  if (commentsRes.success && commentsRes.data) {
    ticket.comments = (commentsRes.data as BackendComment[]).map(mapBackendComment);
  }

  if (timelineRes.success && timelineRes.data) {
    ticket.timeline = (timelineRes.data as BackendTimeline[]).map(mapBackendTimeline);
  }

  return { success: true, ticket };
}

export async function getUsersWithOffice(): Promise<{ success: boolean; users?: AdminUser[] }> {
  const response = await apiClient.get('/api/users?action=users-with-office');
  if (!response.success) return { success: false };
  return { success: true, users: response.data as AdminUser[] };
}

export async function deleteUser(id: number): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.delete(`/api/users?id=${id}`);
  return { success: response.success, message: response.message };
}

export async function getTechniciansGrouped(): Promise<{ success: boolean; data?: any[] }> {
  const response = await apiClient.get('/api/technicians?action=grouped');
  if (!response.success) return { success: false };
  return { success: true, data: response.data };
}

export async function createTechnician(data: {
  first_name: string; last_name: string; email: string; password: string;
  role_id: number; lunch_block?: number; status?: string;
  services: number[]; schedules: Record<string, { start: string; end: string }>;
}): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post('/api/technicians?action=create', {
    ...data, full_name: `${data.first_name} ${data.last_name}`,
    username: data.email.split('@')[0],
  });
  return { success: response.success, message: response.message };
}

export async function deleteTechnician(id: number): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.delete(`/api/technicians?id=${id}`);
  return { success: response.success, message: response.message };
}

export async function assignTechniciansToTicket(
  ticketId: number, technicianIds: number[]
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post('/api/tickets?action=assign-multiple-technicians', {
    ticket_id: ticketId, technician_ids: technicianIds,
  });
  return { success: response.success, message: response.message };
}

export async function getAvailableTechnicians(
  serviceId?: number
): Promise<{ success: boolean; data?: any[] }> {
  const qs = serviceId ? `&service_id=${serviceId}` : '';
  const response = await apiClient.get(`/api/users?action=technicians-by-service${qs}`);
  if (!response.success) return { success: false };
  return { success: true, data: response.data };
}

export async function changeTicketPriority(
  ticketId: number, priority: string
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.put(`/api/tickets?action=priority&id=${ticketId}`, {
    System_Priority: priority,
  });
  return { success: response.success, message: response.message };
}

export async function createTicket(ticketData: {
  Fk_Office: number;
  Fk_TI_Service: number;
  Fk_Problem_Catalog?: number;
  New_Problem_Name?: string;
  Fk_Software_System?: number | null;
  Subject: string;
  Property_Number?: string;
  Description: string;
  System_Priority?: string;
}): Promise<{ success: boolean; ticket_id?: number; technician_assigned?: boolean; technician_name?: string; message?: string }> {
  const response = await apiClient.post('/api/tickets', ticketData);
  if (!response.success) return { success: false, message: response.message };
  return {
    success: true,
    ticket_id: response.data?.ticket_id,
    technician_assigned: response.data?.technician_assigned,
    technician_name: response.data?.technician_name,
  };
}

export async function getOffices(): Promise<{ success: boolean; data?: { ID_Office: number; Name_Office: string }[] }> {
  const response = await apiClient.get('/api/office?action=all');
  if (!response.success) return { success: false };
  return { success: true, data: response.data };
}

export async function getProblems(serviceId: number): Promise<{ success: boolean; data?: { ID_Problem_Catalog: number; Problem_Name: string; Typical_Description: string; Estimated_Severity: string }[] }> {
  const response = await apiClient.get(`/api/service?action=problems&service_id=${serviceId}`);
  if (!response.success) return { success: false };
  return { success: true, data: response.data };
}

export async function getSystems(): Promise<{ success: boolean; data?: { ID_System: number; System_Name: string; Description: string }[] }> {
  const response = await apiClient.get('/api/service?action=software-systems');
  if (!response.success) return { success: false };
  return { success: true, data: response.data };
}
