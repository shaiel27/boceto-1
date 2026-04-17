<?php

namespace App\Domain\Organization;

class Office
{
    private ?int $id;
    private string $nameOffice;
    private string $officeType;
    private ?int $fkParentOffice;
    private ?int $fkBossId;
    private ?string $createdAt;

    public function __construct(
        ?int $id,
        string $nameOffice,
        string $officeType,
        ?int $fkParentOffice = null,
        ?int $fkBossId = null,
        ?string $createdAt = null
    ) {
        $this->id = $id;
        $this->nameOffice = $nameOffice;
        $this->officeType = $officeType;
        $this->fkParentOffice = $fkParentOffice;
        $this->fkBossId = $fkBossId;
        $this->createdAt = $createdAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getNameOffice(): string { return $this->nameOffice; }
    public function getOfficeType(): string { return $this->officeType; }
    public function getFkParentOffice(): ?int { return $this->fkParentOffice; }
    public function getFkBossId(): ?int { return $this->fkBossId; }
    public function getCreatedAt(): ?string { return $this->createdAt; }

    public function setId(int $id): void { $this->id = $id; }

    public function isDirection(): bool { return $this->officeType === 'Direction'; }
    public function isDivision(): bool { return $this->officeType === 'Division'; }
    public function isCoordination(): bool { return $this->officeType === 'Coordination'; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name_office' => $this->nameOffice,
            'office_type' => $this->officeType,
            'fk_parent_office' => $this->fkParentOffice,
            'fk_boss_id' => $this->fkBossId,
            'created_at' => $this->createdAt,
        ];
    }
}
