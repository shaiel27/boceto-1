<?php

namespace App\Core;

use RuntimeException;

class Router
{
    private array $routes = [];
    private array $middlewareGroups = [];
    private string $prefix = '';

    public function addRoute(string $method, string $path, callable $handler, array $middleware = []): void
    {
        $fullPath = $this->prefix . $path;
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $fullPath,
            'pattern' => $this->buildPattern($fullPath),
            'handler' => $handler,
            'middleware' => $middleware,
        ];
    }

    public function get(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable $handler, array $middleware = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    public function group(array $middleware, callable $callback): void
    {
        $previousMiddleware = $this->middlewareGroups;
        $this->middlewareGroups = array_merge($this->middlewareGroups, $middleware);
        $callback($this);
        $this->middlewareGroups = $previousMiddleware;
    }

    public function prefix(string $prefix, callable $callback): void
    {
        $previousPrefix = $this->prefix;
        $this->prefix .= $prefix;
        $callback($this);
        $this->prefix = $previousPrefix;
    }

    public function dispatch(Request $request): Response
    {
        $method = $request->getMethod();
        $uri = $request->getUri();

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $request->setParams($params);

                $allMiddleware = array_merge($this->middlewareGroups, $route['middleware']);
                return $this->runMiddleware($allMiddleware, $request, $route['handler']);
            }
        }

        return Response::json(['error' => 'Ruta no encontrada'], 404);
    }

    private function buildPattern(string $path): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        $pattern = preg_replace('/\{([a-zA-Z_]+):\s*(.+?)\}/', '(?P<$1>$2)', $pattern);
        return '#^' . $pattern . '$#';
    }

    private function runMiddleware(array $middleware, Request $request, callable $handler): Response
    {
        $pipeline = array_reduce(
            array_reverse($middleware),
            function ($next, $mw) {
                return function (Request $req) use ($next, $mw) {
                    if (is_string($mw) && class_exists($mw)) {
                        $instance = new $mw();
                        return $instance->handle($req, $next);
                    }
                    if (is_callable($mw)) {
                        return $mw($req, $next);
                    }
                    return $next($req);
                };
            },
            function (Request $req) use ($handler) {
                return $handler($req);
            }
        );

        return $pipeline($request);
    }

    public function getRoutes(): array
    {
        return $this->routes;
    }
}
