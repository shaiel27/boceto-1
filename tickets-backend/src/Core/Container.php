<?php

namespace App\Core;

use RuntimeException;

class Container
{
    private array $bindings = [];
    private array $instances = [];

    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
    }

    public function singleton(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
        $this->instances[$abstract] = null;
    }

    public function get(string $abstract)
    {
        if (isset($this->instances[$abstract]) && $this->instances[$abstract] !== null) {
            return $this->instances[$abstract];
        }

        if (!isset($this->bindings[$abstract])) {
            throw new RuntimeException("No se encontró binding para: {$abstract}");
        }

        $instance = $this->bindings[$abstract]($this);

        if (array_key_exists($abstract, $this->instances)) {
            $this->instances[$abstract] = $instance;
        }

        return $instance;
    }

    public function has(string $abstract): bool
    {
        return isset($this->bindings[$abstract]);
    }

    public function instance(string $abstract, $instance): void
    {
        $this->instances[$abstract] = $instance;
    }
}
