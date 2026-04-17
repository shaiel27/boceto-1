<?php

namespace App\Domain\Technician;

class LunchBlock
{
    private ?int $id;
    private string $blockName;
    private string $startTime;
    private string $endTime;

    public function __construct(
        ?int $id,
        string $blockName,
        string $startTime,
        string $endTime
    ) {
        $this->id = $id;
        $this->blockName = $blockName;
        $this->startTime = $startTime;
        $this->endTime = $endTime;
    }

    public function getId(): ?int { return $this->id; }
    public function getBlockName(): string { return $this->blockName; }
    public function getStartTime(): string { return $this->startTime; }
    public function getEndTime(): string { return $this->endTime; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'block_name' => $this->blockName,
            'start_time' => $this->startTime,
            'end_time' => $this->endTime,
        ];
    }
}
