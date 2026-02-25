<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class ItemRepository
{
    public function all(bool $includeInactive = false): array
    {
        $sql = 'SELECT id, sku, name, category, unit, reorder_level, notes, is_active, created_at, updated_at
                FROM items';

        if (!$includeInactive) {
            $sql .= ' WHERE is_active = 1';
        }

        $sql .= ' ORDER BY name ASC';

        return Db::conn()->query($sql)->fetchAll() ?: [];
    }

    public function find(int $id): ?array
    {
        $stmt = Db::conn()->prepare(
            'SELECT id, sku, name, category, unit, reorder_level, notes, is_active, created_at, updated_at
             FROM items
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
            'INSERT INTO items (sku, name, category, unit, reorder_level, notes, is_active, created_at, updated_at)
             VALUES (:sku, :name, :category, :unit, :reorder_level, :notes, :is_active, :created_at, :updated_at)'
        );

        $stmt->execute([
            ':sku' => strtoupper(trim((string)$data['sku'])),
            ':name' => trim((string)$data['name']),
            ':category' => trim((string)($data['category'] ?? '')),
            ':unit' => trim((string)($data['unit'] ?? 'unit')),
            ':reorder_level' => (float)($data['reorder_level'] ?? 0),
            ':notes' => trim((string)($data['notes'] ?? '')),
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
            'UPDATE items
             SET sku = :sku,
                 name = :name,
                 category = :category,
                 unit = :unit,
                 reorder_level = :reorder_level,
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
            ':notes' => trim((string)($data['notes'] ?? $existing['notes'] ?? '')),
            ':is_active' => array_key_exists('is_active', $data) ? (!empty($data['is_active']) ? 1 : 0) : (int)$existing['is_active'],
            ':updated_at' => gmdate('c'),
        ]);

        return $this->find($id);
    }

    public function delete(int $id): bool
    {
        $stmt = Db::conn()->prepare('DELETE FROM items WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}
