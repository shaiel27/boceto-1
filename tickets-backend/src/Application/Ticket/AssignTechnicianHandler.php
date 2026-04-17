<?php

namespace App\Application\Ticket;

use App\Domain\Ticket\Assignment;
use App\Domain\Ticket\TicketRepositoryInterface;
use App\Domain\Technician\TechnicianRepositoryInterface;
use RuntimeException;

class AssignTechnicianHandler
{
    private TicketRepositoryInterface $ticketRepository;
    private TechnicianRepositoryInterface $technicianRepository;

    public function __construct(
        TicketRepositoryInterface $ticketRepository,
        TechnicianRepositoryInterface $technicianRepository
    ) {
        $this->ticketRepository = $ticketRepository;
        $this->technicianRepository = $technicianRepository;
    }

    public function handle(int $ticketId, array $technicianIds, int $assignedBy, array $roles = []): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        if ($ticket === null) {
            throw new RuntimeException('Ticket no encontrado');
        }

        $this->ticketRepository->deleteAssignmentsByTicketId($ticketId);

        $assignments = [];
        foreach ($technicianIds as $index => $technicianId) {
            $technician = $this->technicianRepository->findById($technicianId);
            if ($technician === null) {
                throw new RuntimeException("Técnico ID {$technicianId} no encontrado");
            }

            if (!$technician->isActive()) {
                throw new RuntimeException("El técnico {$technician->getFullName()} no está activo");
            }

            $isLead = ($index === 0);
            $assignmentRole = $roles[$technicianId] ?? ($isLead ? 'Responsable Principal' : 'Apoyo');

            $assignment = new Assignment(
                null,
                $ticketId,
                $technicianId,
                $isLead,
                $assignmentRole,
                $assignedBy
            );

            $savedAssignment = $this->ticketRepository->saveAssignment($assignment);
            $assignments[] = $savedAssignment;

            $timeline = new Timeline(
                null,
                $ticketId,
                $assignedBy,
                $isLead 
                    ? "Admin asignó a {$technician->getFullName()} como técnico principal"
                    : "Admin asignó a {$technician->getFullName()} como {$assignmentRole}",
                null,
                null
            );
            $this->ticketRepository->saveTimeline($timeline);
        }

        return $assignments;
    }
}
