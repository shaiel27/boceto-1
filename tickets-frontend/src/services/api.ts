// API Configuration - Real backend

const API_BASE_URL = 'http://localhost:8000';



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

        // Store token in sessionStorage

        sessionStorage.setItem('auth_token', data.token);



        // Map backend response to frontend format

        const roleString = data.user.Role || data.user.role || 'admin';

        let roleNumber = 1;

        if (roleString.toLowerCase() === 'tecnico' || roleString.toLowerCase() === 'technician') {

          roleNumber = 2;

        } else if (roleString.toLowerCase() === 'jefe' || roleString.toLowerCase() === 'requester') {

          roleNumber = 3;

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

              role_name: roleString.charAt(0).toUpperCase() + roleString.slice(1)

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

        return {

          success: true,

          message: data.message,

          data: {

            id: data.user.id,

            email: data.user.email,

            role: data.user.role === 'admin' ? 1 : data.user.role === 'technician' ? 2 : 3,

            role_name: data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)

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



  static async createTicket(ticketData: any): Promise<ApiResponse> {

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

          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,

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



  static async getTicketComments(id: number): Promise<ApiResponse> {

    await new Promise(resolve => setTimeout(resolve, 300));

    return {

      success: true,

      message: 'Comentarios obtenidos exitosamente',

      data: []

    };

  }



  static async getTechnicianTickets(): Promise<ApiResponse> {

    await new Promise(resolve => setTimeout(resolve, 300));

    return {

      success: true,

      message: 'Tickets del técnico obtenidos exitosamente',

      data: []

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



  static async getAvailableTechnicians(serviceId: number, officeId: number): Promise<ApiResponse> {

    await new Promise(resolve => setTimeout(resolve, 300));

    return {

      success: true,

      message: 'Técnicos disponibles obtenidos exitosamente',

      data: []

    };

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

}





export default ApiService;

