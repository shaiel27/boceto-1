import { Technician } from '../types/user';

export const MOCK_TECHNICIAN: Technician = {
  id: 2,
  fk_role: 2,
  email: 'tech1@alcaldia.gob',
  username: 'carlos.tecnico',
  full_name: 'Carlos Técnico',
  first_name: 'Carlos',
  last_name: 'Técnico',
  role_name: 'Tecnico',
  status: 'Activo',
  is_system_user: true,
  last_login_at: '2026-05-24T10:00:00',
  created_at: '2026-01-15T08:00:00',
  technician_id: 1,
  fk_lunch_block: 2,
  technician_status: 'Disponible',
  services: ['Redes', 'Soporte Técnico'],
  lunch_block: '12:00 - 13:00',
  schedule: [
    { id: 1, fk_technician: 1, day_of_week: 'Lunes', work_start_time: '08:00', work_end_time: '17:00', day: 'Lunes', start: '08:00', end: '17:00' },
    { id: 2, fk_technician: 1, day_of_week: 'Martes', work_start_time: '08:00', work_end_time: '17:00', day: 'Martes', start: '08:00', end: '17:00' },
    { id: 3, fk_technician: 1, day_of_week: 'Miércoles', work_start_time: '08:00', work_end_time: '17:00', day: 'Miércoles', start: '08:00', end: '17:00' },
    { id: 4, fk_technician: 1, day_of_week: 'Jueves', work_start_time: '08:00', work_end_time: '17:00', day: 'Jueves', start: '08:00', end: '17:00' },
    { id: 5, fk_technician: 1, day_of_week: 'Viernes', work_start_time: '08:00', work_end_time: '15:00', day: 'Viernes', start: '08:00', end: '15:00' },
  ],
  metrics: {
    resolved_today: 2,
    resolved_week: 8,
    resolved_month: 25,
    avg_resolution_time: '3h 45m',
  },
};

export function getMockTechnicianProfile(): Promise<Technician> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_TECHNICIAN), 500);
  });
}
