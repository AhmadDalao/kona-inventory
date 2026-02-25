<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class UserRepository
{
    public function findByEmail(string $email): ?array
    {
        $stmt = Db::conn()->prepare('SELECT * FROM users WHERE lower(email) = :email LIMIT 1');
        $stmt->execute([':email' => strtolower(trim($email))]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }

    public function findById(int $id): ?array
    {
        $stmt = Db::conn()->prepare('SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return is_array($row) ? $row : null;
    }
}
