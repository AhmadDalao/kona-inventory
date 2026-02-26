<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class ItemRepository
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

        $sql = 'SELECT id, sku, name, category, unit, reorder_level, image_path, notes, is_active, deleted_at, deleted_by, created_at, updated_at
                FROM items';

        if ($conditions !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $sql .= ' ORDER BY name ASC';

        return Db::conn()->query($sql)->fetchAll() ?: [];
    }

    public function find(int $id, bool $includeDeleted = false): ?array
    {
        $sql = 'SELECT id, sku, name, category, unit, reorder_level, image_path, notes, is_active, deleted_at, deleted_by, created_at, updated_at
                FROM items
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
            'INSERT INTO items (sku, name, category, unit, reorder_level, image_path, notes, is_active, deleted_at, deleted_by, created_at, updated_at)
             VALUES (:sku, :name, :category, :unit, :reorder_level, :image_path, :notes, :is_active, NULL, NULL, :created_at, :updated_at)'
        );

        $stmt->execute([
            ':sku' => strtoupper(trim((string)$data['sku'])),
            ':name' => trim((string)$data['name']),
            ':category' => trim((string)($data['category'] ?? '')),
            ':unit' => trim((string)($data['unit'] ?? 'unit')),
            ':reorder_level' => (float)($data['reorder_level'] ?? 0),
            ':image_path' => trim((string)($data['image_path'] ?? '')),
            ':notes' => trim((string)($data['notes'] ?? '')),
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
            'UPDATE items
                 SET sku = :sku,
                     name = :name,
                     category = :category,
                     unit = :unit,
                     reorder_level = :reorder_level,
                     image_path = :image_path,
                     notes = :notes,
                     is_active = :is_active,
                     updated_at = :updated_at
             WHERE id = :id'
        );

        $stmt->execute([
            ':id' => $id,
            ':sku' => strtoupper(trim((string)($data['sku'] ?? $existing['sku']))),
            ':name' => trim((string)($data['name'] ?? $existing['name'])),
            ':category' => trim((string)($data['category'] ?? $existing['category'] ?? '')),
            ':unit' => trim((string)($data['unit'] ?? $existing['unit'])),
            ':reorder_level' => array_key_exists('reorder_level', $data) ? (float)$data['reorder_level'] : (float)$existing['reorder_level'],
            ':image_path' => trim((string)($data['image_path'] ?? $existing['image_path'] ?? '')),
            ':notes' => trim((string)($data['notes'] ?? $existing['notes'] ?? '')),
            ':is_active' => array_key_exists('is_active', $data) ? (!empty($data['is_active']) ? 1 : 0) : (int)$existing['is_active'],
            ':updated_at' => gmdate('c'),
        ]);

        return $this->find($id, true);
    }

    public function softDelete(int $id, int $deletedBy): bool
    {
        $stmt = Db::conn()->prepare(
            'UPDATE items
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
