<?php

namespace App\Http\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Middleware;
use App\Core\Database;

class RateLimitMiddleware implements Middleware
{
    private int $maxRequests;
    private int $windowSeconds;
    private PDO $db;

    public function __construct(int $maxRequests = 60, int $windowSeconds = 60)
    {
        $this->maxRequests = $maxRequests;
        $this->windowSeconds = $windowSeconds;
        $this->db = Database::getInstance()->getConnection();
    }

    public function handle(Request $request, callable $next): Response
    {
        $identifier = $this->getIdentifier($request);
        $now = time();
        $windowStart = $now - $this->windowSeconds;

        $this->cleanupOldEntries($windowStart);

        $currentCount = $this->getCurrentCount($identifier, $windowStart);

        if ($currentCount >= $this->maxRequests) {
            return Response::error('Demasiadas solicitudes. Intente nuevamente más tarde.', 429);
        }

        $this->recordRequest($identifier, $now);

        return $next($request);
    }

    private function getIdentifier(Request $request): string
    {
        $user = $request->getUser();
        if ($user !== null) {
            return 'user_' . $user['id'];
        }
        return 'ip_' . $request->getClientIp();
    }

    private function getCurrentCount(string $identifier, int $windowStart): int
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM rate_limits 
            WHERE identifier = :identifier AND request_time >= :window_start
        ");
        $stmt->execute([
            'identifier' => $identifier,
            'window_start' => $windowStart,
        ]);
        return (int)$stmt->fetchColumn();
    }

    private function recordRequest(string $identifier, int $timestamp): void
    {
        $stmt = $this->db->prepare(
            "INSERT INTO rate_limits (identifier, request_time) VALUES (:identifier, :request_time)"
        );
        $stmt->execute([
            'identifier' => $identifier,
            'request_time' => $timestamp,
        ]);
    }

    private function cleanupOldEntries(int $windowStart): void
    {
        $stmt = $this->db->prepare("DELETE FROM rate_limits WHERE request_time < :window_start");
        $stmt->execute(['window_start' => $windowStart]);
    }
}
