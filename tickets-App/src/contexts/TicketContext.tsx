import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Ticket } from '../types/ticket';
import {
  getTechnicianTickets,
  getMyTickets,
  updateTicketStatus,
  addComment as addCommentApi,
} from '../services/ticketService';
import { useAuth } from '../hooks/useAuth';

interface TicketContextType {
  tickets: Ticket[];
  getTicketById: (id: number) => Promise<Ticket | undefined>;
  takeTicket: (id: number, notes?: string) => Promise<void>;
  resolveTicket: (id: number, notes: string) => Promise<void>;
  addComment: (ticketId: number, comment: string, fileUri?: string) => Promise<void>;
  refreshTickets: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TicketContext = createContext<TicketContextType | null>(null);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const refreshTickets = useCallback(async () => {
    if (!auth.isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    const result = auth.isTechnician
      ? await getTechnicianTickets()
      : await getMyTickets();

    if (result.success) {
      setTickets(result.tickets);
    } else {
      setError(result.message || 'Error al cargar tickets');
    }
    setIsLoading(false);
  }, [auth.isAuthenticated, auth.isTechnician]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      refreshTickets();
    }
  }, [auth.isAuthenticated, refreshTickets]);

  const getTicketById = useCallback(async (id: number): Promise<Ticket | undefined> => {
    const cached = tickets.find((t) => t.id === id);
    if (cached) return cached;

    const { getTicketDetail: fetchTicketDetail } = await import('../services/ticketService');
    const result = await fetchTicketDetail(id, null);
    return result.ticket;
  }, [tickets]);

  const takeTicket = useCallback(async (id: number, notes?: string) => {
    const result = await updateTicketStatus(id, 'En Proceso', notes);

    if (result.success) {
      refreshTickets();
    }
  }, [refreshTickets]);

  const resolveTicket = useCallback(async (id: number, notes: string) => {
    const result = await updateTicketStatus(id, 'Resuelto', notes);

    if (result.success) {
      refreshTickets();
    }
  }, [refreshTickets]);

  const addComment = useCallback(async (ticketId: number, comment: string, fileUri?: string) => {
    const result = await addCommentApi(ticketId, comment, fileUri);

    if (result.success) {
      refreshTickets();
    }
  }, [refreshTickets]);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        getTicketById,
        takeTicket,
        resolveTicket,
        addComment,
        refreshTickets,
        isLoading,
        error,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
}
