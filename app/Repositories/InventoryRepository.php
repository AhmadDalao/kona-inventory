<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class InventoryRepository
{
    public function currentQuantity(int $itemId, int $storageAreaId): float
    {
        $stmt = Db::conn()->prepare(
            'SELECT quantity FROM inventory_levels WHERE item_id = :item_id AND storage_area_id = :storage_area_id LIMIT 1'
        );
        $stmt->execute([
            ':item_id' => $itemId,
            ':storage_area_id' => $storageAreaId,
        ]);
        $value = $stmt->fetchColumn();

        return $value === false ? 0.0 : (float)$value;
    }

    public function upsertQuantity(int $itemId, int $storageAreaId, float $quantity): void
    {
        $stmt = Db::conn()->prepare(
            'INSERT INTO inventory_levels (item_id, storage_area_id, quantity, updated_at)
             VALUES (:item_id, :storage_area_id, :quantity, :updated_at)
             ON CONFLICT(item_id, storage_area_id)
             DO UPDATE SET quantity = excluded.quantity, updated_at = excluded.updated_at'
        );

        $stmt->execute([
            ':item_id' => $itemId,
            ':storage_area_id' => $storageAreaId,
            ':quantity' => $quantity,
            ':updated_at' => gmdate('c'),
        ]);
    }

    public function adjustQuantity(int $itemId, int $storageAreaId, float $delta, bool $allowNegative = false): float
    {
        $current = $this->currentQuantity($itemId, $storageAreaId);
        $next = $current + $delta;
        if (!$allowNegative && $next < -0.00001) {
            throw new \RuntimeException('Insufficient stock for this operation.', 422);
        }

        $safe = $allowNegative ? $next : max(0, $next);
        $this->upsertQuantity($itemId, $storageAreaId, round($safe, 3));

        return round($safe, 3);
    }

    public function matrix(?string $search = null, ?int $storageAreaId = null, bool $includeInactive = false): array
    {
        $conditions = ['i.deleted_at IS NULL', 'sa.deleted_at IS NULL'];
        $params = [];

        if (!$includeInactive) {
            $conditions[] = 'i.is_active = 1 AND sa.is_active = 1';
        }

        if ($search !== null && trim($search) !== '') {
            $conditions[] = '(i.name LIKE :search OR i.sku LIKE :search OR i.category LIKE :search OR sa.name LIKE :search OR sa.code LIKE :search)';
            $params[':search'] = '%' . trim($search) . '%';
        }

        if ($storageAreaId !== null && $storageAreaId > 0) {
            $conditions[] = 'sa.id = :storage_area_id';
            $params[':storage_area_id'] = $storageAreaId;
        }

        $where = $conditions !== [] ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $sql = 'SELECT
                    i.id AS item_id,
                    i.sku,
                    i.name AS item_name,
                    i.category,
                    i.unit,
                    i.reorder_level,
                    i.is_active AS item_is_active,
                    sa.id AS storage_area_id,
                    sa.code AS storage_area_code,
                    sa.name AS storage_area_name,
                    sa.is_active AS storage_area_is_active,
                    COALESCE(il.quantity, 0) AS quantity,
                    COALESCE(t.total_quantity, 0) AS total_item_quantity,
                    COALESCE(il.updated_at, "") AS last_level_update
                FROM items i
                CROSS JOIN storage_areas sa
                LEFT JOIN inventory_levels il
                    ON il.item_id = i.id
                   AND il.storage_area_id = sa.id
                LEFT JOIN (
                    SELECT item_id, SUM(quantity) AS total_quantity
                    FROM inventory_levels
                    GROUP BY item_id
                ) t ON t.item_id = i.id
                ' . $where . '
                ORDER BY i.name ASC, sa.name ASC';

        $stmt = Db::conn()->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll() ?: [];
    }
}
