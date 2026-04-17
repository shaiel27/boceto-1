<?php

namespace App\Domain\Ticket;

class Ticket
{
    private ?int $id;
    private ?string $ticketCode;
    private int $fkOffice;
    private int $fkUserRequester;
    private int $fkTiService;
    private int $fkProblemCatalog;
    private int $fkBossRequester;
    private ?int $fkSoftwareSystem;
    private string $subject;
    private ?string $propertyNumber;
    private ?string $description;
    private string $systemPriority;
    private ?string $resolutionNotes;
    private string $status;
    private ?string $createdAt;
    private ?string $resolvedAt;

    public function __construct(
        ?int $id,
        int $fkOffice,
        int $fkUserRequester,
        int $fkTiService,
        int $fkProblemCatalog,
        int $fkBossRequester,
        string $subject,
        string $systemPriority,
        ?int $fkSoftwareSystem = null,
        ?string $propertyNumber = null,
        ?string $description = null,
        ?string $resolutionNotes = null,
        string $status = 'Pendiente',
        ?string $ticketCode = null,
        ?string $createdAt = null,
        ?string $resolvedAt = null
    ) {
        $this->id = $id;
        $this->ticketCode = $ticketCode;
        $this->fkOffice = $fkOffice;
        $this->fkUserRequester = $fkUserRequester;
        $this->fkTiService = $fkTiService;
        $this->fkProblemCatalog = $fkProblemCatalog;
        $this->fkBossRequester = $fkBossRequester;
        $this->fkSoftwareSystem = $fkSoftwareSystem;
        $this->subject = $subject;
        $this->propertyNumber = $propertyNumber;
        $this->description = $description;
        $this->systemPriority = $systemPriority;
        $this->resolutionNotes = $resolutionNotes;
        $this->status = $status;
        $this->createdAt = $createdAt;
        $this->resolvedAt = $resolvedAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getTicketCode(): ?string { return $this->ticketCode; }
    public function getFkOffice(): int { return $this->fkOffice; }
    public function getFkUserRequester(): int { return $this->fkUserRequester; }
    public function getFkTiService(): int { return $this->fkTiService; }
    public function getFkProblemCatalog(): int { return $this->fkProblemCatalog; }
    public function getFkBossRequester(): int { return $this->fkBossRequester; }
    public function getFkSoftwareSystem(): ?int { return $this->fkSoftwareSystem; }
    public function getSubject(): string { return $this->subject; }
    public function getPropertyNumber(): ?string { return $this->propertyNumber; }
    public function getDescription(): ?string { return $this->description; }
    public function getSystemPriority(): string { return $this->systemPriority; }
    public function getResolutionNotes(): ?string { return $this->resolutionNotes; }
    public function getStatus(): string { return $this->status; }
    public function getCreatedAt(): ?string { return $this->createdAt; }
    public function getResolvedAt(): ?string { return $this->resolvedAt; }

    public function setId(int $id): void { $this->id = $id; }
    public function setTicketCode(string $code): void { $this->ticketCode = $code; }
    public function setStatus(string $status): void { $this->status = $status; }
    public function setResolvedAt(?string $resolvedAt): void { $this->resolvedAt = $resolvedAt; }
    public function setResolutionNotes(?string $notes): void { $this->resolutionNotes = $notes; }

    public function isPending(): bool { return $this->status === 'Pendiente'; }
    public function isInProgress(): bool { return $this->status === 'En Proceso'; }
    public function isResolved(): bool { return $this->status === 'Resuelto'; }
    public function isClosed(): bool { return $this->status === 'Cerrado'; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'ticket_code' => $this->ticketCode,
            'fk_office' => $this->fkOffice,
            'fk_user_requester' => $this->fkUserRequester,
            'fk_ti_service' => $this->fkTiService,
            'fk_problem_catalog' => $this->fkProblemCatalog,
            'fk_boss_requester' => $this->fkBossRequester,
            'fk_software_system' => $this->fkSoftwareSystem,
            'subject' => $this->subject,
            'property_number' => $this->propertyNumber,
            'description' => $this->description,
            'system_priority' => $this->systemPriority,
            'resolution_notes' => $this->resolutionNotes,
            'status' => $this->status,
            'created_at' => $this->createdAt,
            'resolved_at' => $this->resolvedAt,
        ];
    }
}
