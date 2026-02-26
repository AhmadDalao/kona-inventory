<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\UserRepository;
use PDOException;

class AdminUserController
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository();
    }

    public function index(Request $request): array
    {
        $search = trim((string)$request->query('search', ''));
        $role = trim((string)$request->query('role', ''));
        $limit = (int)$request->query('limit', 250);

        return [
            'body' => [
                'data' => $this->users->listUsers($search, $role !== '' ? $role : null, $limit),
            ],
            'status' => 200,
        ];
    }

    public function store(Request $request): array
    {
        $payload = $request->body();
        $name = trim((string)($payload['name'] ?? ''));
        $email = strtolower(trim((string)($payload['email'] ?? '')));
        $password = (string)($payload['password'] ?? '');
        $role = strtolower(trim((string)($payload['role'] ?? 'manager')));

        $this->assertRole($role);
        if ($name === '' || $email === '' || $password === '') {
            throw new \InvalidArgumentException('name, email, and password are required.');
        }
        if (strlen($password) < 8) {
            throw new \InvalidArgumentException('Password must be at least 8 characters.');
        }

        try {
            $created = $this->users->create([
                'name' => $name,
                'email' => $email,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                'role' => $role,
                'is_active' => array_key_exists('is_active', $payload) ? (int)(bool)$payload['is_active'] : 1,
            ]);
        } catch (PDOException $exception) {
            throw new \RuntimeException('User email must be unique.', 422);
        }

        return ['body' => ['data' => $created], 'status' => 201];
    }

    public function update(Request $request, array $params, array $actor): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid user id.');
        }

        $existing = $this->users->findById($id);
        if (!$existing) {
            throw new \RuntimeException('User not found.', 404);
        }

        $payload = $request->body();
        $nextRole = array_key_exists('role', $payload) ? strtolower(trim((string)$payload['role'])) : (string)$existing['role'];
        $this->assertRole($nextRole);

        if ((int)$actor['id'] === $id && array_key_exists('is_active', $payload) && empty($payload['is_active'])) {
            throw new \InvalidArgumentException('You cannot deactivate your own account.');
        }

        if ((int)$actor['id'] === $id && array_key_exists('role', $payload) && strtolower((string)$payload['role']) !== strtolower((string)$existing['role'])) {
            throw new \InvalidArgumentException('You cannot change your own role.');
        }

        $updateData = [];
        foreach (['name', 'email', 'role', 'is_active'] as $key) {
            if (array_key_exists($key, $payload)) {
                $updateData[$key] = $payload[$key];
            }
        }

        if (array_key_exists('password', $payload) && trim((string)$payload['password']) !== '') {
            $password = (string)$payload['password'];
            if (strlen($password) < 8) {
                throw new \InvalidArgumentException('Password must be at least 8 characters.');
            }
            $updateData['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }

        try {
            $updated = $this->users->update($id, $updateData);
        } catch (PDOException $exception) {
            throw new \RuntimeException('User email must be unique.', 422);
        }

        if (!$updated) {
            throw new \RuntimeException('User not found.', 404);
        }

        return ['body' => ['data' => $updated], 'status' => 200];
    }

    private function assertRole(string $role): void
    {
        $allowed = ['owner', 'manager', 'viewer'];
        if (!in_array($role, $allowed, true)) {
            throw new \InvalidArgumentException('role must be owner, manager, or viewer.');
        }
    }
}
