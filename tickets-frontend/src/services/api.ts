<<<<<<< HEAD
// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8012/tickets-backend/public/api';
=======
// API Configuration - Mock authentication (no backend)
const API_BASE_URL = '';
>>>>>>> 9fa3f9572731e4d84d2b5e7feccfc06e3fbe82fe

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: number;
    role_name: string;
    boss_id?: number;
    boss_name?: string;
  };
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: number;
  role_name: string;
  created_at: string;
}

export class ApiService {
<<<<<<< HEAD
  private static getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    try {
      console.log('API Request:', { url, config });
      
      const response = await fetch(url, config);
      console.log('API Response:', { status: response.status, ok: response.ok });
      
      // Handle empty responses
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      console.log('API Data:', data);

      if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        console.error('API Error Response:', { status: response.status, data });
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('No se puede conectar con el servidor. Verifica que XAMPP esté corriendo y el backend accesible en http://localhost:8012/tickets-backend/public/api');
      }
      
      throw error;
    }
  }

  // Auth endpoints
  static async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(email: string, password: string, roleId: number): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role_id: roleId }),
    });
  }

  static async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  static async getMe(): Promise<ApiResponse> {
    return this.request('/auth/me');
  }

  // Ticket endpoints
=======
  // Mock authentication - no backend connection
  static async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock validation
    if (email === 'admin@alcaldia.gob' && password === 'password123') {
      return {
        success: true,
        message: 'Login exitoso',
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            email: 'admin@alcaldia.gob',
            role: 1,
            role_name: 'Admin'
          }
        }
      };
    }

    return {
      success: false,
      message: 'Credenciales inválidas'
    };
  }

  static async register(email: string, password: string, roleId: number): Promise<ApiResponse<RegisterResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: Math.floor(Math.random() * 1000),
        email: email,
        role: roleId,
        role_name: roleId === 1 ? 'Admin' : roleId === 2 ? 'Técnico' : 'Jefe',
        created_at: new Date().toISOString()
      }
    };
  }

  static async logout(): Promise<ApiResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      message: 'Sesión cerrada exitosamente'
    };
  }

  static async getMe(): Promise<ApiResponse<LoginResponse['user']>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      message: 'Usuario autenticado',
      data: {
        id: 1,
        email: 'admin@alcaldia.gob',
        role: 1,
        role_name: 'Admin'
      }
    };
  }

  // Ticket endpoints - Mock data
