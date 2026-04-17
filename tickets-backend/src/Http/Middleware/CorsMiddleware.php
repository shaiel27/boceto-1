<?php

namespace App\Http\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Middleware;

class CorsMiddleware implements Middleware
{
    private array $allowedOrigins;
    private array $allowedMethods;
    private array $allowedHeaders;

    public function __construct(array $allowedOrigins = ['*'], array $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], array $allowedHeaders = ['Content-Type', 'Authorization'])
    {
        $this->allowedOrigins = $allowedOrigins;
        $this->allowedMethods = $allowedMethods;
        $this->allowedHeaders = $allowedHeaders;
    }

    public function handle(Request $request, callable $next): Response
    {
        $origin = $request->header('origin', '*');

        if ($request->getMethod() === 'OPTIONS') {
            return $this->createPreflightResponse($origin);
        }

        $response = $next($request);

        if (in_array('*', $this->allowedOrigins) || in_array($origin, $this->allowedOrigins)) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        }

        $response = $response->withHeader('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods));
        $response = $response->withHeader('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders));
        $response = $response->withHeader('Access-Control-Allow-Credentials', 'true');

        return $response;
    }

    private function createPreflightResponse(string $origin): Response
    {
        $headers = [
            'Access-Control-Allow-Origin' => in_array('*', $this->allowedOrigins) || in_array($origin, $this->allowedOrigins) ? $origin : $this->allowedOrigins[0],
            'Access-Control-Allow-Methods' => implode(', ', $this->allowedMethods),
            'Access-Control-Allow-Headers' => implode(', ', $this->allowedHeaders),
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Max-Age' => '86400',
        ];

        return new Response('', 204, $headers);
    }
}
