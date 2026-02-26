<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;

class ApiDocsController
{
    public function index(Request $request): array
    {
        return [
            'body' => [
                'title' => 'InventoryManagementSystem API',
                'version' => '1.0.0',
                'base_url' => '/',
                'auth' => 'Session cookie via /api/auth/login',
                'endpoints' => [
                    ['method' => 'GET', 'path' => '/api/health', 'description' => 'Health check'],
                    ['method' => 'POST', 'path' => '/api/auth/login', 'description' => 'Login with email/password'],
                    ['method' => 'POST', 'path' => '/api/auth/logout', 'description' => 'Logout current session'],
                    ['method' => 'GET', 'path' => '/api/auth/me', 'description' => 'Current user profile'],
                    ['method' => 'GET', 'path' => '/api/meta/options', 'description' => 'Items, areas, settings, permissions'],
                    ['method' => 'GET', 'path' => '/api/dashboard/summary', 'description' => 'KPI summary + low stock list'],
                    ['method' => 'GET', 'path' => '/api/dashboard/analytics', 'description' => 'Trend and analysis datasets'],
                    ['method' => 'GET', 'path' => '/api/settings', 'description' => 'Current app settings'],
                    ['method' => 'PATCH', 'path' => '/api/settings', 'description' => 'Update app settings'],
                    ['method' => 'GET', 'path' => '/api/trash', 'description' => 'List deleted records (items and storage areas)'],
                    ['method' => 'POST', 'path' => '/api/trash/{entity}/{id}/restore', 'description' => 'Restore deleted record from trash'],
                    ['method' => 'GET', 'path' => '/api/audit-logs', 'description' => 'Owner-only audit trail of write actions'],
                    ['method' => 'GET', 'path' => '/api/admin/users', 'description' => 'List admin users'],
                    ['method' => 'POST', 'path' => '/api/admin/users', 'description' => 'Create admin user'],
                    ['method' => 'PATCH', 'path' => '/api/admin/users/{id}', 'description' => 'Update admin user'],
                    ['method' => 'GET', 'path' => '/api/storage-areas', 'description' => 'List storage areas'],
                    ['method' => 'POST', 'path' => '/api/storage-areas', 'description' => 'Create storage area'],
                    ['method' => 'PATCH', 'path' => '/api/storage-areas/{id}', 'description' => 'Update storage area'],
                    ['method' => 'DELETE', 'path' => '/api/storage-areas/{id}', 'description' => 'Delete storage area'],
                    ['method' => 'GET', 'path' => '/api/items', 'description' => 'List items'],
                    ['method' => 'POST', 'path' => '/api/items', 'description' => 'Create item'],
                    ['method' => 'PATCH', 'path' => '/api/items/{id}', 'description' => 'Update item'],
                    ['method' => 'DELETE', 'path' => '/api/items/{id}', 'description' => 'Delete item'],
                    ['method' => 'GET', 'path' => '/api/inventory/levels', 'description' => 'Inventory matrix by item and area'],
                    ['method' => 'GET', 'path' => '/api/inventory/movements', 'description' => 'Movement history (filterable)'],
                    ['method' => 'POST', 'path' => '/api/inventory/movements', 'description' => 'Apply stock movement'],
                ],
            ],
            'status' => 200,
        ];
    }
}
