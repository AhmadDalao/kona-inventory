<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\DashboardRepository;
use App\Services\SettingsService;

class DashboardController
{
    private DashboardRepository $dashboard;
    private SettingsService $settings;

    public function __construct()
    {
        $this->dashboard = new DashboardRepository();
        $this->settings = new SettingsService();
    }

    public function summary(Request $request): array
    {
        $settings = $this->settings->normalizeForResponse($this->settings->all());
        $limit = (int)($settings['dashboard_low_stock_limit'] ?? 25);

        return [
            'body' => [
                'summary' => $this->dashboard->summary($limit),
                'low_stock' => $this->dashboard->lowStock($limit),
            ],
            'status' => 200,
        ];
    }

    public function analytics(Request $request): array
    {
        $days = (int)$request->query('days', 14);

        return [
            'body' => [
                'stock_by_area' => $this->dashboard->stockByArea(),
                'category_mix' => $this->dashboard->categoryMix(),
                'movement_trend' => $this->dashboard->movementTrend($days),
                'top_moved_items' => $this->dashboard->topMovedItems(10),
            ],
            'status' => 200,
        ];
    }
}
