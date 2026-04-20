<?php

namespace App\Application\Auth;

use App\Domain\User\User;
use App\Domain\User\UserRepositoryInterface;
use App\Infrastructure\Security\PasswordHasher;
use RuntimeException;

class RegisterUserHandler
{
    private UserRepositoryInterface $userRepository;
    private PasswordHasher $passwordHasher;

    public function __construct(
        UserRepositoryInterface $userRepository,
        PasswordHasher $passwordHasher
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
    }

    public function handle(string $email, string $password, int $roleId): array
    {
        // Validate input
        if (empty($email) || empty($password)) {
            throw new RuntimeException('Email y contraseña son requeridos');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Email inválido');
        }

        if (strlen($password) < 6) {
            throw new RuntimeException('La contraseña debe tener al menos 6 caracteres');
        }

        // Check if user already exists
        $existingUser = $this->userRepository->findByEmail($email);
        if ($existingUser !== null) {
            throw new RuntimeException('El email ya está registrado');
        }

        // Validate role
        if (!in_array($roleId, [1, 2, 3])) {
            throw new RuntimeException('Rol inválido');
        }

        // Hash password
        $hashedPassword = $this->passwordHasher->hash($password);

        // Create user
        $user = new User(
            null,
            $email,
            $hashedPassword,
            $roleId,
            new \DateTime()
        );

        // Save user
        $savedUser = $this->userRepository->save($user);

        return [
            'id' => $savedUser->getId(),
            'email' => $savedUser->getEmail(),
            'role' => $savedUser->getRole(),
            'role_name' => $this->getRoleName($savedUser->getRole()),
            'created_at' => $savedUser->getCreatedAt()->format('Y-m-d H:i:s')
        ];
    }

    private function getRoleName(int $roleId): string
    {
        switch ($roleId) {
            case 1:
                return 'Admin';
            case 2:
                return 'Técnico';
            case 3:
                return 'Jefe';
            default:
                return 'Desconocido';
        }
    }
}
