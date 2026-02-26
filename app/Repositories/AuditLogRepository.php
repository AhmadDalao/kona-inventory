<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class AuditLogRepository
{
    public function create(array $entry): void
    {
        $stmt = Db::conn()->prepare(
            'INSERT INTO audit_logs (
                actor_user_id,
                actor_name,
                actor_email,
                actor_role,
                action,
                entity_type,
                entity_id,
                status_code,
                summary,
                metadata,
                ip_address,
                user_agent,
                created_at
            ) VALUES (
                :actor_user_id,
                :actor_name,
                :actor_email,
                :actor_role,
                :action,
                :entity_type,
                :entity_id,
                :status_code,
                :summary,
                :metadata,
                :ip_address,
                :user_agent,
                :created_at
            )'
        );

        $stmt->execute([
            ':actor_user_id' => $entry['actor_user_id'] ?? null,
            ':actor_name' => (string)($entry['actor_name'] ?? ''),
            ':actor_email' => (string)($entry['actor_email'] ?? ''),
            ':actor_role' => (string)($entry['actor_role'] ?? ''),
            ':action' => (string)($entry['action'] ?? ''),
            ':entity_type' => (string)($entry['entity_type'] ?? ''),
            ':entity_id' => isset($entry['entity_id']) ? (string)$entry['entity_id'] : null,
            ':status_code' => (int)($entry['status_code'] ?? 200),
            ':summary' => (string)($entry['summary'] ?? ''),
            ':metadata' => isset($entry['metadata']) ? json_encode($entry['metadata'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : null,
            ':ip_address' => (string)($entry['ip_address'] ?? ''),
            ':user_agent' => (string)($entry['user_agent'] ?? ''),
            ':created_at' => (string)($entry['created_at'] ?? gmdate('c')),
        ]);
    }

    public function list(array $filters = []): array
    {
        $limit = max(1, min((int)($filters['limit'] ?? 100), 500));
        $conditions = [];
        $params = [];

        if (!empty($filters['search'])) {
            $conditions[] = '(actor_name LIKE :search OR actor_email LIKE :search OR action LIKE :search OR entity_type LIKE :search OR entity_id LIKE :search OR summary LIKE :search)';
            $params[':search'] = '%' . trim((string)$filters['search']) . '%';
        }

        if (!empty($filters['entity_type'])) {
            $conditions[] = 'entity_type = :entity_type';
            $params[':entity_type'] = trim((string)$filters['entity_type']);
        }

        if (!empty($filters['action'])) {
            $conditions[] = 'action = :action';
            $params[':action'] = trim((string)$filters['action']);
        }

        if (!empty($filters['date_from'])) {
            $conditions[] = 'date(created_at) >= date(:date_from)';
            $params[':date_from'] = (string)$filters['date_from'];
        }

        if (!empty($filters['date_to'])) {
            $conditions[] = 'date(created_at) <= date(:date_to)';
            $params[':date_to'] = (string)$filters['date_to'];
        }

        $where = $conditions !== [] ? ('WHERE ' . implode(' AND ', $conditions)) : '';

        $stmt = Db::conn()->prepare(
            'SELECT id, actor_user_id, actor_name, actor_email, actor_role, action, entity_type, entity_id, status_code, summary, metadata, ip_address, user_agent, created_at
             FROM audit_logs
             ' . $where . '
             ORDER BY id DESC
             LIMIT :limit'
        );

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll() ?: [];
        foreach ($rows as &$row) {
            $decoded = null;
            if (!empty($row['metadata'])) {
                $parsed = json_decode((string)$row['metadata'], true);
                $decoded = is_array($parsed) ? $parsed : null;
            }
            $row['metadata'] = $decoded;
        }
        unset($row);

        return $rows;
    }
}
