<?php

namespace App\Domain\Catalog;

interface CatalogRepositoryInterface
{
    public function findAllServices(): array;
    public function findServiceById(int $id): ?TiService;
    public function findProblemsByServiceId(int $serviceId): array;
    public function findProblemById(int $id): ?ProblemCatalog;
    public function findAllSystems(): array;
    public function findSystemById(int $id): ?SoftwareSystem;
    public function findSystemsByOfficeId(int $officeId): array;
}
