<?php

namespace App\Application\Auth;

use App\Domain\User\UserRepositoryInterface;
use App\Infrastructure\Security\PasswordHasher;
use App\Infrastructure\Security\JwtManager;
use RuntimeException;

class AuthenticateUserHandler
{
    private UserRepositoryInterface $userRepository;
    private PasswordHasher $passwordHasher;
    private JwtManager $jwtManager;

    public function __construct(
        UserRepositoryInterface $userRepository,
        PasswordHasher $passwordHasher,
        JwtManager $jwtManager
    ) {
        $this->userRepository = $userRepository;
        $this->passwordHasher = $passwordHasher;
        $this->jwtManager = $jwtManager;
    }

    public function handle(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if ($user === null) {
            throw new RuntimeException('Credenciales inválidas');
        }

        if (!$this->passwordHasher->verify($password, $user->getPassword())) {
            throw new RuntimeException('Credenciales inválidas');
        }

        $boss = $this->userRepository->findBossByUserId($user->getId());

        $payload = [
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getFkRole(),
            'role_name' => \App\Domain\User\Role::label($user->getFkRole()),
            'boss_id' => $boss?->getId(),
            'boss_name' => $boss?->getNameBoss(),
        ];

        $token = $this->jwtManager->encode($payload);

        return [
            'token' => $token,
            'user' => $payload,
        ];
    }
}
