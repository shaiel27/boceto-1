import { apiClient } from './api';

export interface BackendNotification {
  ID_Notification: number;
  Fk_User: number;
  Type: string;
  Title: string;
  Message: string;
  Fk_Service_Request: number | null;
  Is_Read: number;
  Metadata: string | null;
  Created_at: string;
  ticket_code: string;
  ticket_subject: string;
}

export interface AppNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  ticketId: number | null;
  isRead: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
  ticketCode: string;
  ticketSubject: string;
}

function mapNotification(raw: BackendNotification): AppNotification {
  let metadata: Record<string, any> | null = null;
  if (raw.Metadata) {
    try {
      metadata = JSON.parse(raw.Metadata);
    } catch {}
  }

  return {
    id: raw.ID_Notification,
    userId: raw.Fk_User,
    type: raw.Type,
    title: raw.Title,
    message: raw.Message,
    ticketId: raw.Fk_Service_Request || null,
    isRead: raw.Is_Read === 1,
    metadata,
    createdAt: raw.Created_at,
    ticketCode: raw.ticket_code,
    ticketSubject: raw.ticket_subject,
  };
}

export async function fetchNotifications(limit = 20): Promise<AppNotification[]> {
  const response = await apiClient.get(`/api/notifications?action=my-notifications&limit=${limit}`);

  if (!response.success || !response.data) {
    return [];
  }

  return (response.data as BackendNotification[]).map(mapNotification);
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiClient.get('/api/notifications?action=unread-count');

  if (!response.success || !response.data) {
    return 0;
  }

  return response.data.unread_count || 0;
}

export async function markAsRead(notificationId: number): Promise<boolean> {
  const response = await apiClient.post('/api/notifications?action=mark-read', {
    notification_id: notificationId,
  });

  return response.success;
}
