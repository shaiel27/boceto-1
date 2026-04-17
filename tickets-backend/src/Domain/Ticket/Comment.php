<?php

namespace App\Domain\Ticket;

class Comment
{
    private ?int $id;
    private int $fkServiceRequest;
    private int $fkUser;
    private string $comment;
    private ?string $createdAt;

    public function __construct(
        ?int $id,
        int $fkServiceRequest,
        int $fkUser,
        string $comment,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->fkServiceRequest = $fkServiceRequest;
        $this->fkUser = $fkUser;
        $this->comment = $comment;
        $this->createdAt = $createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkServiceRequest(): int { return $this->fkServiceRequest; }
    public function getFkUser(): int { return $this->fkUser; }
    public function getComment(): string { return $this->comment; }
    public function getCreatedAt(): ?string { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_service_request' => $this->fkServiceRequest,
            'fk_user' => $this->fkUser,
            'comment' => $this->comment,
            'created_at' => $this->createdAt,
        ];
    }
}
