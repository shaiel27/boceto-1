<?php

namespace App\Http\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Application\Auth\AuthenticateUserHandler;
use App\Infrastructure\Security\JwtManager;
use RuntimeException;

class AuthController
{
    private AuthenticateUserHandler $authHandler;
    private JwtManager $jwtManager;

    public function __construct(AuthenticateUserHandler $authHandler, JwtManager $jwtManager)
    {
        $this->authHandler = $authHandler;
        $this->jwtManager = $jwtManager;
    }

    public function login(Request $request): Response
    {
        $errors = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        if (!empty($errors)) {
            return Response::validationError($errors);
        }

        try {
            $result = $this->authHandler->handle(
                $request->get('email'),
                $request->get('password')
            );

            return Response::success($result, 'Login exitoso');
        } catch (RuntimeException $e) {
            return Response::error($e->getMessage(), 401);
        }
    }

    public function me(Request $request): Response
    {
        $user = $request->getUser();
        
        if ($user === null) {
            return Response::unauthorized();
        }

        return Response::success($user, 'Usuario autenticado');
    }

    public function logout(Request $request): Response
    {
        $token = $request->getBearerToken();
        
        if ($token === null) {
            return Response::error('No se encontró token', 400);
        }

        return Response::success(null, 'Sesión cerrada exitosamente');
    }
}
