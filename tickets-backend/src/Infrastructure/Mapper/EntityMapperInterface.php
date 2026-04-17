<?php

namespace App\Infrastructure\Mapper;

interface EntityMapperInterface
{
    public function mapToEntity(array $data): object;
    public function mapToArray(object $entity): array;
}
