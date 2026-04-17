<?php

namespace App\Domain\Organization;

interface OfficeRepositoryInterface
{
    public function findById(int $id): ?Office;
    public function findAll(): array;
    public function findByType(string $type): array;
    public function findChildren(int $parentId): array;
    public function findTree(): array;
    public function save(Office $office): Office;
    public function delete(int $id): bool;
    public function findPermissionsByOfficeId(int $officeId): array;
    public function findRequestSettings(int $officeId): ?array;
}
