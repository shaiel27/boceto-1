// API Configuration - Real backend (CRA: reiniciar `npm start` tras cambiar .env)

function resolveApiBase(): string {
  const explicit = process.env.REACT_APP_API_BASE?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const fromApiUrl = process.env.REACT_APP_API_URL?.trim().replace(/\/$/, '');
  if (fromApiUrl) {
    return fromApiUrl.endsWith('/api') ? fromApiUrl.slice(0, -4) : fromApiUrl;
  }
  return 'http://192.168.1.6:8000';
}


export const API_BASE_URL = resolveApiBase();

function resolveSseBase(): string {
  const explicit = process.env.REACT_APP_SSE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const port = parseInt(process.env.REACT_APP_API_BASE?.match(/:(\d+)/)?.[1] || '8000', 10);
  return API_BASE_URL.replace(new RegExp(`:${port}$`), `:${port + 1}`);
}

export const SSE_BASE_URL = resolveSseBase();
const DASHBOARD_API_BASE = `${API_BASE_URL}/api/dashboard-public`;



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

    full_name?: string;

    boss_id?: number;

    boss_name?: string;

    office_id?: number | null;

    last_login_at?: string | null;

  };

}



export interface RegisterResponse {

  id: number;

  email: string;

  role: number;

  role_name: string;

  created_at: string;

}



export interface CreateTicketResponse {

  ticket_id: number;

  technician_assigned: boolean;

  technician_name: string | null;

}



export class ApiService {

  static getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

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

        // Store token in sessionStorage

        sessionStorage.setItem('auth_token', data.token);



        // Map backend response to frontend format

        const roleString = data.user.Role || data.user.role || 'admin';

        let roleNumber = 1;

        if (roleString.toLowerCase() === 'tecnico' || roleString.toLowerCase() === 'technician') {

          roleNumber = 2;

        } else if (roleString.toLowerCase() === 'jefe' || roleString.toLowerCase() === 'requester') {

          roleNumber = 3;

        } else if (roleString.toLowerCase() === 'solicitante') {

          roleNumber = 4;

        }



