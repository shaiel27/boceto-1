import { apiClient } from './api';
import { Ticket, TicketComment, TimelineEvent } from '../types/ticket';
import { BackendTicket, BackendComment, BackendTimeline } from '../types/api';
import { mapBackendTicket, mapBackendComment, mapBackendTimeline } from '../utils/mappers';

export interface TicketsResult {
  success: boolean;
  tickets: Ticket[];
  message?: string;
}

export interface TicketResult {
  success: boolean;
  ticket?: Ticket;
  comments?: TicketComment[];
  timeline?: TimelineEvent[];
  message?: string;
}

export async function getTechnicianTickets(): Promise<TicketsResult> {
  const response = await apiClient.get('/api/tickets?action=technician-tickets');

  if (!response.success) {
    return { success: false, tickets: [], message: response.message || 'Error al obtener tickets' };
  }

  const rawTickets: BackendTicket[] = response.data || [];
  const tickets = rawTickets.map(mapBackendTicket);

  return { success: true, tickets };
}

export async function getTicketDetail(
  ticketId: number,
  baseTicket: Ticket | null
): Promise<TicketResult> {
  let ticket = baseTicket;

  if (!ticket) {
    const ticketsResult = await getTechnicianTickets();
    const found = ticketsResult.tickets.find((t) => t.id === ticketId);
    ticket = found || null;
  }

  const [commentsRes, timelineRes] = await Promise.all([
    apiClient.get(`/api/tickets?action=comments&id=${ticketId}`),
    apiClient.get(`/api/tickets?action=timeline&id=${ticketId}`),
  ]);

  if (!ticket) {
    return { success: false, message: 'Ticket no encontrado' };
  }

  if (commentsRes.success && commentsRes.data) {
    ticket.comments = (commentsRes.data as BackendComment[]).map(mapBackendComment);
  }

  if (timelineRes.success && timelineRes.data) {
    ticket.timeline = (timelineRes.data as BackendTimeline[]).map(mapBackendTimeline);
  }

  return { success: true, ticket, comments: ticket.comments, timeline: ticket.timeline };
}

export async function updateTicketStatus(
  id: number,
  status: string,
  resolutionNotes?: string
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post(`/api/tickets?action=update-status&id=${id}`, {
    status,
    resolution_notes: resolutionNotes || '',
  });

  return { success: response.success, message: response.message };
}

export async function addComment(
  ticketId: number,
  comment: string,
  fileUri?: string
): Promise<{ success: boolean; message?: string }> {
  if (fileUri) {
    const formData = new FormData();
    formData.append('action', 'comment');
    formData.append('Fk_Service_Request', String(ticketId));
    formData.append('Comment', comment);

    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    formData.append('files', {
      uri: fileUri,
      name: filename,
      type: mimeType,
    } as any);

    const response = await apiClient.upload('/api/tickets?action=comment', formData);
    return { success: response.success, message: response.message };
  }

  const response = await apiClient.post('/api/tickets?action=comment', {
    Fk_Service_Request: ticketId,
    Comment: comment,
  });

  return { success: response.success, message: response.message };
}

export async function requestAssistance(
  ticketId: number,
  reason: string,
  details: string
): Promise<{ success: boolean; message?: string }> {
  const endpoint = `/api/tickets?action=assistance&id=${ticketId}`;
  const response = await apiClient.post(endpoint, {
    reason,
    details,
  });

  if (response.success) {
    return { success: true };
  }

  if (response.message && response.message.includes('pendiente')) {
    return { success: false, message: 'Ya existe una solicitud de asistencia pendiente para este ticket' };
  }

  const fallbackComment = `[ASISTENCIA SOLICITADA] Motivo: ${reason}${details ? '. ' + details : ''}`;
  const commentRes = await apiClient.post('/api/tickets?action=comment', {
    ticket_id: ticketId,
    comment: fallbackComment,
  });

  return { success: commentRes.success, message: commentRes.message };
}
