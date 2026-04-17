<?php

namespace App\Domain\Technician;

class Technician
{
    private ?int $id;
    private int $fkUsers;
    private string $firstName;
    private string $lastName;
    private ?int $fkLunchBlock;
    private string $status;
    private ?string $createdAt;

    public function __construct(
        ?int $id,
        int $fkUsers,
        string $firstName,
        string $lastName,
        ?int $fkLunchBlock = null,
        string $status = 'Activo',
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->fkUsers = $fkUsers;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->fkLunchBlock = $fkLunchBlock;
        $this->status = $status;
        $this->createdAt = $createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkUsers(): int { return $this->fkUsers; }
    public function getFirstName(): string { return $this->firstName; }
    public function getLastName(): string { return $this->lastName; }
    public function getFkLunchBlock(): ?int { return $this->fkLunchBlock; }
    public function getStatus(): string { return $this->status; }
    public function getCreatedAt(): ?string { return $this->createdAt; }

    public function setId(int $id): void { $this->id = $id; }
    public function setStatus(string $status): void { $this->status = $status; }
    public function setFkLunchBlock(?int $fkLunchBlock): void { $this->fkLunchBlock = $fkLunchBlock; }

    public function getFullName(): string
    {
        return "{$this->firstName} {$this->lastName}";
    }

    public function isActive(): bool
    {
        return $this->status === 'Activo';
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_users' => $this->fkUsers,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'full_name' => $this->getFullName(),
            'fk_lunch_block' => $this->fkLunchBlock,
            'status' => $this->status,
            'created_at' => $this->createdAt,
        ];
    }
}
