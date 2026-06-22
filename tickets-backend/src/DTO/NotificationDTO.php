<?php

declare(strict_types=1);

namespace App\DTO;

final class NotificationDTO
{
    public string $type;
    public string $title;
    public string $message;
    public ?int $userId;
    public ?int $ticketId;
    public array $metadata;

    public function __construct(
        string $type,
        string $title,
        string $message,
        ?int $userId,
        ?int $ticketId,
        array $metadata = []
    ) {
        $this->type = $type;
        $this->title = $title;
        $this->message = $message;
        $this->userId = $userId;
        $this->ticketId = $ticketId;
        $this->metadata = $metadata;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['type'],
            $data['title'],
            $data['message'],
            $data['user_id'] ?? null,
            $data['ticket_id'] ?? null,
            $data['metadata'] ?? []
        );
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'user_id' => $this->userId,
            'service_request_id' => $this->ticketId,
            'metadata' => $this->metadata
        ];
    }
}
