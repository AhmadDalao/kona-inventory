<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Services\AuthService;

class AuthController
{
    private AuthService $auth;

    public function __construct()
    {
        $this->auth = new AuthService();
    }

    public function login(Request $request): array
    {
        $email = trim((string)$request->input('email', ''));
        $password = (string)$request->input('password', '');

        if ($email === '' || $password === '') {
            throw new \InvalidArgumentException('Email and password are required.');
        }

        $user = $this->auth->login($email, $password);
        if (!$user) {
            throw new \RuntimeException('Invalid login credentials.', 401);
        }

        return ['body' => ['user' => $user], 'status' => 200];
    }

    public function logout(Request $request): array
    {
        $this->auth->logout();
        return ['body' => ['message' => 'Logged out.'], 'status' => 200];
    }

    public function me(Request $request, array $actor): array
    {
        return ['body' => ['user' => $actor], 'status' => 200];
    }
}
