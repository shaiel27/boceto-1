<?php

namespace App\Domain\User;

class Boss
{
    private ?int $id;
    private string $nameBoss;
    private ?string $pronoun;
    private int $fkUser;

    public function __construct(
        ?int $id,
        string $nameBoss,
        ?string $pronoun,
        int $fkUser
    ) {
        $this->id = $id;
        $this->nameBoss = $nameBoss;
        $this->pronoun = $pronoun;
        $this->fkUser = $fkUser;
    }

    public function getId(): ?int { return $this->id; }
    public function getNameBoss(): string { return $this->nameBoss; }
    public function getPronoun(): ?string { return $this->pronoun; }
    public function getFkUser(): int { return $this->fkUser; }

    public function setId(int $id): void { $this->id = $id; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name_boss' => $this->nameBoss,
            'pronoun' => $this->pronoun,
            'fk_user' => $this->fkUser,
        ];
    }
}
