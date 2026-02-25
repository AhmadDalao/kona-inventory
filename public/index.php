<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';

use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\HealthController;
use App\Controllers\InventoryController;
use App\Controllers\ItemController;
use App\Controllers\MetaController;
use App\Controllers\StorageAreaController;
use App\Http\Request;
use App\Http\Router;
use App\Services\AuthService;

$request = Request::capture();
$path = $request->path();

if ($request->method() === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!str_starts_with($path, '/api/')) {
    $publicRoot = __DIR__;

    if ($path !== '/' && $path !== '') {
        $candidate = realpath($publicRoot . $path);
        if ($candidate && str_starts_with($candidate, $publicRoot . DIRECTORY_SEPARATOR) && is_file($candidate)) {
            $ext = strtolower(pathinfo($candidate, PATHINFO_EXTENSION));
            $mimeMap = [
                'css' => 'text/css; charset=UTF-8',
                'js' => 'application/javascript; charset=UTF-8',
                'html' => 'text/html; charset=UTF-8',
                'json' => 'application/json; charset=UTF-8',
                'svg' => 'image/svg+xml',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
            ];
            header('Content-Type: ' . ($mimeMap[$ext] ?? 'application/octet-stream'));
            readfile($candidate);
            exit;
        }
    }

    $dashboard = $publicRoot . '/dashboard.html';
    if (is_file($dashboard)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($dashboard);
        exit;
    }
}

$router = new Router();

$health = new HealthController();
$auth = new AuthController();
$dashboard = new DashboardController();
$areas = new StorageAreaController();
$items = new ItemController();
$inventory = new InventoryController();
$meta = new MetaController();
$authService = new AuthService();

$secure = static function (callable $handler) use ($authService): callable {
    return static function (Request $request, array $params = []) use ($handler, $authService) {
        $actor = $authService->requireAuth();
        return $handler($request, $params, $actor);
    };
};

$router->get('/api/health', fn(Request $r) => $health->health($r));
$router->post('/api/auth/login', fn(Request $r) => $auth->login($r));
$router->post('/api/auth/logout', fn(Request $r) => $auth->logout($r));
$router->get('/api/auth/me', $secure(fn(Request $r, array $p, array $actor) => $auth->me($r, $actor)));

$router->get('/api/meta/options', $secure(fn(Request $r) => $meta->options($r)));
$router->get('/api/dashboard/summary', $secure(fn(Request $r) => $dashboard->summary($r)));

$router->get('/api/storage-areas', $secure(fn(Request $r) => $areas->index($r)));
$router->post('/api/storage-areas', $secure(fn(Request $r) => $areas->store($r)));
$router->patch('/api/storage-areas/{id}', $secure(fn(Request $r, array $p) => $areas->update($r, $p)));
$router->delete('/api/storage-areas/{id}', $secure(fn(Request $r, array $p) => $areas->delete($r, $p)));

$router->get('/api/items', $secure(fn(Request $r) => $items->index($r)));
$router->post('/api/items', $secure(fn(Request $r) => $items->store($r)));
$router->patch('/api/items/{id}', $secure(fn(Request $r, array $p) => $items->update($r, $p)));
$router->delete('/api/items/{id}', $secure(fn(Request $r, array $p) => $items->delete($r, $p)));

$router->get('/api/inventory/levels', $secure(fn(Request $r) => $inventory->levels($r)));
$router->get('/api/inventory/movements', $secure(fn(Request $r) => $inventory->movements($r)));
$router->post('/api/inventory/movements', $secure(fn(Request $r, array $p, array $actor) => $inventory->move($r, $actor)));

$router->dispatch($request);
