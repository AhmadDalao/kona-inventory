<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class StorageAreaRepository
{
    public function all(bool $includeInactive = false, bool $includeDeleted = false): array
    {
        $conditions = [];

        if (!$includeInactive) {
            $conditions[] = 'is_active = 1';
        }

        if (!$includeDeleted) {
            $conditions[] = 'deleted_at IS NULL';
        }

        $sql = 'SELECT id, code, name, description, is_active, deleted_at, deleted_by, created_at, updated_at
                FROM storage_areas';

        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY name ASC';

        return Db::conn()->query($sql)->fetchAll() ?: [];
    }

    public function find(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT id, code, name, description, is_active, deleted_at, deleted_by, created_at, updated_at
                FROM storage_areas
                WHERE id = :id';

        if (!$includeDeleted) {
            $sql .= ' AND deleted_at IS NULL';
        }

        $sql .= ' LIMIT 1';

        $stmt = Db::conn()->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function create(array $data): array
    {
        $now = gmdate('c');
        $stmt = Db::conn()->prepare(
            'INSERT INTO storage_areas (code, name, description, is_active, deleted_at, deleted_by, created_at, updated_at)
             VALUES (:code, :name, :description, :is_active, NULL, NULL, :created_at, :updated_at)'
        );

        $stmt->execute([
            ':code' => strtoupper(trim((string)$data['code'])),
            ':name' => trim((string)$data['name']),
            ':description' => trim((string)($data['description'] ?? '')),
            ':is_active' => !empty($data['is_active']) ? 1 : 0,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);

        return $this->find((int)Db::conn()->lastInsertId(), true) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $existing = $this->find($id, true);
        if (!$existing || $existing['deleted_at'] !== null) {
            return null;
        }

        $stmt = Db::conn()->prepare(
            'UPDATE storage_areas
             SET code = :code,
                 name = :name,
                 description = :description,
                 is_active = :is_active,
                 updated_at = :updated_at
             WHERE id = :id'
        );

        $stmt->execute([
            ':id' => $id,
            ':code' => strtoupper(trim((string)($data['code'] ?? $existing['code']))),
            ':name' => trim((string)($data['name'] ?? $existing['name'])),
            ':description' => trim((string)($data['description'] ?? $existing['description'] ?? '')),
            ':is_active' => array_key_exists('is_active', $data) ? (!empty($data['is_active']) ? 1 : 0) : (int)$existing['is_active'],
            ':updated_at' => gmdate('c'),
        ]);

        return $this->find($id, true);
    }

    public function softDelete(int $id, int $deletedBy): bool
    {
        $stmt = Db::conn()->prepare(
            'UPDATE storage_areas
             SET deleted_at = :deleted_at,
                 deleted_by = :deleted_by,
                 is_active = 0,
                 updated_at = :updated_at
             WHERE id = :id
               AND deleted_at IS NULL'
        );

        $stmt->execute([
            ':id' => $id,
            ':deleted_at' => gmdate('c'),
            ':deleted_by' => $deletedBy,
            ':updated_at' => gmdate('c'),
        ]);

        return $stmt->rowCount() > 0;
    }
}
