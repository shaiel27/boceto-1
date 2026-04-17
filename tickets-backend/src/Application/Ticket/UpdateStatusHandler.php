<?php

namespace App\Application\Ticket;

use App\Domain\Ticket\Ticket;
use App\Domain\Ticket\TicketRepositoryInterface;
use App\Domain\Ticket\TicketStatus;
use App\Domain\Ticket\Timeline;
use RuntimeException;

class UpdateStatusHandler
{
    private TicketRepositoryInterface $ticketRepository;

    public function __construct(TicketRepositoryInterface $ticketRepository)
    {
        $this->ticketRepository = $ticketRepository;
    }

    public function handle(int $ticketId, string $newStatus, int $userId, ?string $resolutionNotes = null): Ticket
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        if ($ticket === null) {
            throw new RuntimeException('Ticket no encontrado');
        }

        $ticketStatus = new TicketStatus($ticket->getStatus());
        
        if (!$ticketStatus->canTransitionTo($newStatus)) {
            throw new RuntimeException("No se puede cambiar de {$ticket->getStatus()} a {$newStatus}");
        }

        $oldStatus = $ticket->getStatus();
        $ticket->setStatus($newStatus);

        if ($newStatus === 'Resuelto') {
            $ticket->setResolvedAt(date('Y-m-d H:i:s'));
            if ($resolutionNotes !== null) {
                $ticket->setResolutionNotes($resolutionNotes);
            }
        }

        $savedTicket = $this->ticketRepository->save($ticket);

        $timeline = new Timeline(
            null,
            $ticketId,
            $userId,
            "Estado cambiado de {$oldStatus} a {$newStatus}",
            $oldStatus,
            $newStatus
        );
        $this->ticketRepository->saveTimeline($timeline);

        return $savedTicket;
    }
}
