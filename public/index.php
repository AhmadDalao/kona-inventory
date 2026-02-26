<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';

use App\Controllers\AdminUserController;
use App\Controllers\ApiDocsController;
use App\Controllers\AuditLogController;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\HealthController;
use App\Controllers\InventoryController;
use App\Controllers\ItemController;
use App\Controllers\MetaController;
use App\Controllers\SettingsController;
use App\Controllers\StorageAreaController;
use App\Controllers\TrashController;
use App\Http\Request;
use App\Http\Router;
use App\Services\AuditService;
use App\Services\AuthService;
use App\Services\SettingsService;

$request = Request::capture();
$path = $request->path();

if ($request->method() === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!str_starts_with($path, '/api/')) {
    $publicRoot = __DIR__;

    $docAliases = ['/api-docs', '/docs/api'];
    if (in_array($path, $docAliases, true)) {
        $docsFile = $publicRoot . '/api-docs.html';
        if (is_file($docsFile)) {
            header('Content-Type: text/html; charset=UTF-8');
            readfile($docsFile);
            exit;
        }
    }

    $guideAliases = ['/user-guide', '/docs/user-guide'];
    if (in_array($path, $guideAliases, true)) {
        $guideFile = $publicRoot . '/user-guide.html';
        if (is_file($guideFile)) {
            header('Content-Type: text/html; charset=UTF-8');
            readfile($guideFile);
            exit;
        }
    }

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
$docs = new ApiDocsController();
$auditLogs = new AuditLogController();
$trash = new TrashController();
$auth = new AuthController();
$dashboard = new DashboardController();
$areas = new StorageAreaController();
$items = new ItemController();
$inventory = new InventoryController();
$meta = new MetaController();
$settingsController = new SettingsController();
$adminUsers = new AdminUserController();
$authService = new AuthService();
$settingsService = new SettingsService();
$auditService = new AuditService();

$secure = static function (
    callable $handler,
    array $roles = [],
    bool $isWrite = false,
    ?string $auditAction = null,
    ?string $auditEntityType = null,
    ?string $auditSummary = null
) use ($authService, $settingsService, $auditService): callable {
    return static function (Request $request, array $params = []) use ($handler, $roles, $isWrite, $auditAction, $auditEntityType, $auditSummary, $authService, $settingsService, $auditService) {
        $actor = $authService->requireAuth($roles);

        $action = $auditAction ?? strtolower($request->method()) . ' ' . $request->path();
        $entityType = $auditEntityType ?? 'system';
        $entityId = $params['id'] ?? null;

        try {
            if ($isWrite && $settingsService->isReadOnlyMode()) {
                $role = strtolower((string)($actor['role'] ?? 'viewer'));
                if ($role !== 'owner') {
                    throw new RuntimeException('System is in read-only mode. Only owner can modify data right now.', 423);
                }
            }

            $result = $handler($request, $params, $actor);

            if ($isWrite) {
                $status = (int)($result['status'] ?? 200);
                $auditService->log(
                    $request,
                    $actor,
                    $action,
                    $entityType,
                    $entityId,
                    $status,
                    $auditSummary,
                    [
                        'params' => $params,
                        'body' => $request->body(),
                    ]
                );
            }

            return $result;
        } catch (Throwable $exception) {
            if ($isWrite) {
                $code = $exception->getCode();
                $status = is_int($code) && $code >= 400 && $code < 600 ? $code : 500;
                $auditService->log(
                    $request,
                    $actor,
                    $action,
                    $entityType,
                    $entityId,
                    $status,
                    $auditSummary ?? $exception->getMessage(),
                    [
                        'params' => $params,
                        'body' => $request->body(),
                        'error' => $exception->getMessage(),
                    ]
                );
            }

            throw $exception;
        }
    };
};

$readRoles = ['owner', 'manager', 'viewer'];
$writeRoles = ['owner', 'manager'];
$ownerOnly = ['owner'];

$router->get('/api/health', fn(Request $r) => $health->health($r));
$router->get('/api/docs', fn(Request $r) => $docs->index($r));

$router->post('/api/auth/login', fn(Request $r) => $auth->login($r));
$router->post('/api/auth/logout', fn(Request $r) => $auth->logout($r));
$router->get('/api/auth/me', $secure(fn(Request $r, array $p, array $actor) => $auth->me($r, $actor), $readRoles));

$router->get('/api/meta/options', $secure(fn(Request $r, array $p, array $actor) => $meta->options($r, $actor), $readRoles));
$router->get('/api/dashboard/summary', $secure(fn(Request $r) => $dashboard->summary($r), $readRoles));
$router->get('/api/dashboard/analytics', $secure(fn(Request $r) => $dashboard->analytics($r), $readRoles));

$router->get('/api/settings', $secure(fn(Request $r) => $settingsController->show($r), $readRoles));
$router->patch('/api/settings', $secure(
    fn(Request $r, array $p, array $actor) => $settingsController->update($r, $actor),
    $writeRoles,
    true,
    'settings.update',
    'settings',
    'Updated system settings'
));

$router->get('/api/trash', $secure(fn(Request $r) => $trash->index($r), $writeRoles));
$router->post('/api/trash/{entity}/{id}/restore', $secure(
    fn(Request $r, array $p) => $trash->restore($r, $p),
    $writeRoles,
    true,
    'trash.restore',
    'trash',
    'Restored record from trash'
));
$router->delete('/api/trash/{entity}/{id}', $secure(
    fn(Request $r, array $p) => $trash->destroy($r, $p),
    $ownerOnly,
    true,
    'trash.delete',
    'trash',
    'Permanently deleted record from trash'
));

$router->get('/api/audit-logs', $secure(fn(Request $r) => $auditLogs->index($r), $ownerOnly));

$router->get('/api/admin/users', $secure(fn(Request $r) => $adminUsers->index($r), $ownerOnly));
$router->post('/api/admin/users', $secure(
    fn(Request $r) => $adminUsers->store($r),
    $ownerOnly,
    true,
    'admin_user.create',
    'user',
    'Created admin user'
));
$router->patch('/api/admin/users/{id}', $secure(
    fn(Request $r, array $p, array $actor) => $adminUsers->update($r, $p, $actor),
    $ownerOnly,
    true,
    'admin_user.update',
    'user',
    'Updated admin user'
));

$router->get('/api/storage-areas', $secure(fn(Request $r) => $areas->index($r), $readRoles));
$router->post('/api/storage-areas', $secure(
    fn(Request $r) => $areas->store($r),
    $writeRoles,
    true,
    'storage_area.create',
    'storage_area',
    'Created storage area'
));
$router->patch('/api/storage-areas/{id}', $secure(
    fn(Request $r, array $p) => $areas->update($r, $p),
    $writeRoles,
    true,
    'storage_area.update',
    'storage_area',
    'Updated storage area'
));
$router->delete('/api/storage-areas/{id}', $secure(
    fn(Request $r, array $p, array $actor) => $areas->delete($r, $p, $actor),
    $writeRoles,
    true,
    'storage_area.delete',
    'storage_area',
    'Moved storage area to trash'
));

$router->get('/api/items', $secure(fn(Request $r) => $items->index($r), $readRoles));
$router->post('/api/items', $secure(
    fn(Request $r) => $items->store($r),
    $writeRoles,
    true,
    'item.create',
    'item',
    'Created item'
));
$router->post('/api/items/upload-image', $secure(
    fn(Request $r) => $items->uploadImage($r),
    $writeRoles,
    true,
    'item.image.upload',
    'item',
    'Uploaded item image'
));
$router->patch('/api/items/{id}', $secure(
    fn(Request $r, array $p) => $items->update($r, $p),
    $writeRoles,
    true,
    'item.update',
    'item',
    'Updated item'
));
$router->delete('/api/items/{id}', $secure(
    fn(Request $r, array $p, array $actor) => $items->delete($r, $p, $actor),
    $writeRoles,
    true,
    'item.delete',
    'item',
    'Moved item to trash'
));

$router->get('/api/inventory/levels', $secure(fn(Request $r) => $inventory->levels($r), $readRoles));
$router->get('/api/inventory/movements', $secure(fn(Request $r) => $inventory->movements($r), $readRoles));
$router->post('/api/inventory/movements', $secure(
    fn(Request $r, array $p, array $actor) => $inventory->move($r, $actor),
    $writeRoles,
    true,
    'inventory.movement.create',
    'stock_movement',
    'Applied inventory movement'
));

$router->dispatch($request);
