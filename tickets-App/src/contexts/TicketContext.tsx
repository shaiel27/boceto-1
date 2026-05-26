import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Ticket, TicketComment } from '../types/ticket';
import { MOCK_TICKETS } from '../mocks/tickets';

interface TicketContextType {
  tickets: Ticket[];
  getTicketById: (id: number) => Ticket | undefined;
  takeTicket: (id: number, technicianName: string) => void;
  resolveTicket: (id: number, notes: string) => void;
  reopenTicket: (id: number) => void;
  addComment: (ticketId: number, comment: Omit<TicketComment, 'id' | 'created_at'>) => void;
}

const TicketContext = createContext<TicketContextType | null>(null);

let nextCommentId = 100;
let nextTimelineId = 100;

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(() =>
    MOCK_TICKETS.map((t) => ({ ...t }))
  );

  const getTicketById = useCallback((id: number) => {
    return tickets.find((t) => t.id === id);
  }, [tickets]);

  const takeTicket = useCallback((id: number, technicianName: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: 'En Proceso',
          technician_names: [...new Set([...t.technician_names, technicianName])],
          timeline: [
            ...t.timeline,
            {
              id: nextTimelineId++,
              fk_service_request: id,
              fk_user_actor: 2,
              action_description: 'Ticket en proceso',
              old_status: 'Pendiente',
              new_status: 'En Proceso',
              event_date: new Date().toISOString(),
              actor: technicianName,
            },
          ],
        };
      })
    );
  }, []);

  const resolveTicket = useCallback((id: number, notes: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: 'Resuelto',
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
          timeline: [
            ...t.timeline,
            {
              id: nextTimelineId++,
              fk_service_request: id,
              fk_user_actor: 2,
              action_description: 'Ticket resuelto',
              old_status: 'En Proceso',
              new_status: 'Resuelto',
              event_date: new Date().toISOString(),
              actor: t.technician_names[0] || 'Técnico',
            },
          ],
        };
      })
    );
  }, []);

  const reopenTicket = useCallback((id: number) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: 'En Proceso',
          resolved_at: null,
          resolution_notes: null,
          timeline: [
            ...t.timeline,
            {
              id: nextTimelineId++,
              fk_service_request: id,
              fk_user_actor: 2,
              action_description: 'Ticket reabierto',
              old_status: 'Resuelto',
              new_status: 'En Proceso',
              event_date: new Date().toISOString(),
              actor: t.technician_names[0] || 'Técnico',
            },
          ],
        };
      })
    );
  }, []);

  const addComment = useCallback((ticketId: number, comment: Omit<TicketComment, 'id' | 'created_at'>) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          has_attachments: t.has_attachments || (comment.attachments && comment.attachments.length > 0),
          comments: [
            ...t.comments,
            {
              ...comment,
              id: nextCommentId++,
              created_at: new Date().toISOString(),
            } as TicketComment,
          ],
        };
      })
    );
  }, []);

  return (
    <TicketContext.Provider value={{ tickets, getTicketById, takeTicket, resolveTicket, reopenTicket, addComment }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error('useTickets must be used within TicketProvider');
  return ctx;
}
