<?php

declare(strict_types=1);

namespace App\Http;

use App\Config;
use InvalidArgumentException;
use RuntimeException;
use Throwable;

class Router
{
    /**
     * @var array<int, array{method:string, pattern:string, handler:callable}>
     */
    private array $routes = [];

    public function get(string $pattern, callable $handler): self
    {
        return $this->add('GET', $pattern, $handler);
    }

    public function post(string $pattern, callable $handler): self
    {
        return $this->add('POST', $pattern, $handler);
    }

    public function patch(string $pattern, callable $handler): self
    {
        return $this->add('PATCH', $pattern, $handler);
    }

    public function delete(string $pattern, callable $handler): self
    {
        return $this->add('DELETE', $pattern, $handler);
    }

    public function add(string $method, string $pattern, callable $handler): self
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'handler' => $handler,
        ];
        return $this;
    }

    public function dispatch(Request $request): void
    {
        foreach ($this->routes as $route) {
            if ($request->method() !== $route['method']) {
                continue;
            }

            $matches = $this->match($route['pattern'], $request->path());
            if ($matches === null) {
                continue;
            }

            try {
                $result = ($route['handler'])($request, $matches);
                if (is_array($result) && array_key_exists('body', $result)) {
                    Response::json(
                        is_array($result['body']) ? $result['body'] : ['result' => $result['body']],
                        (int)($result['status'] ?? 200)
                    );
                    return;
                }

                Response::json(is_array($result) ? $result : ['result' => $result], 200);
                return;
            } catch (InvalidArgumentException $exception) {
                Response::json(['error' => $exception->getMessage()], 422);
                return;
            } catch (RuntimeException $exception) {
                $code = $exception->getCode();
                $status = $code >= 400 && $code < 600 ? $code : 400;
                Response::json(['error' => $exception->getMessage()], $status);
                return;
            } catch (Throwable $exception) {
                $isLocal = (string)Config::get('APP_ENV', 'local') === 'local';
                Response::json([
                    'error' => 'Internal server error.',
                    'details' => $isLocal ? $exception->getMessage() : null,
                ], 500);
                return;
            }
        }

        Response::json(['error' => 'Route not found.'], 404);
    }

    private function match(string $pattern, string $path): ?array
    {
        $regex = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', static fn(array $hit): string => '(?P<' . $hit[1] . '>[^/]+)', $pattern);
        $regex = '#^' . $regex . '$#';

        if (!preg_match($regex, $path, $matches)) {
            return null;
        }

        $params = [];
        foreach ($matches as $key => $value) {
            if (is_string($key)) {
                $params[$key] = $value;
            }
        }

        return $params;
    }
}
