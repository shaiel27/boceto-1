<?php

namespace App\Core;

class Request
{
    private array $params = [];
    private ?array $body = null;
    private array $query = [];
    private array $files = [];
    private array $server = [];
    private array $headers = [];
    private ?array $user = null;

    public function __construct()
    {
        $this->server = $_SERVER;
        $this->query = $_GET;
        $this->files = $_FILES;
        $this->headers = $this->parseHeaders();
        $this->body = $this->parseBody();
    }

    public function getMethod(): string
    {
        return strtoupper($this->server['REQUEST_METHOD'] ?? 'GET');
    }

    public function getUri(): string
    {
        $uri = $this->server['REQUEST_URI'] ?? '/';
        $uri = parse_url($uri, PHP_URL_PATH);
        return rtrim($uri, '/') ?: '/';
    }

    public function getParam(string $key, $default = null)
    {
        return $this->params[$key] ?? $default;
    }

    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    public function getParams(): array
    {
        return $this->params;
    }

    public function getBody(): ?array
    {
        return $this->body;
    }

    public function get(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function query(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function getQuery(): array
    {
        return $this->query;
    }

    public function file(string $key): ?array
    {
        return $this->files[$key] ?? null;
    }

    public function getFiles(): array
    {
        return $this->files;
    }

    public function header(string $key, $default = null)
    {
        $key = strtoupper(str_replace('-', '_', $key));
        return $this->headers[$key] ?? $default;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function setUser(array $user): void
    {
        $this->user = $user;
    }

    public function getUser(): ?array
    {
        return $this->user;
    }

    public function getUserId(): ?int
    {
        return $this->user['id'] ?? null;
    }

    public function getUserRole(): ?string
    {
        return $this->user['role'] ?? null;
    }

    public function getBearerToken(): ?string
    {
        $authHeader = $this->header('authorization');
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function isAjax(): bool
    {
        return !empty($this->server['HTTP_X_REQUESTED_WITH'])
            && strtolower($this->server['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }

    public function getClientIp(): string
    {
        return $this->server['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    private function parseBody(): ?array
    {
        $contentType = $this->server['CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?? [];
        }

        if ($this->getMethod() === 'POST' || $this->getMethod() === 'PUT') {
            return $_POST;
        }

        return [];
    }

    private function parseHeaders(): array
    {
        $headers = [];
        foreach ($this->server as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headers[substr($key, 5)] = $value;
            }
        }
        if (isset($this->server['CONTENT_TYPE'])) {
            $headers['CONTENT_TYPE'] = $this->server['CONTENT_TYPE'];
        }
        if (isset($this->server['CONTENT_LENGTH'])) {
            $headers['CONTENT_LENGTH'] = $this->server['CONTENT_LENGTH'];
        }
        return $headers;
    }

    public function validate(array $rules): array
    {
        $errors = [];
        $data = $this->body ?? [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $ruleList = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;

            foreach ($ruleList as $rule) {
                $error = $this->applyRule($field, $value, $rule);
                if ($error !== null) {
                    $errors[$field][] = $error;
                }
            }
        }

        return $errors;
    }

    private function applyRule(string $field, $value, string $rule): ?string
    {
        $params = [];
        if (strpos($rule, ':') !== false) {
            [$rule, $paramStr] = explode(':', $rule, 2);
            $params = explode(',', $paramStr);
        }

        return match ($rule) {
            'required' => ($value === null || $value === '') ? "El campo {$field} es obligatorio" : null,
            'email' => (!filter_var($value, FILTER_VALIDATE_EMAIL)) ? "El campo {$field} debe ser un email válido" : null,
            'min' => (strlen((string)$value) < (int)($params[0] ?? 0)) ? "El campo {$field} debe tener al menos {$params[0]} caracteres" : null,
            'max' => (strlen((string)$value) > (int)($params[0] ?? PHP_INT_MAX)) ? "El campo {$field} no debe exceder {$params[0]} caracteres" : null,
            'integer' => (!filter_var($value, FILTER_VALIDATE_INT) && $value !== '0') ? "El campo {$field} debe ser un número entero" : null,
            'in' => (!in_array($value, $params)) ? "El campo {$field} debe ser uno de: " . implode(', ', $params) : null,
            default => null,
        };
    }
}
