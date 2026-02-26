<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class TrashRepository
{
    public function listDeletedItems(string $search = '', int $limit = 100): array
    {
        $safeLimit = max(1, min($limit, 500));
        $conditions = ['i.deleted_at IS NOT NULL'];
        $params = [];

        if ($search !== '') {
            $conditions[] = '(i.name LIKE :search OR i.sku LIKE :search OR i.category LIKE :search OR i.notes LIKE :search)';
            $params[':search'] = '%' . trim($search) . '%';
        }

        $stmt = Db::conn()->prepare(
            'SELECT
                i.id,
                i.sku,
                i.name,
                i.category,
                i.unit,
                i.reorder_level,
                i.notes,
                i.deleted_at,
                u.name AS deleted_by_name,
                u.email AS deleted_by_email
             FROM items i
             LEFT JOIN users u ON u.id = i.deleted_by
             WHERE ' . implode(' AND ', $conditions) . '
             ORDER BY i.deleted_at DESC
             LIMIT :limit'
        );

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $safeLimit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }

    public function listDeletedStorageAreas(string $search = '', int $limit = 100): array
    {
        $safeLimit = max(1, min($limit, 500));
        $conditions = ['sa.deleted_at IS NOT NULL'];
        $params = [];

        if ($search !== '') {
            $conditions[] = '(sa.name LIKE :search OR sa.code LIKE :search OR sa.description LIKE :search)';
            $params[':search'] = '%' . trim($search) . '%';
        }

        $stmt = Db::conn()->prepare(
            'SELECT
                sa.id,
                sa.code,
                sa.name,
                sa.description,
                sa.deleted_at,
                u.name AS deleted_by_name,
                u.email AS deleted_by_email
             FROM storage_areas sa
             LEFT JOIN users u ON u.id = sa.deleted_by
             WHERE ' . implode(' AND ', $conditions) . '
             ORDER BY sa.deleted_at DESC
             LIMIT :limit'
        );

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $safeLimit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }

    public function restoreItem(int $id): bool
    {
        $stmt = Db::conn()->prepare(
            'UPDATE items
             SET deleted_at = NULL,
                 deleted_by = NULL,
                 is_active = 1,
                 updated_at = :updated_at
             WHERE id = :id
               AND deleted_at IS NOT NULL'
        );

        $stmt->execute([
            ':id' => $id,
            ':updated_at' => gmdate('c'),
        ]);

        return $stmt->rowCount() > 0;
    }

    public function restoreStorageArea(int $id): bool
    {
        $stmt = Db::conn()->prepare(
            'UPDATE storage_areas
             SET deleted_at = NULL,
                 deleted_by = NULL,
                 is_active = 1,
                 updated_at = :updated_at
             WHERE id = :id
               AND deleted_at IS NOT NULL'
        );

        $stmt->execute([
            ':id' => $id,
            ':updated_at' => gmdate('c'),
        ]);

        return $stmt->rowCount() > 0;
    }

    public function hardDeleteItem(int $id): bool
    {
        $existing = Db::conn()->prepare(
            'SELECT id
             FROM items
             WHERE id = :id
               AND deleted_at IS NOT NULL
             LIMIT 1'
        );
        $existing->execute([':id' => $id]);
        if (!$existing->fetch()) {
            return false;
        }

        $movementCount = Db::conn()->prepare(
            'SELECT COUNT(*) AS total
             FROM stock_movements
             WHERE item_id = :id'
        );
        $movementCount->execute([':id' => $id]);
        if ((int)$movementCount->fetchColumn() > 0) {
            throw new \RuntimeException('Item has movement history and cannot be permanently deleted. Keep it in trash for audit traceability.', 422);
        }

        $stmt = Db::conn()->prepare(
            'DELETE FROM items
             WHERE id = :id
               AND deleted_at IS NOT NULL'
        );
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }

    public function hardDeleteStorageArea(int $id): bool
    {
        $stmt = Db::conn()->prepare(
            'DELETE FROM storage_areas
             WHERE id = :id
               AND deleted_at IS NOT NULL'
        );
        $stmt->execute([':id' => $id]);

        return $stmt->rowCount() > 0;
    }
}
