<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\ItemRepository;
use App\Repositories\StorageAreaRepository;
use App\Services\SettingsService;

class MetaController
{
    private ItemRepository $items;
    private StorageAreaRepository $areas;
    private SettingsService $settings;

    public function __construct()
    {
        $this->items = new ItemRepository();
        $this->areas = new StorageAreaRepository();
        $this->settings = new SettingsService();
    }

    public function options(Request $request, array $actor): array
    {
        $role = strtolower((string)($actor['role'] ?? 'viewer'));

        return [
            'body' => [
                'items' => $this->items->all(true),
                'storage_areas' => $this->areas->all(true),
                'movement_types' => ['receive', 'issue', 'transfer', 'adjust', 'set'],
                'settings' => $this->settings->normalizeForResponse($this->settings->all()),
                'capabilities' => [
                    'can_write_inventory' => in_array($role, ['owner', 'manager'], true),
                    'can_manage_admin' => in_array($role, ['owner'], true),
                    'can_manage_settings' => in_array($role, ['owner', 'manager'], true),
                    'can_view_trash' => in_array($role, ['owner', 'manager'], true),
                    'can_view_audit' => in_array($role, ['owner'], true),
                ],
            ],
            'status' => 200,
        ];
    }
}
