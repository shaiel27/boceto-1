<?php

namespace App\Domain\User;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    public function findByEmail(string $email): ?User;
    public function findAll(): array;
    public function save(User $user): User;
    public function delete(int $id): bool;
    public function findBossByUserId(int $userId): ?Boss;
    public function findBossById(int $bossId): ?Boss;
    public function saveBoss(Boss $boss): Boss;
}
