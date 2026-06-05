import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { ApiResponse } from '../types/api';

const FETCH_TIMEOUT = 8000;

function fetchWithTimeout(url: string, options: RequestInit, timeout?: number): Promise<Response> {
  const t = timeout ?? FETCH_TIMEOUT;
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), t),
    ),
  ]);
}

class ApiClient {
  private async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  }

  private async headers(contentType: boolean = true): Promise<Record<string, string>> {
    const token = await this.getToken();
    const h: Record<string, string> = {};
    if (token) {
      h['Authorization'] = `Bearer ${token}`;
    }
    if (contentType) {
      h['Content-Type'] = 'application/json';
    }
    return h;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: await this.headers(false),
      });

      if (response.status === 401) {
        return { success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' };
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      if (e?.message === 'TIMEOUT') {
        return { success: false, message: 'Servidor no disponible. Verifique su conexión.' };
      }
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  async post<T = any>(endpoint: string, body?: any, timeout?: number): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      }, timeout);

      if (response.status === 401) {
        return { success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' };
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      if (e?.message === 'TIMEOUT') {
        return { success: false, message: 'Servidor no disponible. Verifique su conexión.' };
      }
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: await this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401) {
        return { success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' };
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      if (e?.message === 'TIMEOUT') {
        return { success: false, message: 'Servidor no disponible. Verifique su conexión.' };
      }
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  async upload<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (response.status === 401) {
        return { success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' };
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      if (e?.message === 'TIMEOUT') {
        return { success: false, message: 'Servidor no disponible. Verifique su conexión.' };
      }
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: await this.headers(false),
      });

      if (response.status === 401) {
        return { success: false, message: 'Sesión expirada. Inicie sesión nuevamente.' };
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      if (e?.message === 'TIMEOUT') {
        return { success: false, message: 'Servidor no disponible. Verifique su conexión.' };
      }
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }
}

export const apiClient = new ApiClient();
