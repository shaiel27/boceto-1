<?php

namespace App\Http\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Middleware;
use App\Infrastructure\Security\JwtManager;

class AuthMiddleware implements Middleware
{
    private JwtManager $jwtManager;

    public function __construct(JwtManager $jwtManager)
    {
        $this->jwtManager = $jwtManager;
    }

    public function handle(Request $request, callable $next): Response
    {
        $token = $request->getBearerToken();

        if ($token === null) {
            return Response::unauthorized('Token de autenticación requerido');
        }

        $payload = $this->jwtManager->decode($token);

        if ($payload === null) {
            return Response::unauthorized('Token inválido o expirado');
        }

        $request->setUser([
            'id' => $payload['user_id'],
            'email' => $payload['email'],
            'role' => $payload['role'],
            'role_name' => $payload['role_name'],
            'boss_id' => $payload['boss_id'] ?? null,
            'boss_name' => $payload['boss_name'] ?? null,
        ]);

        return $next($request);
    }
}
