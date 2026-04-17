<?php

namespace App\Domain\Ticket;

class Attachment
{
    private ?int $id;
    private int $fkServiceRequest;
    private string $fileName;
    private string $filePath;
    private ?string $uploadedAt;

    public function __construct(
        ?int $id,
        int $fkServiceRequest,
        string $fileName,
        string $filePath,
        ?string $uploadedAt = null
    ) {
        $this->id = $id;
        $this->fkServiceRequest = $fkServiceRequest;
        $this->fileName = $fileName;
        $this->filePath = $filePath;
        $this->uploadedAt = $uploadedAt;
    }

    public function getId(): ?int { return $this->id; }
    public function getFkServiceRequest(): int { return $this->fkServiceRequest; }
    public function getFileName(): string { return $this->fileName; }
    public function getFilePath(): string { return $this->filePath; }
    public function getUploadedAt(): ?string { return $this->uploadedAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fk_service_request' => $this->fkServiceRequest,
            'file_name' => $this->fileName,
            'file_path' => $this->filePath,
            'uploaded_at' => $this->uploadedAt,
        ];
    }
}
