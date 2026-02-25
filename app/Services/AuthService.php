<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\UserRepository;

class AuthService
{
    private UserRepository $users;

    public function __construct()
    {
        $this->users = new UserRepository();
    }

    public function login(string $email, string $password): ?array
    {
        $user = $this->users->findByEmail($email);
        if (!$user || (int)$user['is_active'] !== 1) {
            return null;
        }

        if (!password_verify($password, (string)$user['password_hash'])) {
            return null;
        }

        $_SESSION['user_id'] = (int)$user['id'];

        return $this->currentUser();
    }

    public function logout(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'] ?? '/', $params['domain'] ?? '', (bool)($params['secure'] ?? false), (bool)($params['httponly'] ?? true));
        }
        session_destroy();
    }

    public function currentUser(): ?array
    {
        $userId = (int)($_SESSION['user_id'] ?? 0);
        if ($userId <= 0) {
            return null;
        }

        return $this->users->findById($userId);
    }

    public function requireAuth(): array
    {
        $user = $this->currentUser();
        if (!$user || (int)$user['is_active'] !== 1) {
            throw new \RuntimeException('Authentication required.', 401);
        }

        return $user;
    }
}
