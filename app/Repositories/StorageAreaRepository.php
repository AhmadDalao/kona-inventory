<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class StorageAreaRepository
{
    public function all(bool $includeInactive = false): array
    {
        $sql = 'SELECT id, code, name, description, is_active, created_at, updated_at
                FROM storage_areas';

        if (!$includeInactive) {
            $sql .= ' WHERE is_active = 1';
        }

        $sql .= ' ORDER BY name ASC';

        return Db::conn()->query($sql)->fetchAll() ?: [];
    }

    public function find(int $id): ?array
    {
        $stmt = Db::conn()->prepare(
            'SELECT id, code, name, description, is_active, created_at, updated_at
             FROM storage_areas
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function create(array $data): array
    {
        $now = gmdate('c');
        $stmt = Db::conn()->prepare(
            'INSERT INTO storage_areas (code, name, description, is_active, created_at, updated_at)
             VALUES (:code, :name, :description, :is_active, :created_at, :updated_at)'
        );

        $stmt->execute([
            ':code' => strtoupper(trim((string)$data['code'])),
            ':name' => trim((string)$data['name']),
            ':description' => trim((string)($data['description'] ?? '')),
            ':is_active' => !empty($data['is_active']) ? 1 : 0,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);

        return $this->find((int)Db::conn()->lastInsertId()) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $existing = $this->find($id);
        if (!$existing) {
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

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $stmt = Db::conn()->prepare('DELETE FROM storage_areas WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}
