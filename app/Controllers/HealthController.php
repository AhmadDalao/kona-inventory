<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Config;
use App\Http\Request;

class HealthController
{
    public function health(Request $request): array
    {
        return [
            'status' => 'ok',
            'app' => 'InventoryManagementSystem',
            'env' => (string)Config::get('APP_ENV', 'local'),
            'time' => gmdate('c'),
        ];
    }
}
