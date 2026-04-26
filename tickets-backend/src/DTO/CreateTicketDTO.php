<?php

declare(strict_types=1);

final class CreateTicketDTO
{
    public int $fkOffice;
    public int $fkTiService;
    public ?int $fkProblemCatalog;
    public ?int $fkBossRequester;
    public ?int $fkSoftwareSystem;
    public string $subject;
    public ?string $propertyNumber;
    public string $description;
    public string $systemPriority;

    public function __construct(
        int $fkOffice,
        int $fkTiService,
        ?int $fkProblemCatalog,
        ?int $fkBossRequester,
        ?int $fkSoftwareSystem,
        string $subject,
        ?string $propertyNumber,
        string $description,
        string $systemPriority = 'Media'
    ) {
        $this->fkOffice = $fkOffice;
        $this->fkTiService = $fkTiService;
        $this->fkProblemCatalog = $fkProblemCatalog;
        $this->fkBossRequester = $fkBossRequester;
        $this->fkSoftwareSystem = $fkSoftwareSystem;
        $this->subject = $subject;
        $this->propertyNumber = $propertyNumber;
        $this->description = $description;
        $this->systemPriority = $systemPriority;

        $this->validate();
    }

    private function validate(): void
    {
        $allowedPriorities = ['Baja', 'Media', 'Alta'];
        if (!in_array($this->systemPriority, $allowedPriorities, true)) {
            throw new \InvalidArgumentException("Prioridad inválida: {$this->systemPriority}");
        }
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (int) $data['Fk_Office'],
            (int) $data['Fk_TI_Service'],
            isset($data['Fk_Problem_Catalog']) ? (int) $data['Fk_Problem_Catalog'] : null,
            isset($data['Fk_Boss_Requester']) ? (int) $data['Fk_Boss_Requester'] : null,
            isset($data['Fk_Software_System']) ? (int) $data['Fk_Software_System'] : null,
            htmlspecialchars(strip_tags($data['Subject'] ?? '')),
            isset($data['Property_Number']) ? htmlspecialchars(strip_tags($data['Property_Number'])) : null,
            htmlspecialchars(strip_tags($data['Description'] ?? '')),
            $data['System_Priority'] ?? 'Media'
        );
    }
}
