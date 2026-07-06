import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El usuario es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export const ticketSchema = z.object({
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  fk_office: z.string().min(1, 'Seleccione una oficina'),
  fk_ti_service: z.string().min(1, 'Seleccione un servicio TI'),
  fk_problem_catalog: z.string().min(1, 'Seleccione un tipo de problema'),
  property_number: z.string().optional(),
});

export const profileSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(50),
  last_name: z.string().min(1, 'El apellido es requerido').max(50),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  phone: z.string().optional(),
});

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Contraseña actual requerida'),
    new_password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm_password: z.string().min(1, 'Confirme la contraseña'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

export const commentSchema = z.object({
  comment: z.string().min(1, 'El comentario no puede estar vacío'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type TicketFormData = z.infer<typeof ticketSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
