import { User, UserRole } from '../types/user';

interface MockCredentials {
  email: string;
  password: string;
  id: number;
  full_name: string;
  fk_role: UserRole;
  role_name: string;
  username: string;
  is_system_user: boolean;
  status: string;
}

const MOCK_USERS: MockCredentials[] = [
  {
    email: 'admin@alcaldia.gob',
    password: 'password123',
    id: 1,
    full_name: 'Admin Sistema',
    fk_role: 1,
    role_name: 'Admin',
    username: 'admin',
    is_system_user: true,
    status: 'Activo',
  },
  {
    email: 'tech1@alcaldia.gob',
    password: 'password123',
    id: 2,
    full_name: 'Carlos Técnico',
    fk_role: 2,
    role_name: 'Tecnico',
    username: 'carlos.tecnico',
    is_system_user: true,
    status: 'Activo',
  },
  {
    email: 'req1@alcaldia.gob',
    password: 'password123',
    id: 3,
    full_name: 'María Solicitante',
    fk_role: 3,
    role_name: 'Jefe',
    username: 'maria.solicitante',
    is_system_user: true,
    status: 'Activo',
  },
];

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-for-development';

export interface MockLoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message?: string;
}

export function mockLogin(email: string, password: string): Promise<MockLoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = MOCK_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (found) {
        resolve({
          success: true,
          data: {
            token: MOCK_TOKEN,
            user: {
              id: found.id,
              fk_role: found.fk_role,
              email: found.email,
              full_name: found.full_name,
              username: found.username,
              is_system_user: found.is_system_user,
              last_login_at: new Date().toISOString(),
              created_at: '2026-01-15T08:00:00',
              role_name: found.role_name,
              status: found.status,
              office_id: null,
              office_name: '',
              office_type: '',
            },
          },
        });
      } else {
        reject({
          success: false,
          message: 'Credenciales inválidas',
        });
      }
    }, 800);
  });
}

export function mockGetMe(): Promise<MockLoginResponse> {
  return Promise.resolve({
    success: true,
    data: {
      token: MOCK_TOKEN,
      user: {
        id: 2,
        fk_role: 2,
        email: 'tech1@alcaldia.gob',
        full_name: 'Carlos Técnico',
        username: 'carlos.tecnico',
        is_system_user: true,
        last_login_at: new Date().toISOString(),
        created_at: '2026-01-15T08:00:00',
        role_name: 'Tecnico',
        status: 'Activo',
        office_id: null,
        office_name: '',
        office_type: '',
      },
    },
  });
}
