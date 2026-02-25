<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\StorageAreaRepository;
use PDOException;

class StorageAreaController
{
    private StorageAreaRepository $areas;

    public function __construct()
    {
        $this->areas = new StorageAreaRepository();
    }

    public function index(Request $request): array
    {
        $includeInactive = filter_var((string)$request->query('include_inactive', '0'), FILTER_VALIDATE_BOOLEAN);
        return ['body' => ['data' => $this->areas->all($includeInactive)], 'status' => 200];
    }

    public function store(Request $request): array
    {
        $payload = $request->body();
        $code = strtoupper(trim((string)($payload['code'] ?? '')));
        $name = trim((string)($payload['name'] ?? ''));

        if ($code === '' || $name === '') {
            throw new \InvalidArgumentException('code and name are required.');
        }

        try {
            $created = $this->areas->create([
                'code' => $code,
                'name' => $name,
                'description' => $payload['description'] ?? '',
                'is_active' => array_key_exists('is_active', $payload) ? (int)(bool)$payload['is_active'] : 1,
            ]);
        } catch (PDOException $exception) {
            throw new \RuntimeException('Storage area code/name must be unique.', 422);
        }

        return ['body' => ['data' => $created], 'status' => 201];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid storage area id.');
        }

        try {
            $updated = $this->areas->update($id, $request->body());
        } catch (PDOException $exception) {
            throw new \RuntimeException('Storage area code/name must be unique.', 422);
        }

        if (!$updated) {
            throw new \RuntimeException('Storage area not found.', 404);
        }

        return ['body' => ['data' => $updated], 'status' => 200];
    }

    public function delete(Request $request, array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid storage area id.');
        }

        $existing = $this->areas->find($id);
        if (!$existing) {
            throw new \RuntimeException('Storage area not found.', 404);
        }

        $this->areas->delete($id);

        return ['body' => ['message' => 'Storage area deleted.'], 'status' => 200];
    }
}
