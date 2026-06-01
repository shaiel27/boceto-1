import { apiClient } from './api';
import { Technician, User } from '../types/user';
import { BackendTechnicianProfile } from '../types/api';
import { mapBackendTechnicianProfile, mapBackendUser } from '../utils/mappers';

export interface ProfileResult {
  success: boolean;
  technician?: Technician;
  message?: string;
}

export async function getTechnicianProfile(): Promise<ProfileResult> {
  const response = await apiClient.get('/api/users?action=technician-profile');

  if (!response.success) {
    return { success: false, message: response.message || 'Error al obtener perfil' };
  }

  const raw = response.data as BackendTechnicianProfile | undefined;

  if (!raw) {
    return { success: false, message: 'Perfil de técnico no encontrado' };
  }

  const user: User = {
    id: raw.user_id,
    fk_role: 2,
    email: raw.email || '',
    username: raw.username || '',
    full_name: `${raw.first_name} ${raw.last_name}`,
    is_system_user: true,
    last_login_at: null,
    created_at: raw.created_at || '',
    office_id: null,
    office_name: '',
    office_type: '',
    role_name: 'Tecnico',
    status: raw.status || 'Activo',
  };

  const technician = mapBackendTechnicianProfile(raw, user);

  return { success: true, technician };
}

export async function toggleTechnicianAvailability(
  technicianId: number,
  available: boolean
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.put(`/api/technicians?id=${technicianId}`, {
    status: available ? 'Disponible' : 'Ocupado',
  });

  return { success: response.success, message: response.message };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post('/api/users?action=change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });

  return { success: response.success, message: response.message };
}

export async function getLunchBlocks(): Promise<{ success: boolean; data?: any[]; message?: string }> {
  const response = await apiClient.get('/api/lunch-blocks');
  return { success: response.success, data: response.data, message: response.message };
}

export async function getTechnicianPerformance(): Promise<{
  success: boolean;
  data?: {
    resolved_today: number;
    resolved_week: number;
    resolved_month: number;
    avg_resolution_time: string;
  };
  message?: string;
}> {
  const response = await apiClient.get('/api/technicians?action=my-performance');

  if (!response.success) {
    return { success: false, message: response.message };
  }

  return {
    success: true,
    data: {
      resolved_today: response.data?.resolved_today ?? 0,
      resolved_week: response.data?.resolved_week ?? 0,
      resolved_month: response.data?.resolved_month ?? 0,
      avg_resolution_time: response.data?.avg_resolution_time ?? '--',
    },
  };
}
