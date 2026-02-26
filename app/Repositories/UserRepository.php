<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class UserRepository
{
    public function findByEmail(string $email): ?array
    {
        $stmt = Db::conn()->prepare(
            'SELECT
                id,
                name,
                email,
                password_hash,
                CASE
                    WHEN lower(role) IN ("admin", "superadmin") THEN "owner"
                    ELSE lower(role)
                END AS role,
                is_active,
                created_at,
                updated_at
             FROM users
             WHERE lower(email) = :email
             LIMIT 1'
        );
        $stmt->execute([':email' => strtolower(trim($email))]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function findById(int $id): ?array
    {
        $stmt = Db::conn()->prepare(
            'SELECT
                id,
                name,
                email,
                CASE
                    WHEN lower(role) IN ("admin", "superadmin") THEN "owner"
                    ELSE lower(role)
                END AS role,
                is_active,
                created_at,
                updated_at
             FROM users
             WHERE id = :id
             LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function listUsers(string $search = '', ?string $role = null, int $limit = 200): array
    {
        $safeLimit = max(1, min($limit, 500));
        $conditions = [];
        $params = [];

        if (trim($search) !== '') {
            $conditions[] = '(name LIKE :search OR email LIKE :search)';
            $params[':search'] = '%' . trim($search) . '%';
        }

        if ($role !== null && $role !== '') {
            $conditions[] = 'CASE WHEN lower(role) IN ("admin", "superadmin") THEN "owner" ELSE lower(role) END = :role';
            $params[':role'] = strtolower($role);
        }

        $where = $conditions !== [] ? ('WHERE ' . implode(' AND ', $conditions)) : '';

        $stmt = Db::conn()->prepare(
            'SELECT
                id,
                name,
                email,
                CASE
                    WHEN lower(role) IN ("admin", "superadmin") THEN "owner"
                    ELSE lower(role)
                END AS role,
                is_active,
                created_at,
                updated_at
             FROM users
             ' . $where . '
             ORDER BY is_active DESC, role ASC, name ASC
             LIMIT :limit'
        );

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $safeLimit, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll() ?: [];
    }

    public function create(array $data): array
    {
        $now = gmdate('c');
        $stmt = Db::conn()->prepare(
            'INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
             VALUES (:name, :email, :password_hash, :role, :is_active, :created_at, :updated_at)'
        );

        $stmt->execute([
            ':name' => trim((string)$data['name']),
            ':email' => strtolower(trim((string)$data['email'])),
            ':password_hash' => (string)$data['password_hash'],
            ':role' => strtolower(trim((string)$data['role'])),
            ':is_active' => !empty($data['is_active']) ? 1 : 0,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);

        return $this->findById((int)Db::conn()->lastInsertId()) ?? [];
    }

    public function update(int $id, array $data): ?array
    {
        $existing = $this->findById($id);
        if (!$existing) {
            return null;
        }

        $sql = 'UPDATE users
                SET name = :name,
                    email = :email,
                    role = :role,
                    is_active = :is_active,
                    updated_at = :updated_at';

        $params = [
            ':id' => $id,
            ':name' => trim((string)($data['name'] ?? $existing['name'])),
            ':email' => strtolower(trim((string)($data['email'] ?? $existing['email']))),
            ':role' => strtolower(trim((string)($data['role'] ?? $existing['role']))),
            ':is_active' => array_key_exists('is_active', $data) ? (!empty($data['is_active']) ? 1 : 0) : (int)$existing['is_active'],
            ':updated_at' => gmdate('c'),
        ];

        if (array_key_exists('password_hash', $data) && trim((string)$data['password_hash']) !== '') {
            $sql .= ', password_hash = :password_hash';
            $params[':password_hash'] = (string)$data['password_hash'];
        }

        $sql .= ' WHERE id = :id';

        $stmt = Db::conn()->prepare($sql);
        $stmt->execute($params);

        return $this->findById($id);
    }
}
