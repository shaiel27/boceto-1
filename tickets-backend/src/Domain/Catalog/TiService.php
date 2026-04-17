<?php

namespace App\Domain\Catalog;

class TiService
{
    private ?int $id;
    private string $typeService;
    private ?string $details;

    public function __construct(
        ?int $id,
        string $typeService,
        ?string $details = null
    ) {
        $this->id = $id;
        $this->typeService = $typeService;
        $this->details = $details;
    }

    public function getId(): ?int { return $this->id; }
    public function getTypeService(): string { return $this->typeService; }
    public function getDetails(): ?string { return $this->details; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type_service' => $this->typeService,
            'details' => $this->details,
        ];
    }
}
