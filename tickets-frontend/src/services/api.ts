// API Configuration - Real backend
const API_BASE_URL = 'http://localhost:8012/tickets-backend/public';

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
  // Real authentication - backend connection
  static async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        return {
          success: true,
          message: data.message,
          data: {
            token: data.token,
            user: {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role === 'admin' ? 1 : data.user.role === 'technician' ? 2 : 3,
              role_name: data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)
            }
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Credenciales inválidas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
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

  // Ticket endpoints - Real backend
  static async getTickets(params?: {
    page?: number;
    per_page?: number;
    limit?: number;
    offset?: number;
    status?: string;
    office?: number;
    priority?: string;
  }): Promise<ApiResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const response = await fetch(`${API_BASE_URL}/api/tickets?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message,
          data: {
            tickets: data.data,
            total: data.data.length,
            page: params?.page || 1,
            per_page: params?.per_page || 10
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener tickets'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  static async getTicket(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=single&id=${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener ticket'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  static async createTicket(ticketData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear ticket'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  static async updateTicketStatus(id: number, status: string, resolutionNotes?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?id=${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          assigned_to: resolutionNotes ? parseInt(resolutionNotes) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al actualizar ticket'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
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

  // Technician endpoints - Real backend
  static async getTechnicians(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        // Filter technicians only
        const technicians = data.data.filter((user: any) => user.role === 'technician');
        
        return {
          success: true,
          message: data.message,
          data: technicians.map((tech: any) => ({
            id: tech.id,
            name: tech.full_name,
            email: tech.email
          }))
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener técnicos'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
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
  }
  }


export default ApiService;
