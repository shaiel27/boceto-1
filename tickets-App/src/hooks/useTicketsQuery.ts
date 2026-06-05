import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTechnicianTickets,
  getMyTickets,
  updateTicketStatus,
  addComment as addCommentApi,
} from '../services/ticketService';
import { getDashboardStats, getRecentTickets } from '../services/adminService';

const TICKETS_KEY = ['tickets'];
const ADMIN_STATS_KEY = ['admin', 'stats'];
const ADMIN_RECENT_KEY = ['admin', 'recent'];

export function useTicketsQuery(isTechnician: boolean) {
  return useQuery({
    queryKey: TICKETS_KEY,
    queryFn: () => (isTechnician ? getTechnicianTickets() : getMyTickets()),
    select: (data) => data.tickets ?? [],
    staleTime: 30_000,
    retry: 2,
  });
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: ADMIN_STATS_KEY,
    queryFn: getDashboardStats,
    select: (data) => data.stats ?? null,
    staleTime: 30_000,
    retry: 2,
  });
}

export function useAdminRecentQuery(limit = 10) {
  return useQuery({
    queryKey: [...ADMIN_RECENT_KEY, limit],
    queryFn: () => getRecentTickets(limit),
    select: (data) => data.tickets ?? [],
    staleTime: 15_000,
    retry: 2,
  });
}

export function useTakeTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      updateTicketStatus(id, 'En Proceso', notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });
}

export function useResolveTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      updateTicketStatus(id, 'Cerrado', notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });
}

export function useAddCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      comment,
      fileUri,
    }: {
      ticketId: number;
      comment: string;
      fileUri?: string;
    }) => addCommentApi(ticketId, comment, fileUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_KEY });
    },
  });
}
