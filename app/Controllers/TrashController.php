<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\TrashRepository;

class TrashController
{
    private TrashRepository $trash;

    public function __construct()
    {
        $this->trash = new TrashRepository();
    }

    public function index(Request $request): array
    {
        $search = trim((string)$request->query('search', ''));
        $limit = (int)$request->query('limit', 100);

        return [
            'status' => 200,
            'body' => [
                'data' => [
                    'items' => $this->trash->listDeletedItems($search, $limit),
                    'storage_areas' => $this->trash->listDeletedStorageAreas($search, $limit),
                ],
            ],
        ];
    }

    public function restore(Request $request, array $params): array
    {
        $entity = strtolower(trim((string)($params['entity'] ?? '')));
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            throw new \RuntimeException('Invalid restore id.', 422);
        }

        $restored = match ($entity) {
            'item', 'items' => $this->trash->restoreItem($id),
            'storage-area', 'storage_areas', 'storagearea' => $this->trash->restoreStorageArea($id),
            default => throw new \RuntimeException('Unsupported trash entity.', 422),
        };

        return [
            'status' => 200,
            'body' => [
                'data' => [
                    'entity' => $entity,
                    'id' => $id,
                    'restored' => $restored,
                ],
            ],
        ];
    }

    public function destroy(Request $request, array $params): array
    {
        $entity = strtolower(trim((string)($params['entity'] ?? '')));
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            throw new \RuntimeException('Invalid delete id.', 422);
        }

        $deleted = match ($entity) {
            'item', 'items' => $this->trash->hardDeleteItem($id),
            'storage-area', 'storage_areas', 'storagearea' => $this->trash->hardDeleteStorageArea($id),
            default => throw new \RuntimeException('Unsupported trash entity.', 422),
        };

        if (!$deleted) {
            throw new \RuntimeException('Record not found in trash.', 404);
        }

        return [
            'status' => 200,
            'body' => [
                'data' => [
                    'entity' => $entity,
                    'id' => $id,
                    'deleted' => true,
                ],
            ],
        ];
    }
}
