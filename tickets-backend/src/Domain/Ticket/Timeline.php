<?php

namespace App\Domain\Ticket;

class Timeline
{
    private ?int $id;
    private int $fkServiceRequest;
    private int $fkUserActor;
    private string $actionDescription;
    private ?string $oldStatus;
    private ?string $newStatus;
    private ?string $eventDate;

    public function __construct(
        ?int $id,
        int $fkServiceRequest,
        int $fkUserActor,
        string $actionDescription,
        ?string $oldStatus = null,
        ?string $newStatus = null,
        ?string $eventDate = null
    ) {
        $this->id = $id;
        $this->fkServiceRequest = $fkServiceRequest;
        $this->fkUserActor = $this->fkUserActor;
        $this->actionDescription = $actionDescription;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->eventDate = $eventDate;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkServiceRequest(): int { return $this->fkServiceRequest; }
    public function getFkUserActor(): int { return $this->fkUserActor; }
    public function getActionDescription(): string { return $this->actionDescription; }
    public function getOldStatus(): ?string { return $this->oldStatus; }
    public function getNewStatus(): ?string { return $this->newStatus; }
    public function getEventDate(): ?string { return $this->eventDate; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_service_request' => $this->fkServiceRequest,
            'fk_user_actor' => $this->fkUserActor,
            'action_description' => $this->actionDescription,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'event_date' => $this->eventDate,
        ];
    }
}
