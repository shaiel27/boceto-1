<?php

namespace App\Domain\Catalog;

class ProblemCatalog
{
    private ?int $id;
    private int $fkTiService;
    private string $problemName;
    private ?string $typicalDescription;
    private string $estimatedSeverity;

    public function __construct(
        ?int $id,
        int $fkTiService,
        string $problemName,
        string $estimatedSeverity,
        ?string $typicalDescription = null
    ) {
        $this->id = $id;
        $this->fkTiService = $fkTiService;
        $this->problemName = $problemName;
        $this->typicalDescription = $typicalDescription;
        $this->estimatedSeverity = $estimatedSeverity;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkTiService(): int { return $this->fkTiService; }
    public function getProblemName(): string { return $this->problemName; }
    public function getTypicalDescription(): ?string { return $this->typicalDescription; }
    public function getEstimatedSeverity(): string { return $this->estimatedSeverity; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_ti_service' => $this->fkTiService,
            'problem_name' => $this->problemName,
            'typical_description' => $this->typicalDescription,
            'estimated_severity' => $this->estimatedSeverity,
        ];
    }
}
