<?php

/*
 * ADVERTENCIA: Este archivo requiere clases de dominio (App\Domain\User\User,
 * App\Domain\User\UserRepositoryInterface, App\Infrastructure\Security\PasswordHasher)
 * que NO existen en este proyecto. El registro de usuarios se maneja desde
 * AuthController.php y UserController.php con lógica directa sin DDD.
 * Este archivo se mantiene como referencia arquitectónica pero no es operable.
 */

namespace App\Application\Auth;

use RuntimeException;

class RegisterUserHandler
{
    public function handle(string $email, string $password, int $roleId): array
    {
        throw new RuntimeException(
            'RegisterUserHandler no está implementado. ' .
            'Use AuthController o UserController para registro de usuarios.'
        );
    }
}
