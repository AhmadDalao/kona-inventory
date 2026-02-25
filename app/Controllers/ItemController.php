<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\ItemRepository;
use PDOException;

class ItemController
{
    private ItemRepository $items;

    public function __construct()
    {
        $this->items = new ItemRepository();
    }

    public function index(Request $request): array
    {
        $includeInactive = filter_var((string)$request->query('include_inactive', '0'), FILTER_VALIDATE_BOOLEAN);
        return ['body' => ['data' => $this->items->all($includeInactive)], 'status' => 200];
    }

    public function store(Request $request): array
    {
        $payload = $request->body();
        $sku = strtoupper(trim((string)($payload['sku'] ?? '')));
        $name = trim((string)($payload['name'] ?? ''));
        $reorder = $payload['reorder_level'] ?? 0;

        if ($sku === '' || $name === '') {
            throw new \InvalidArgumentException('sku and name are required.');
        }
        if (!is_numeric($reorder) || (float)$reorder < 0) {
            throw new \InvalidArgumentException('reorder_level must be 0 or greater.');
        }

        try {
            $created = $this->items->create([
                'sku' => $sku,
                'name' => $name,
                'category' => $payload['category'] ?? '',
                'unit' => $payload['unit'] ?? 'unit',
                'reorder_level' => (float)$reorder,
                'notes' => $payload['notes'] ?? '',
                'is_active' => array_key_exists('is_active', $payload) ? (int)(bool)$payload['is_active'] : 1,
            ]);
        } catch (PDOException $exception) {
            throw new \RuntimeException('Item SKU must be unique.', 422);
        }

        return ['body' => ['data' => $created], 'status' => 201];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid item id.');
        }

        $payload = $request->body();
        if (array_key_exists('reorder_level', $payload) && (!is_numeric($payload['reorder_level']) || (float)$payload['reorder_level'] < 0)) {
            throw new \InvalidArgumentException('reorder_level must be 0 or greater.');
        }

        try {
            $updated = $this->items->update($id, $payload);
        } catch (PDOException $exception) {
            throw new \RuntimeException('Item SKU must be unique.', 422);
        }

        if (!$updated) {
            throw new \RuntimeException('Item not found.', 404);
        }

        return ['body' => ['data' => $updated], 'status' => 200];
    }

    public function delete(Request $request, array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid item id.');
        }

        $existing = $this->items->find($id);
        if (!$existing) {
            throw new \RuntimeException('Item not found.', 404);
        }

        try {
            $this->items->delete($id);
        } catch (PDOException $exception) {
            throw new \RuntimeException('Item cannot be deleted because movement history exists. Set it inactive instead.', 422);
        }

        return ['body' => ['message' => 'Item deleted.'], 'status' => 200];
    }
}
