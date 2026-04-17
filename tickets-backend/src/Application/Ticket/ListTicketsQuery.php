<?php

namespace App\Application\Ticket;

use App\Domain\Ticket\TicketRepositoryInterface;

class ListTicketsQuery
{
    private TicketRepositoryInterface $ticketRepository;

    public function __construct(TicketRepositoryInterface $ticketRepository)
    {
        $this->ticketRepository = $ticketRepository;
    }

    public function handle(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $offset = ($page - 1) * $perPage;
        
        $tickets = $this->ticketRepository->findAll($filters, $perPage, $offset);
        $total = $this->ticketRepository->count($filters);
        
        $ticketsWithDetails = [];
        foreach ($tickets as $ticket) {
            $completeTicket = $this->ticketRepository->findCompleteTicketById($ticket->getId());
            if ($completeTicket) {
                $ticketsWithDetails[] = $completeTicket;
            }
        }

        return [
            'data' => $ticketsWithDetails,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage),
            ],
        ];
    }
}
