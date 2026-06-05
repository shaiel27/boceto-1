import { create } from 'zustand';
import { Ticket } from '../types/ticket';
import {
  getTechnicianTickets,
  getMyTickets,
  updateTicketStatus,
  addComment as addCommentApi,
} from '../services/ticketService';

interface TicketState {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;

  fetchTickets: (isTechnician: boolean) => Promise<void>;
  getTicketById: (id: number) => Ticket | undefined;
  loadTicketDetail: (id: number) => Promise<Ticket | undefined>;
  takeTicket: (id: number, notes?: string) => Promise<boolean>;
  resolveTicket: (id: number, notes: string) => Promise<boolean>;
  addComment: (ticketId: number, comment: string, fileUri?: string) => Promise<boolean>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  isLoading: false,
  error: null,

  fetchTickets: async (isTechnician: boolean) => {
    set({ isLoading: true, error: null });
    const result = isTechnician
      ? await getTechnicianTickets()
      : await getMyTickets();

    if (result.success) {
      set({ tickets: result.tickets ?? [], isLoading: false });
    } else {
      set({ error: result.message || 'Error al cargar tickets', isLoading: false });
    }
  },

  getTicketById: (id: number) => {
    return get().tickets.find((t) => t.id === id);
  },

  loadTicketDetail: async (id: number) => {
    const cached = get().tickets.find((t) => t.id === id);
    if (cached) return cached;

    const { getTicketDetail } = await import('../services/ticketService');
    const result = await getTicketDetail(id, null);
    return result.ticket;
  },

  takeTicket: async (id: number, notes?: string) => {
    const result = await updateTicketStatus(id, 'En Proceso', notes);
    if (result.success) {
      get().fetchTickets(true);
      return true;
    }
    return false;
  },

  resolveTicket: async (id: number, notes: string) => {
    const result = await updateTicketStatus(id, 'Cerrado', notes);
    if (result.success) {
      get().fetchTickets(true);
      return true;
    }
    return false;
  },

  addComment: async (ticketId: number, comment: string, fileUri?: string) => {
    const result = await addCommentApi(ticketId, comment, fileUri);
    if (result.success) {
      const { tickets } = get();
      const isTech = tickets.some((t) => t.id === ticketId);
      get().fetchTickets(isTech);
      return true;
    }
    return false;
  },
}));
