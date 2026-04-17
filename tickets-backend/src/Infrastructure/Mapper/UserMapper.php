<?php

namespace App\Infrastructure\Mapper;

use App\Domain\User\User;
use App\Domain\User\Boss;

class UserMapper implements EntityMapperInterface
{
    public function mapToEntity(array $data): User
    {
        return new User(
            (int)($data['ID_Users'] ?? $data['id'] ?? null),
            (int)($data['Fk_Role'] ?? $data['fk_role']),
            $data['Email'] ?? $data['email'] ?? '',
            $data['Password'] ?? $data['password'] ?? '',
            $data['created_at'] ?? null
        );
    }

    public function mapToArray(object $entity): array
    {
        if ($entity instanceof User) {
            return $entity->toArray();
        }
        throw new \InvalidArgumentException('Expected User entity');
    }

    public function mapToBoss(array $data): Boss
    {
        return new Boss(
            (int)($data['ID_Boss'] ?? $data['id'] ?? null),
            $data['Name_Boss'] ?? $data['name_boss'] ?? '',
            $data['pronoun'] ?? null,
            (int)($data['Fk_User'] ?? $data['fk_user'])
        );
    }
}
