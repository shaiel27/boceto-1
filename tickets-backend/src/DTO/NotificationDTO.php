<?php

declare(strict_types=1);

namespace App\DTO;

final class NotificationDTO
{
    public function __construct(
        public string $type,
        public string $title,
        public string $message,
        public ?int $userId,
        public ?int $ticketId,
        public array $metadata = []
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            type: $data['type'],
            title: $data['title'],
            message: $data['message'],
            userId: $data['user_id'] ?? null,
            ticketId: $data['ticket_id'] ?? null,
            metadata: $data['metadata'] ?? []
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
