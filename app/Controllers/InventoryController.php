<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\InventoryRepository;
use App\Repositories\StockMovementRepository;
use App\Services\InventoryService;

class InventoryController
{
    private InventoryRepository $inventory;
    private StockMovementRepository $movements;
    private InventoryService $service;

    public function __construct()
    {
        $this->inventory = new InventoryRepository();
        $this->movements = new StockMovementRepository();
        $this->service = new InventoryService();
    }

    public function levels(Request $request): array
    {
        $search = trim((string)$request->query('search', ''));
        $areaId = (int)$request->query('storage_area_id', 0);
        $includeInactive = filter_var((string)$request->query('include_inactive', '0'), FILTER_VALIDATE_BOOLEAN);

        $rows = $this->inventory->matrix($search !== '' ? $search : null, $areaId > 0 ? $areaId : null, $includeInactive);

        return ['body' => ['data' => $rows], 'status' => 200];
    }

    public function movements(Request $request): array
    {
        $limit = (int)$request->query('limit', 100);
        return ['body' => ['data' => $this->movements->recent($limit)], 'status' => 200];
    }

    public function move(Request $request, array $actor): array
    {
        $result = $this->service->applyMovement($request->body(), (int)$actor['id']);
        return ['body' => ['data' => $result], 'status' => 201];
    }
}