>>>>>>> 9fa3f9572731e4d84d2b5e7feccfc06e3fbe82fe
  static async getTickets(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    office?: number;
    priority?: string;
  }): Promise<ApiResponse> {
<<<<<<< HEAD
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request(`/tickets${queryString ? `?${queryString}` : ''}`);
  }

  static async getTicket(id: number): Promise<ApiResponse> {
    return this.request(`/tickets/${id}`);
  }

  static async createTicket(ticketData: {
    fk_office: number;
    fk_user_requester: number;
    fk_ti_service: number;
    fk_problem_catalog: number;
    fk_boss_requester: number;
    subject: string;
    system_priority: string;
    description?: string;
    property_number?: string;
    fk_software_system?: number;
  }): Promise<ApiResponse> {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  static async updateTicketStatus(id: number, status: string, resolutionNotes?: string): Promise<ApiResponse> {
    return this.request(`/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  static async assignTicket(id: number, technicianIds: number[], roles?: Record<number, string>): Promise<ApiResponse> {
    return this.request(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technician_ids: technicianIds, roles }),
    });
  }

  static async addTicketComment(id: number, comment: string): Promise<ApiResponse> {
    return this.request(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  static async getTicketTimeline(id: number): Promise<ApiResponse> {
    return this.request(`/tickets/${id}/timeline`);
  }

  // Technician endpoints
  static async getTechnicians(): Promise<ApiResponse> {
    return this.request('/technicians');
  }

  static async getAvailableTechnicians(serviceId: number, officeId: number): Promise<ApiResponse> {
    return this.request(`/technicians/available?service_id=${serviceId}&office_id=${officeId}`);
  }

  static async getTechnician(id: number): Promise<ApiResponse> {
    return this.request(`/technicians/${id}`);
  }

  // Office endpoints
  static async getOffices(): Promise<ApiResponse> {
    return this.request('/offices');
  }

  static async getOffice(id: number): Promise<ApiResponse> {
    return this.request(`/offices/${id}`);
  }

  // Catalog endpoints
  static async getServices(): Promise<ApiResponse> {
    return this.request('/catalog/services');
  }

  static async getProblems(serviceId?: number): Promise<ApiResponse> {
    const url = serviceId ? `/catalog/problems?service_id=${serviceId}` : '/catalog/problems';
    return this.request(url);
  }

  static async getSystems(): Promise<ApiResponse> {
    return this.request('/catalog/systems');
  }

  // Report endpoints
  static async getGeneralReport(): Promise<ApiResponse> {
    return this.request('/reports/general');
  }

  static async getOfficeReport(): Promise<ApiResponse> {
    return this.request('/reports/by-office');
  }

  static async getResponseTimesReport(): Promise<ApiResponse> {
    return this.request('/reports/response-times');
  }

  static async getPriorityReport(): Promise<ApiResponse> {
    return this.request('/reports/priority');
  }

  static async getMonthlyReport(): Promise<ApiResponse> {
    return this.request('/reports/monthly');
  }

  static async getServiceReport(): Promise<ApiResponse> {
    return this.request('/reports/by-service');
=======
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Tickets obtenidos exitosamente',
      data: {
        tickets: [
          {
            id: 1,
            subject: 'Sin conexión a internet',
            status: 'En Proceso',
            priority: 'Alta',
            created_at: '2024-04-20T10:00:00',
            office: 'Coordinación de Equipos'
          }
        ],
        total: 1,
        page: params?.page || 1,
        per_page: params?.per_page || 10
      }
    };
  }

  static async getTicket(id: number): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Ticket obtenido exitosamente',
      data: {
        id: id,
        subject: 'Ticket de prueba',
        status: 'Pendiente',
        priority: 'Media',
        description: 'Descripción del ticket'
      }
    };
  }

  static async createTicket(ticketData: any): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Ticket creado exitosamente',
      data: {
        id: Math.floor(Math.random() * 1000),
        ...ticketData
      }
    };
  }

  static async updateTicketStatus(id: number, status: string, resolutionNotes?: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Estado actualizado exitosamente'
    };
  }

  static async assignTicket(id: number, technicianIds: number[], roles?: Record<number, string>): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Técnicos asignados exitosamente'
    };
  }

  static async addTicketComment(id: number, comment: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Comentario agregado exitosamente'
    };
  }

  static async getTicketTimeline(id: number): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Timeline obtenido exitosamente',
      data: []
    };
  }

  // Technician endpoints - Mock data
  static async getTechnicians(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Técnicos obtenidos exitosamente',
      data: [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
        { id: 2, name: 'María González', email: 'maria@example.com' }
      ]
    };
  }

  static async getAvailableTechnicians(serviceId: number, officeId: number): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Técnicos disponibles obtenidos exitosamente',
      data: []
    };
  }

  static async getTechnician(id: number): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Técnico obtenido exitosamente',
      data: { id, name: 'Técnico de prueba' }
    };
  }

  // Office endpoints - Mock data
  static async getOffices(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Oficinas obtenidas exitosamente',
      data: [
        { id: 1, name: 'Dirección de Vialidad', type: 'Direction' },
        { id: 2, name: 'Dirección de Salud', type: 'Direction' }
      ]
    };
  }

  static async getOffice(id: number): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Oficina obtenida exitosamente',
      data: { id, name: 'Oficina de prueba' }
    };
  }

  // Catalog endpoints - Mock data
  static async getServices(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Servicios obtenidos exitosamente',
      data: [
        { id: 1, name: 'Redes', description: 'Configuración de redes' },
        { id: 2, name: 'Soporte', description: 'Soporte técnico' }
      ]
    };
  }

  static async getProblems(serviceId?: number): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Problemas obtenidos exitosamente',
      data: []
    };
  }

  static async getSystems(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Sistemas obtenidos exitosamente',
      data: []
    };
  }

  // Report endpoints - Mock data
  static async getGeneralReport(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Reporte general obtenido exitosamente',
      data: {}
    };
  }

  static async getOfficeReport(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Reporte por oficina obtenido exitosamente',
      data: {}
    };
  }

  static async getResponseTimesReport(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Reporte de tiempos de respuesta obtenido exitosamente',
      data: {}
    };
  }

  static async getPriorityReport(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Reporte de prioridad obtenido exitosamente',
      data: {}
    };
  }

  static async getMonthlyReport(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Reporte mensual obtenido exitosamente',
      data: {}
    };
  }

  static async getServiceReport(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Reporte por servicio obtenido exitosamente',
      data: {}
    };
>>>>>>> 9fa3f9572731e4d84d2b5e7feccfc06e3fbe82fe
  }
}

export default ApiService;