        return {

          success: true,

          message: data.message || 'Login exitoso',

          data: {

            token: data.token,

            user: {

              id: parseInt(data.user.ID_Users || data.user.id),

              email: data.user.Email || data.user.email,

              full_name: data.user.Full_Name || data.user.full_name,

              role: roleNumber,

              role_name: roleString.charAt(0).toUpperCase() + roleString.slice(1),

              office_id: data.user.office_id ? parseInt(data.user.office_id) : null,

              last_login_at: data.user.last_login_at ?? null

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
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          role_id: roleId
        })
      });

      const data = await response.json();

      if (data.success) {
        return data;
      }

      return {
        success: false,
        message: data.message || data.errors?.email || data.errors?.password || 'Error al registrar usuario'
      };
    } catch (error) {
      console.error('[API] Error en register:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }



  static async logout(): Promise<ApiResponse> {

    try {

      sessionStorage.removeItem('auth_token');

      return {

        success: true,

        message: 'Sesión cerrada exitosamente'

      };

    } catch (error) {

      return {

        success: false,

        message: 'Error al cerrar sesión'

      };

    }

  }

  // PHP-PRO: Change password method with backend integration
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users?action=change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: data.message || 'Contraseña cambiada exitosamente'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al cambiar contraseña'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }



  static async getMe(): Promise<ApiResponse<LoginResponse['user']>> {

    try {

      const token = sessionStorage.getItem('auth_token');



      if (!token) {

        return {

          success: false,

          message: 'No hay token de autenticación'

        };

      }



      const response = await fetch(`${API_BASE_URL}/api/auth`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json',

        }

      });



      if (!response.ok) {

        return {

          success: false,

          message: 'Error de conexión con el servidor'

        };

      }



      const data = await response.json();



      if (data.success && data.user) {

        const roleString = data.user.role || data.user.role_name || 'admin';
        let roleNumber = 1;

        if (roleString.toLowerCase() === 'tecnico' || roleString.toLowerCase() === 'technician') {
          roleNumber = 2;
        } else if (roleString.toLowerCase() === 'jefe' || roleString.toLowerCase() === 'requester') {
          roleNumber = 3;
        } else if (roleString.toLowerCase() === 'solicitante') {
          roleNumber = 4;
        }

        return {
          success: true,
          message: data.message,
          data: {
            id: data.user.id || data.user.ID_Users,
            email: data.user.email || data.user.Email,
            role: roleNumber,
            role_name: roleString.charAt(0).toUpperCase() + roleString.slice(1),
            full_name: data.user.full_name || data.user.Full_Name,
            office_id: data.user.office_id ? parseInt(data.user.office_id) : null,
            last_login_at: data.user.last_login_at ?? null
          }
        };

      } else {

        return {

          success: false,

          message: data.message || 'Sesión inválida'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async getUserProfile(userId: number): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/users?action=profile&id=${userId}`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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

          message: data.message || 'Error al obtener perfil del usuario'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

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

      if (params?.status) queryParams.append('status', params.status);

      if (params?.office) queryParams.append('office', params.office.toString());

      if (params?.priority) queryParams.append('priority', params.priority);



      const response = await fetch(`${API_BASE_URL}/api/tickets?${queryParams.toString()}`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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



  static async getMyTickets(userId: number, params?: {

    limit?: number;

    offset?: number;

  }): Promise<ApiResponse> {

    try {

      const queryParams = new URLSearchParams();

      queryParams.append('action', 'my-tickets');

      queryParams.append('user_id', userId.toString());

      if (params?.limit) queryParams.append('limit', params.limit.toString());

      if (params?.offset) queryParams.append('offset', params.offset.toString());



      const response = await fetch(`${API_BASE_URL}/api/tickets?${queryParams.toString()}`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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

          message: data.message || 'Error al obtener tickets del usuario'

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

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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



  static async createTicket(ticketData: any): Promise<ApiResponse<CreateTicketResponse>> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/tickets`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify(ticketData)

      });



      const data = await response.json();



      if (data.success) {

        return {

          success: true,

          message: data.message,

          data: {

            ticket_id: data.ticket_id,

            technician_assigned: data.technician_assigned || false,

            technician_name: data.technician_name || null

          }

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

      const response = await fetch(`${API_BASE_URL}/api/tickets?action=update-status&id=${id}`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          status,

          resolution_notes: resolutionNotes

        })

      });

      const data = await response.json();

      return data;

    } catch (error) {

      return {

        success: false,

        message: 'Error al actualizar estado del ticket'

      };

    }

  }



  static async assignTicket(id: number, technicianIds: number[], roles?: Record<number, string>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=assign-multiple-technicians`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ticket_id: id,
          technician_ids: technicianIds,
          roles
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API] Error en assignTicket:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }



  static async addTicketComment(id: number, comment: string, files?: File[]): Promise<ApiResponse> {
    return this.addComment(id, comment, files);
  }



  static async getTicketComments(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=comments&id=${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener comentarios'
      };
    }
  }

  static async getTicketTimeline(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=timeline&id=${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        return data;
      }
      
      // Fallback to mock data if backend fails or returns no data
      throw new Error('Backend response invalid');
    } catch (error) {
      // Return mock timeline data based on ticket ID
      const mockTimelineData = [
        {
          ID_Timeline: 1,
          Fk_Service_Request: id,
          Fk_User_Actor: 1,
          Action_Description: 'Ticket creado por el usuario',
          Old_Status: null as string | null,
          New_Status: 'Pendiente',
          Event_Date: new Date(Date.now() - 86400000).toISOString(),
          User_Name: 'Administrador del Sistema'
        }
      ];

      // Add additional events for ticket 2
      if (id === 2) {
        mockTimelineData.push({
          ID_Timeline: 2,
          Fk_Service_Request: id,
          Fk_User_Actor: 1,
          Action_Description: 'Estado cambiado a En Proceso',
          Old_Status: 'Pendiente' as string | null,
          New_Status: 'En Proceso',
          Event_Date: new Date(Date.now() - 43200000).toISOString(),
          User_Name: 'Administrador del Sistema'
        });
      }

      return {
        success: true,
        message: 'Timeline obtenido (datos mock)',
        data: mockTimelineData
      };
    }
  }



  static async getTechnicianTickets(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=technician-tickets`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener tickets del técnico'
      };
    }
  }

  static async getTechnicianProfile(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users?action=technician-profile`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener perfil del técnico'
      };
    }
  }



  // Technician endpoints - Real backend

  static async getTechnicians(): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technicians`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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



  static async createTechnician(technicianData: any): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technicians`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          action: 'create',

          ...technicianData

        })

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

          message: data.message || 'Error al crear técnico'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async updateTechnician(id: number, technicianData: any): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technicians?id=${id}`, {

        method: 'PUT',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          action: 'update',

          ...technicianData

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

          message: data.message || 'Error al actualizar técnico'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async deleteTechnician(id: number): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technicians?id=${id}`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        }

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

          message: data.message || 'Error al eliminar técnico'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async getAvailableTechnicians(serviceId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users?action=technicians-by-service&service_id=${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: 'Error al obtener técnicos disponibles'
      };
    }
  }

  // PHP-PRO: Get all technicians grouped by service - Backend integration
  static async getAllTechniciansGroupedByService(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/technicians?action=grouped`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener técnicos agrupados'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // PHP-PRO: Get executive summary with strategic KPIs - Backend integration
  static async getExecutiveSummary(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${DASHBOARD_API_BASE}?action=executive-summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener resumen ejecutivo'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  


  static async getLunchBlocks(): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/lunch-blocks`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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

          message: data.message || 'Error al obtener bloques de almuerzo'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async getTechnicianSchedules(technicianId: number): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technician-schedules?technician_id=${technicianId}`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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

          message: data.message || 'Error al obtener horarios'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async createTechnicianSchedule(technicianId: number, dayOfWeek: string, startTime: string, endTime: string): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technician-schedules`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          technician_id: technicianId,

          day_of_week: dayOfWeek,

          work_start_time: startTime,

          work_end_time: endTime

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

          message: data.message || 'Error al crear horario'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async deleteTechnicianSchedules(technicianId: number): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/technician-schedules?technician_id=${technicianId}`, {

        method: 'DELETE',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        }

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

          message: data.message || 'Error al eliminar horarios'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async getTechnician(id: number): Promise<ApiResponse> {

    await new Promise(resolve => setTimeout(resolve, 300));

    return {

      success: true,

      message: 'Técnico obtenido exitosamente',

      data: { id, name: 'Técnico de prueba' }

    };

  }



  static async getTechnicianAnalytics(days: string): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/analytics?days=${days}`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

          'Content-Type': 'application/json',

        },

      });



      const data = await response.json();



      if (response.ok) {

        return data;

      } else {

        return {

          success: false,

          message: data.message || 'Error al obtener análisis'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  // Office endpoints - Real backend

  static async getOffices(): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/users?action=offices`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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

          message: data.message || 'Error al obtener oficinas'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  // Dashboard endpoints - Mock data (backend was deleted)

  static async getDashboardData(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Datos del dashboard obtenidos exitosamente',
      data: {
        stats: {
          total_tickets: 1250,
          active_tickets: 70,
          resolved_tickets: 1180,
          pending_tickets: 180,
          total_technicians: 12,
          active_technicians: 8,
          avg_resolution_time: 4.5
        },
        priority_distribution: [
          { priority: 'Alta', count: 150, percentage: 12 },
          { priority: 'Media', count: 450, percentage: 36 },
          { priority: 'Baja', count: 650, percentage: 52 }
        ],
        office_distribution: [
          { office: 'Catastro', count: 320, percentage: 26 },
          { office: 'Obras', count: 280, percentage: 22 },
          { office: 'Bienestar', count: 250, percentage: 20 },
          { office: 'Hacienda', count: 200, percentage: 16 },
          { office: 'Educación', count: 200, percentage: 16 }
        ],
        service_distribution: [
          { service: 'Hardware', count: 400, percentage: 32 },
          { service: 'Software', count: 350, percentage: 28 },
          { service: 'Redes', count: 300, percentage: 24 },
          { service: 'Impresoras', count: 200, percentage: 16 }
        ],
        technician_performance: [
          { name: 'Juan Pérez', tickets_resolved: 45, efficiency: 92, avg_time: 3.5 },
          { name: 'María González', tickets_resolved: 38, efficiency: 88, avg_time: 4.2 },
          { name: 'Carlos Rodríguez', tickets_resolved: 52, efficiency: 95, avg_time: 2.8 },
          { name: 'Ana Martínez', tickets_resolved: 41, efficiency: 90, avg_time: 3.9 },
          { name: 'Pedro Sánchez', tickets_resolved: 35, efficiency: 85, avg_time: 4.5 }
        ],
        trends: [
          { month: 'Enero', tickets: 180, resolved: 165 },
          { month: 'Febrero', tickets: 220, resolved: 200 },
          { month: 'Marzo', tickets: 195, resolved: 180 },
          { month: 'Abril', tickets: 210, resolved: 195 }
        ]
      }
    };
  }

  static async getDashboardStats(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        total_tickets: 1250,
        active_tickets: 70,
        resolved_tickets: 1180,
        pending_tickets: 180,
        total_technicians: 12,
        active_technicians: 8,
        avg_resolution_time: 4.5
      }
    };
  }

  static async getPriorityDistribution(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Distribución por prioridad obtenida exitosamente',
      data: [
        { priority: 'Alta', count: 150, percentage: 12 },
        { priority: 'Media', count: 450, percentage: 36 },
        { priority: 'Baja', count: 650, percentage: 52 }
      ]
    };
  }

  static async getOfficeDistribution(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Distribución por oficina obtenida exitosamente',
      data: [
        { office: 'Catastro', count: 320, percentage: 26 },
        { office: 'Obras', count: 280, percentage: 22 },
        { office: 'Bienestar', count: 250, percentage: 20 },
        { office: 'Hacienda', count: 200, percentage: 16 },
        { office: 'Educación', count: 200, percentage: 16 }
      ]
    };
  }

  static async getTechnicianPerformance(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Rendimiento de técnicos obtenido exitosamente',
      data: [
        { name: 'Juan Pérez', tickets_resolved: 45, efficiency: 92, avg_time: 3.5 },
        { name: 'María González', tickets_resolved: 38, efficiency: 88, avg_time: 4.2 },
        { name: 'Carlos Rodríguez', tickets_resolved: 52, efficiency: 95, avg_time: 2.8 },
        { name: 'Ana Martínez', tickets_resolved: 41, efficiency: 90, avg_time: 3.9 },
        { name: 'Pedro Sánchez', tickets_resolved: 35, efficiency: 85, avg_time: 4.5 }
      ]
    };
  }

  static async getTicketTrends(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Tendencias de tickets obtenidas exitosamente',
      data: [
        { month: 'Enero', tickets: 180, resolved: 165 },
        { month: 'Febrero', tickets: 220, resolved: 200 },
        { month: 'Marzo', tickets: 195, resolved: 180 },
        { month: 'Abril', tickets: 210, resolved: 195 }
      ]
    };
  }

  static async getServiceDistribution(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Distribución por servicio obtenida exitosamente',
      data: [
        { service: 'Hardware', count: 400, percentage: 32 },
        { service: 'Software', count: 350, percentage: 28 },
        { service: 'Redes', count: 300, percentage: 24 },
        { service: 'Impresoras', count: 200, percentage: 16 }
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
    try {
      const url = serviceId 
        ? `${API_BASE_URL}/api/services?action=problems&service_id=${serviceId}`
        : `${API_BASE_URL}/api/services?action=problems`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener problemas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }



  static async getSystems(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/services?action=software-systems`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener sistemas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/office?action=distribution`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte por oficina'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
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



  // User management endpoints - Real backend

  static async getUsersWithOffice(): Promise<ApiResponse> {

    try {

      const response = await fetch(`${API_BASE_URL}/api/users?action=users-with-office`, {

        method: 'GET',

        headers: {

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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

          message: data.message || 'Error al obtener usuarios'

        };

      }

    } catch (error) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }



  static async createUserWithOffice(userData: {

    email: string;

    password: string;

    username: string;

    full_name: string;

    role: number;

    name_boss: string;

    pronoun: string;

    office_id?: number;

  }): Promise<ApiResponse> {

    try {

      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/api/users`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${token}`,

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          action: 'create-with-office',

          email: userData.email,

          password: userData.password,

          username: userData.username,

          full_name: userData.full_name,

          role: userData.role,

          name_boss: userData.name_boss,

          pronoun: userData.pronoun,

          office_id: userData.office_id

        })

      });



      const data = await response.json();



      if (data.success) {

        return {

          success: true,

          message: data.message || 'Usuario creado exitosamente',

          data: data.data

        };

      } else {

        return {

          success: false,

          message: data.message || 'Error al crear usuario'

        };

      }

    } catch (error: unknown) {

      return {

        success: false,

        message: 'Error de conexión con el servidor'

      };

    }

  }

  // Admin ticket management methods
  static async assignMultipleTechnicians(ticketId: number, technicianIds: number[]): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=assign-multiple-technicians`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket_id: ticketId,
          technician_ids: technicianIds
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al asignar técnicos'
      };
    }
  }

  static async updateTicketPriority(ticketId: number, priority: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=priority&id=${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ System_Priority: priority })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar prioridad'
      };
    }
  }

  static async getWeeklyTechnicianReport(week: string, technicianId?: number): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      params.append('week', week);
      if (technicianId) params.append('technician_id', technicianId.toString());
      
      const response = await fetch(`${API_BASE_URL}/api/weekly-report?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte de técnicos'
        };
      }
    } catch (error) {
      // Fallback to mock data if backend fails
      console.warn('[API] Usando datos de prueba (mock) para reporte semanal - la API real falló');
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockTechnicians = [
            {
              id: 1,
              nombre: 'Juan Pérez',
              tickets_resueltos: 45,
              semana: week,
              eficiencia: 92,
              tiempo_promedio: 3.5
            },
            {
              id: 2,
              nombre: 'María González',
              tickets_resueltos: 38,
              semana: week,
              eficiencia: 88,
              tiempo_promedio: 4.2
            },
            {
              id: 3,
              nombre: 'Carlos Rodríguez',
              tickets_resueltos: 52,
              semana: week,
              eficiencia: 95,
              tiempo_promedio: 2.8
            },
            {
              id: 4,
              nombre: 'Ana Martínez',
              tickets_resueltos: 41,
              semana: week,
              eficiencia: 90,
              tiempo_promedio: 3.9
            },
            {
              id: 5,
              nombre: 'Pedro Sánchez',
              tickets_resueltos: 35,
              semana: week,
              eficiencia: 85,
              tiempo_promedio: 4.5
            }
          ];

          const filteredTechnicians = technicianId
            ? mockTechnicians.filter(t => t.id === technicianId)
            : mockTechnicians;

          const mockStats = {
            week: week,
            period_start: '2024-04-01',
            period_end: '2024-04-07',
            total_tickets: technicianId ? filteredTechnicians[0]?.tickets_resueltos || 0 : 211,
            total_resolved: technicianId ? filteredTechnicians[0]?.tickets_resueltos || 0 : 211,
            active_technicians: technicianId ? 1 : 5,
            resolution_rate: 100
          };

        resolve({
          success: true,
          message: 'Reporte semanal obtenido exitosamente',
          data: {
            stats: mockStats,
            technicians: filteredTechnicians
          }
        });
      }, 500);
      });
    }
  }

  static async addComment(ticketId: number, comment: string, files?: File[]): Promise<ApiResponse> {
    try {
      const hasFiles = files && files.length > 0;

      if (hasFiles) {
        const formData = new FormData();
        formData.append('Fk_Service_Request', ticketId.toString());
        formData.append('Comment', comment);
        for (const file of files) {
          formData.append('files[]', file);
        }

        const response = await fetch(`${API_BASE_URL}/api/tickets?action=comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          },
          body: formData
        });

        const data = await response.json();
        return data;
      } else {
        const response = await fetch(`${API_BASE_URL}/api/tickets?action=comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Fk_Service_Request: ticketId,
            Comment: comment
          })
        });

        const data = await response.json();
        return data;
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al agregar comentario'
      };
    }
  }

  static async getTicketAttachments(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=attachments&id=${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener archivos adjuntos'
      };
    }
  }

  // PHP-PRO: Get technician performance metrics - Backend integration
  static async getTechnicianPerformanceMetrics(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/technicians?action=performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener métricas de rendimiento'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // PHP-PRO: Get mock technician performance metrics
  static getMockTechnicianPerformanceMetrics(): ApiResponse {
    return {
      success: true,
      message: 'Datos mock de rendimiento de técnicos',
      data: {
        'Redes': [
          { name: 'Juan Pérez', resolved_tickets: 45, avg_resolution_time: 3.5 },
          { name: 'María González', resolved_tickets: 38, avg_resolution_time: 4.2 },
          { name: 'Carlos Rodríguez', resolved_tickets: 52, avg_resolution_time: 2.8 }
        ],
        'Soporte': [
          { name: 'Ana Martínez', resolved_tickets: 41, avg_resolution_time: 3.9 },
          { name: 'Pedro Sánchez', resolved_tickets: 35, avg_resolution_time: 4.5 }
        ],
        'Programación': [
          { name: 'Luis Torres', resolved_tickets: 48, avg_resolution_time: 3.2 },
          { name: 'Carmen Vega', resolved_tickets: 43, avg_resolution_time: 3.7 }
        ]
      }
    };
  }

  // PHP-PRO: Get mock office report
  static getMockOfficeReport(): ApiResponse {
    return {
      success: true,
      message: 'Datos mock de reporte por oficina',
      data: [
        { office: 'Catastro', total_tickets: 320, resolved: 295, pending: 25, avg_time: 4.2 },
        { office: 'Obras', total_tickets: 280, resolved: 260, pending: 20, avg_time: 3.8 },
        { office: 'Bienestar', total_tickets: 250, resolved: 230, pending: 20, avg_time: 4.5 },
        { office: 'Hacienda', total_tickets: 200, resolved: 185, pending: 15, avg_time: 3.5 },
        { office: 'Educación', total_tickets: 200, resolved: 190, pending: 10, avg_time: 3.2 }
      ]
    };
  }

  // PHP-PRO: Get problem report - Backend integration
  static async getProblemReport(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/problem-report?action=all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte de problemas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // PHP-PRO: Get monthly problem report - Backend integration
  static async getMonthlyProblemReport(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/problem-report?action=monthly`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte mensual de problemas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // PHP-PRO: Get mock problem report
  static getMockProblemReport(): ApiResponse {
    return {
      success: true,
      message: 'Datos mock de reporte de problemas',
      data: [
        { month: 'Enero', service: 'Redes', problem: 'Conexión lenta', count: 40, severity: 'Media' },
        { month: 'Enero', service: 'Soporte', problem: 'Software obsoleto', count: 35, severity: 'Alta' },
        { month: 'Enero', service: 'Programación', problem: 'Bug en aplicación', count: 45, severity: 'Alta' },
        { month: 'Febrero', service: 'Redes', problem: 'Conexión lenta', count: 42, severity: 'Media' },
        { month: 'Febrero', service: 'Soporte', problem: 'Software obsoleto', count: 38, severity: 'Alta' },
        { month: 'Febrero', service: 'Programación', problem: 'Bug en aplicación', count: 48, severity: 'Alta' },
        { month: 'Marzo', service: 'Redes', problem: 'Conexión lenta', count: 45, severity: 'Media' },
        { month: 'Marzo', service: 'Soporte', problem: 'Software obsoleto', count: 36, severity: 'Alta' },
        { month: 'Marzo', service: 'Programación', problem: 'Bug en aplicación', count: 50, severity: 'Alta' },
        { month: 'Abril', service: 'Redes', problem: 'Conexión lenta', count: 38, severity: 'Media' },
        { month: 'Abril', service: 'Soporte', problem: 'Software obsoleto', count: 32, severity: 'Alta' },
        { month: 'Abril', service: 'Programación', problem: 'Bug en aplicación', count: 42, severity: 'Alta' }
      ]
    };
  }

  // PHP-PRO: Get systems and problems report - Backend integration
  static async getSystemsAndProblems(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/problem-report?action=systems`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte de sistemas y problemáticas'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // PHP-PRO: Get technician shifts report - technicians working until 5 PM
  static async getTechnicianShifts(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/technician-schedules?action=shifts-report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte de turnos de técnicos'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // PHP-PRO: Get general tickets report with monthly statistics
  static async getGeneralTicketsReport(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=general-report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
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
          message: data.message || 'Error al obtener reporte general de tickets'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  // Assistance Request System - Real API implementation
  
  static async createAssistanceRequest(ticketId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=assistance&id=${ticketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión al solicitar asistencia'
      };
    }
  }

  static async getPendingAssistanceRequests(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=pending-assistance`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión al obtener solicitudes'
      };
    }
  }

  static async respondAssistanceRequest(requestId: number, response: 'accept' | 'reject'): Promise<ApiResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets?action=respond-assistance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ request_id: requestId, response })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión al responder solicitud'
      };
    }
  }

  static async getMyAssistanceRequests(technicianId: number): Promise<ApiResponse> {
    // Returns all assistance requests for a given technician (the ticket they requested help on)
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?action=pending-assistance&technician=${technicianId}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión al obtener solicitudes'
      };
    }
  }

  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    action_type?: string;
    severity?: string;
    from?: string;
    to?: string;
  } = {}): Promise<ApiResponse> {
    try {
      const query = new URLSearchParams();
      query.set('action', 'list');
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.search) query.set('search', params.search);
      if (params.action_type) query.set('action_type', params.action_type);
      if (params.severity) query.set('severity', params.severity);
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);

      const response = await fetch(`${API_BASE_URL}/api/audit?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API] Error en getAuditLogs:', error);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  static async getAuditStats(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/audit?action=stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[API] Error en getAuditStats:', error);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  }

  // Notification System API

  static async getNotifications(limit: number = 20, offset: number = 0): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?action=my-notifications&limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Error de conexión al obtener notificaciones' };
    }
  }

  static async getUnreadCount(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?action=unread-count`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }

  static async markNotificationRead(notificationId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?action=mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  }

}



export default ApiService;

