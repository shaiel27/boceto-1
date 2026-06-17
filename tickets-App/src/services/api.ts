import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { ApiResponse } from '../types/api';

const FETCH_TIMEOUT = 20000;

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

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const body = await response.json();
      if (response.status === 401) {
        return { success: false, message: body.message || 'Credenciales inválidas' };
      }
      return body;
    } catch {
      const text = await response.text().catch(() => '');
      const fallback = response.status === 401 ? 'Credenciales inválidas' : `Error del servidor (${response.status})`;
      return { success: false, message: fallback };
    }
  }

  private handleError(e: any): ApiResponse {
    if (e?.message === 'TIMEOUT') {
      return { success: false, message: 'Servidor no disponible. Verifique su conexión.' };
    }
    return { success: false, message: 'Error de conexión con el servidor' };
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: await this.headers(false),
      });
      return this.handleResponse(response);
    } catch (e: any) {
      return this.handleError(e);
    }
  }

  async post<T = any>(endpoint: string, body?: any, timeout?: number): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: await this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      }, timeout);
      return this.handleResponse(response);
    } catch (e: any) {
      return this.handleError(e);
    }
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: await this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse(response);
    } catch (e: any) {
      return this.handleError(e);
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
      return this.handleResponse(response);
    } catch (e: any) {
      return this.handleError(e);
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: await this.headers(false),
      });
      return this.handleResponse(response);
    } catch (e: any) {
      return this.handleError(e);
    }
  }
}

export const apiClient = new ApiClient();
