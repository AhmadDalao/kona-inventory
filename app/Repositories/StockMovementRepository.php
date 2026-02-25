<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class StockMovementRepository
{
    public function create(array $data): array
    {
        $stmt = Db::conn()->prepare(
            'INSERT INTO stock_movements (
                movement_type,
                item_id,
                from_storage_area_id,
                to_storage_area_id,
                quantity,
                note,
                reference,
                created_by,
                created_at
            ) VALUES (
                :movement_type,
                :item_id,
                :from_storage_area_id,
                :to_storage_area_id,
                :quantity,
                :note,
                :reference,
                :created_by,
                :created_at
            )'
        );

        $stmt->execute([
            ':movement_type' => strtolower((string)$data['movement_type']),
            ':item_id' => (int)$data['item_id'],
            ':from_storage_area_id' => $data['from_storage_area_id'] ?? null,
            ':to_storage_area_id' => $data['to_storage_area_id'] ?? null,
            ':quantity' => (float)$data['quantity'],
            ':note' => trim((string)($data['note'] ?? '')),
            ':reference' => trim((string)($data['reference'] ?? '')),
            ':created_by' => $data['created_by'] ?? null,
            ':created_at' => gmdate('c'),
        ]);

        return $this->find((int)Db::conn()->lastInsertId()) ?? [];
    }

    public function find(int $id): ?array
    {
        $stmt = Db::conn()->prepare(
            'SELECT
                sm.id,
                sm.movement_type,
                sm.quantity,
                sm.note,
                sm.reference,
                sm.created_at,
                i.id AS item_id,
                i.sku AS item_sku,
                i.name AS item_name,
                from_sa.id AS from_storage_area_id,
                from_sa.name AS from_storage_area_name,
                to_sa.id AS to_storage_area_id,
                to_sa.name AS to_storage_area_name,
                u.id AS actor_id,
                u.name AS actor_name
             FROM stock_movements sm
             INNER JOIN items i ON i.id = sm.item_id
             LEFT JOIN storage_areas from_sa ON from_sa.id = sm.from_storage_area_id
             LEFT JOIN storage_areas to_sa ON to_sa.id = sm.to_storage_area_id
             LEFT JOIN users u ON u.id = sm.created_by
             WHERE sm.id = :id
             LIMIT 1'
        );

        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function recent(int $limit = 100, array $filters = []): array
    {
        $safeLimit = max(1, min($limit, 500));

        $conditions = [];
        $params = [];

        if (!empty($filters['movement_type'])) {
            $conditions[] = 'sm.movement_type = :movement_type';
            $params[':movement_type'] = strtolower((string)$filters['movement_type']);
        }

        if (!empty($filters['item_id']) && (int)$filters['item_id'] > 0) {
            $conditions[] = 'sm.item_id = :item_id';
            $params[':item_id'] = (int)$filters['item_id'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = '(i.name LIKE :search OR i.sku LIKE :search OR sm.reference LIKE :search OR sm.note LIKE :search OR from_sa.name LIKE :search OR to_sa.name LIKE :search)';
            $params[':search'] = '%' . trim((string)$filters['search']) . '%';
        }

        if (!empty($filters['date_from'])) {
            $conditions[] = 'date(sm.created_at) >= date(:date_from)';
            $params[':date_from'] = (string)$filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $conditions[] = 'date(sm.created_at) <= date(:date_to)';
            $params[':date_to'] = (string)$filters['date_to'];
        }

        $where = $conditions !== [] ? ('WHERE ' . implode(' AND ', $conditions)) : '';

        $stmt = Db::conn()->prepare(
            'SELECT
                sm.id,
                sm.movement_type,
                sm.quantity,
                sm.note,
                sm.reference,
                sm.created_at,
                i.id AS item_id,
                i.sku AS item_sku,
                i.name AS item_name,
                from_sa.name AS from_storage_area_name,
                to_sa.name AS to_storage_area_name,
                u.name AS actor_name
             FROM stock_movements sm
             INNER JOIN items i ON i.id = sm.item_id
             LEFT JOIN storage_areas from_sa ON from_sa.id = sm.from_storage_area_id
             LEFT JOIN storage_areas to_sa ON to_sa.id = sm.to_storage_area_id
             LEFT JOIN users u ON u.id = sm.created_by
             ' . $where . '
             ORDER BY sm.id DESC
             LIMIT :limit'
        );

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $safeLimit, \PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }
}
