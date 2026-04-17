<?php

namespace App\Domain\User;

class Role
{
    public const ADMIN = 1;
    public const TECNICO = 2;
    public const JEFE = 3;

    private ?int $id;
    private string $role;
    private ?string $description;
    private ?string $createdAt;

    public function __construct(
        ?int $id,
        string $role,
        ?string $description = null,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->role = $role;
        $this->description = $description;
        $this->createdAt = $createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getRole(): string { return $this->role; }
    public function getDescription(): ?string { return $this->description; }
    public function getCreatedAt(): ?string { return $this->createdAt; }

    public static function label(int $roleId): string
    {
        return match ($roleId) {
            self::ADMIN => 'Admin',
            self::TECNICO => 'Tecnico',
            self::JEFE => 'Jefe',
            default => 'Desconocido',
        };
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'description' => $this->description,
            'created_at' => $this->createdAt,
        ];
    }
}
