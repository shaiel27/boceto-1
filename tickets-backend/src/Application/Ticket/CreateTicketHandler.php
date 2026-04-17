<?php

namespace App\Application\Ticket;

use App\Domain\Ticket\Ticket;
use App\Domain\Ticket\TicketRepositoryInterface;
use App\Domain\Ticket\Timeline;
use RuntimeException;

class CreateTicketHandler
{
    private TicketRepositoryInterface $ticketRepository;

    public function __construct(TicketRepositoryInterface $ticketRepository)
    {
        $this->ticketRepository = $ticketRepository;
    }

    public function handle(array $data, int $userId): Ticket
    {
        $ticket = new Ticket(
            null,
            (int)$data['fk_office'],
            (int)$data['fk_user_requester'],
            (int)$data['fk_ti_service'],
            (int)$data['fk_problem_catalog'],
            (int)$data['fk_boss_requester'],
            $data['subject'],
            $data['system_priority'],
            $data['fk_software_system'] ?? null,
            $data['property_number'] ?? null,
            $data['description'] ?? null
        );

        $savedTicket = $this->ticketRepository->save($ticket);

        $timeline = new Timeline(
            null,
            $savedTicket->getId(),
            $userId,
            'Ticket creado por solicitante',
            null,
            'Pendiente'
        );
        $this->ticketRepository->saveTimeline($timeline);

        return $savedTicket;
    }
}
