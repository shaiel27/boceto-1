import { apiClient } from './api';
import { User } from '../types/user';
import { BackendUser } from '../types/api';
import { mapBackendUser } from '../utils/mappers';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const response = await apiClient.post('/api/auth', {
    action: 'login',
    email,
    password,
  });

  if (!response.success) {
    return { success: false, message: response.message || 'Credenciales inválidas' };
  }

  const token = response.token;
  const rawUser = response.user as BackendUser | undefined;

  if (!token || !rawUser) {
    return { success: false, message: 'Respuesta del servidor incompleta' };
  }

  const user = mapBackendUser(rawUser);

  return { success: true, token, user };
}

export async function getMe(): Promise<LoginResult> {
  const response = await apiClient.get('/api/auth');

  if (!response.success) {
    return { success: false, message: response.message || 'No autenticado' };
  }

  const rawUser = response.user as BackendUser | undefined;

  if (!rawUser) {
    return { success: false, message: 'Respuesta del servidor incompleta' };
  }

  const user = mapBackendUser(rawUser);

  return { success: true, user };
}

export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post('/api/auth', { action: 'logout' });
  return { success: response.success, message: response.message };
}
