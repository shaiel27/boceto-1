<?php

namespace App\Domain\User;

class User
{
    private ?int $id;
    private int $fkRole;
    private string $email;
    private string $password;
    private ?string $createdAt;

    public function __construct(
        ?int $id,
        int $fkRole,
        string $email,
        string $password,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->fkRole = $fkRole;
        $this->email = $email;
        $this->password = $password;
        $this->createdAt = $createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkRole(): int { return $this->fkRole; }
    public function getEmail(): string { return $this->email; }
    public function getPassword(): string { return $this->password; }
    public function getCreatedAt(): ?string { return $this->createdAt; }

    public function setId(int $id): void { $this->id = $id; }

    public function isAdmin(): bool { return $this->fkRole === Role::ADMIN; }
    public function isTechnician(): bool { return $this->fkRole === Role::TECNICO; }
    public function isBoss(): bool { return $this->fkRole === Role::JEFE; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_role' => $this->fkRole,
            'email' => $this->email,
            'role_name' => Role::label($this->fkRole),
            'created_at' => $this->createdAt,
        ];
    }
}
