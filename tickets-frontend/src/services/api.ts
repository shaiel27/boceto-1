// API Configuration - Mock authentication (no backend)
const API_BASE_URL = '';

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
  static async getTickets(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    office?: number;
    priority?: string;
  }): Promise<ApiResponse> {
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
  }
}

export default ApiService;
