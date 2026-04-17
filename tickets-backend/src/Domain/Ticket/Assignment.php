<?php

namespace App\Domain\Ticket;

class Assignment
{
    private ?int $id;
    private int $fkServiceRequest;
    private int $fkTechnician;
    private bool $isLead;
    private ?string $assignmentRole;
    private ?string $assignedAt;
    private ?int $fkAssignedBy;
    private string $status;

    public function __construct(
        ?int $id,
        int $fkServiceRequest,
        int $fkTechnician,
        bool $isLead = false,
        ?string $assignmentRole = null,
        ?int $fkAssignedBy = null,
        string $status = 'Activo',
        ?string $assignedAt = null
    ) {
        $this->id = $id;
        $this->fkServiceRequest = $fkServiceRequest;
        $this->fkTechnician = $fkTechnician;
        $this->isLead = $isLead;
        $this->assignmentRole = $assignmentRole;
        $this->assignedAt = $assignedAt;
        $this->fkAssignedBy = $fkAssignedBy;
        $this->status = $status;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkServiceRequest(): int { return $this->fkServiceRequest; }
    public function getFkTechnician(): int { return $this->fkTechnician; }
    public function isLead(): bool { return $this->isLead; }
    public function getAssignmentRole(): ?string { return $this->assignmentRole; }
    public function getAssignedAt(): ?string { return $this->assignedAt; }
    public function getFkAssignedBy(): ?int { return $this->fkAssignedBy; }
    public function getStatus(): string { return $this->status; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_service_request' => $this->fkServiceRequest,
            'fk_technician' => $this->fkTechnician,
            'is_lead' => $this->isLead,
            'assignment_role' => $this->assignmentRole,
            'assigned_at' => $this->assignedAt,
            'fk_assigned_by' => $this->fkAssignedBy,
            'status' => $this->status,
        ];
    }
}
