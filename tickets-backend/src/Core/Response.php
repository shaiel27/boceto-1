<?php

namespace App\Core;

class Response
{
    private int $statusCode;
    private array $headers;
    private $body;

    public function __construct($body = '', int $statusCode = 200, array $headers = [])
    {
        $this->body = $body;
        $this->statusCode = $statusCode;
        $this->headers = $headers;
    }

    public static function json(array $data, int $statusCode = 200): self
    {
        return new self(
            json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $statusCode,
            ['Content-Type' => 'application/json; charset=utf-8']
        );
    }

    public static function success($data = null, string $message = 'Operación exitosa', int $statusCode = 200): self
    {
        return self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    public static function created($data = null, string $message = 'Recurso creado exitosamente'): self
    {
        return self::success($data, $message, 201);
    }

    public static function error(string $message, int $statusCode = 400, $errors = null): self
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        return self::json($response, $statusCode);
    }

    public static function unauthorized(string $message = 'No autorizado'): self
    {
        return self::error($message, 401);
    }

    public static function forbidden(string $message = 'Acceso denegado'): self
    {
        return self::error($message, 403);
    }

    public static function notFound(string $message = 'Recurso no encontrado'): self
    {
        return self::error($message, 404);
    }

    public static function validationError(array $errors, string $message = 'Error de validación'): self
    {
        return self::error($message, 422, $errors);
    }

    public static function serverError(string $message = 'Error interno del servidor'): self
    {
        return self::error($message, 500);
    }

    public function send(): void
    {
        http_response_code($this->statusCode);

        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }

        echo $this->body;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getBody()
    {
        return $this->body;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function withHeader(string $name, string $value): self
    {
        $new = clone $this;
        $new->headers[$name] = $value;
        return $new;
    }
}
