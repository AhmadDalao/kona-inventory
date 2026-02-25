<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\DashboardRepository;

class DashboardController
{
    private DashboardRepository $dashboard;

    public function __construct()
    {
        $this->dashboard = new DashboardRepository();
    }

    public function summary(Request $request): array
    {
        return [
            'body' => [
                'summary' => $this->dashboard->summary(),
                'low_stock' => $this->dashboard->lowStock(25),
            ],
            'status' => 200,
        ];
    }
}
