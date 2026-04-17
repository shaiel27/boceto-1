<?php

namespace App\Domain\Catalog;

class SoftwareSystem
{
    private ?int $id;
    private string $systemName;
    private ?string $description;
    private string $status;

    public function __construct(
        ?int $id,
        string $systemName,
        string $status,
        ?string $description = null
    ) {
        $this->id = $id;
        $this->systemName = $systemName;
        $this->description = $description;
        $this->status = $status;
    }

    public function getId(): ?int { return $this->id; }
    public function getSystemName(): string { return $this->systemName; }
    public function getDescription(): ?string { return $this->description; }
    public function getStatus(): string { return $this->status; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'system_name' => $this->systemName,
            'description' => $this->description,
            'status' => $this->status,
        ];
    }
}
