<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\AppSettingsRepository;
use App\Services\SettingsService;

class SettingsController
{
    private SettingsService $service;
    private AppSettingsRepository $settings;

    public function __construct()
    {
        $this->service = new SettingsService();
        $this->settings = new AppSettingsRepository();
    }

    public function show(Request $request): array
    {
        return [
            'body' => [
                'data' => $this->service->normalizeForResponse($this->service->all()),
            ],
            'status' => 200,
        ];
    }

    public function update(Request $request, array $actor): array
    {
        $patch = $this->service->validateAndNormalizePatch($request->body());
        $this->settings->upsertMany($patch, (int)$actor['id']);

        return [
            'body' => [
                'data' => $this->service->normalizeForResponse($this->service->all()),
            ],
            'status' => 200,
        ];
    }
}
