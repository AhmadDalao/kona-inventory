<?php

declare(strict_types=1);

namespace App\Http;

class Request
{
    public function __construct(
        private readonly string $method,
        private readonly string $path,
        private readonly array $query,
        private readonly array $body,
        private readonly array $files,
        private readonly array $headers,
        private readonly string $ipAddress,
        private readonly string $userAgent,
    ) {
    }

    public static function capture(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        // Support method override for fetch/form clients.
        if ($method === 'POST') {
            $override = strtoupper((string)($_POST['_method'] ?? $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
            if (in_array($override, ['PATCH', 'DELETE'], true)) {
                $method = $override;
            }
        }

        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $rawPath = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = self::normalizePath($rawPath, (string)($_SERVER['SCRIPT_NAME'] ?? ''));
        $query = $_GET;

        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (!str_starts_with($key, 'HTTP_')) {
                continue;
            }
            $name = str_replace('_', '-', strtolower(substr($key, 5)));
            $headers[$name] = (string)$value;
        }

        $contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
        $rawBody = file_get_contents('php://input') ?: '';
        $body = is_array($_POST) ? $_POST : [];
        $files = is_array($_FILES) ? $_FILES : [];

        if ($rawBody !== '' && !str_contains($contentType, 'multipart/form-data')) {
            if (str_contains($contentType, 'application/json')) {
                $decoded = json_decode($rawBody, true);
                if (is_array($decoded)) {
                    $body = array_merge($body, $decoded);
                }
            } else {
                parse_str($rawBody, $parsed);
                if (is_array($parsed)) {
                    $body = array_merge($body, $parsed);
                }
            }
        }

        $ipAddress = (string)($_SERVER['REMOTE_ADDR'] ?? '');
        $userAgent = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');

        return new self($method, $path, $query, $body, $files, $headers, $ipAddress, $userAgent);
    }

    private static function normalizePath(string $path, string $scriptName): string
    {
        $normalizedPath = '/' . ltrim($path, '/');
        $scriptDir = str_replace('\\', '/', dirname($scriptName));

        if ($scriptDir === '/' || $scriptDir === '.' || $scriptDir === '') {
            return $normalizedPath;
        }

        if ($normalizedPath === $scriptDir) {
            return '/';
        }

        $prefix = $scriptDir . '/';
        if (str_starts_with($normalizedPath, $prefix)) {
            $trimmed = substr($normalizedPath, strlen($scriptDir));
            return $trimmed === '' ? '/' : $trimmed;
        }

        return $normalizedPath;
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function query(string $key, mixed $default = null): mixed
    {
        return $this->query[$key] ?? $default;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function body(): array
    {
        return $this->body;
    }

    public function files(): array
    {
        return $this->files;
    }

    public function file(string $key, mixed $default = null): mixed
    {
        return $this->files[$key] ?? $default;
    }

    public function headers(): array
    {
        return $this->headers;
    }

    public function header(string $key, mixed $default = null): mixed
    {
        return $this->headers[strtolower($key)] ?? $default;
    }

    public function ipAddress(): string
    {
        return $this->ipAddress;
    }

    public function userAgent(): string
    {
        return $this->userAgent;
    }
}
