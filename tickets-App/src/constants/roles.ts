import { UserRole } from '../types/user';

export const ROLES: Record<string, UserRole> = {
  ADMIN: 1,
  TECHNICIAN: 2,
  REQUESTER: 3,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  1: 'Administrador',
  2: 'Técnico',
  3: 'Solicitante',
};

export const TAB_NAMES: Record<UserRole, { label: string; icon: string }[]> = {
  1: [
    { label: 'Dashboard', icon: 'grid' },
    { label: 'Tickets', icon: 'ticket' },
    { label: 'Técnicos', icon: 'people' },
    { label: 'Ajustes', icon: 'settings' },
  ],
  2: [
    { label: 'Inbox', icon: 'mail' },
    { label: 'Perfil', icon: 'person' },
  ],
  3: [
    { label: 'Mis Tickets', icon: 'list' },
    { label: 'Nuevo', icon: 'add-circle' },
    { label: 'Ajustes', icon: 'settings' },
  ],
};
