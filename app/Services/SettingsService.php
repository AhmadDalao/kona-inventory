<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\AppSettingsRepository;

class SettingsService
{
    private AppSettingsRepository $settings;

    public function __construct()
    {
        $this->settings = new AppSettingsRepository();
    }

    public function defaults(): array
    {
        return [
            'site_name' => 'Inventory Management System',
            'site_tagline' => 'Internal stock operations dashboard',
            'site_open' => '1',
            'read_only_mode' => '0',
            'default_currency' => 'USD',
            'dashboard_low_stock_limit' => '25',
            'table_page_size' => '25',
            'allow_negative_stock' => '0',
        ];
    }

    public function all(): array
    {
        return array_merge($this->defaults(), $this->settings->getAll());
    }

    public function isReadOnlyMode(): bool
    {
        $settings = $this->all();
        return $this->toBool($settings['read_only_mode'] ?? '0');
    }

    public function normalizeForResponse(array $settings): array
    {
        return [
            'site_name' => (string)($settings['site_name'] ?? ''),
            'site_tagline' => (string)($settings['site_tagline'] ?? ''),
            'site_open' => $this->toBool($settings['site_open'] ?? '1'),
            'read_only_mode' => $this->toBool($settings['read_only_mode'] ?? '0'),
            'default_currency' => strtoupper((string)($settings['default_currency'] ?? 'USD')),
            'dashboard_low_stock_limit' => max(1, (int)($settings['dashboard_low_stock_limit'] ?? 25)),
            'table_page_size' => max(10, min(100, (int)($settings['table_page_size'] ?? 25))),
            'allow_negative_stock' => $this->toBool($settings['allow_negative_stock'] ?? '0'),
        ];
    }

    public function validateAndNormalizePatch(array $payload): array
    {
        $normalized = [];

        if (array_key_exists('site_name', $payload)) {
            $value = trim((string)$payload['site_name']);
            if ($value === '') {
                throw new \InvalidArgumentException('site_name cannot be empty.');
            }
            $normalized['site_name'] = $value;
        }

        if (array_key_exists('site_tagline', $payload)) {
            $normalized['site_tagline'] = trim((string)$payload['site_tagline']);
        }

        if (array_key_exists('site_open', $payload)) {
            $normalized['site_open'] = !empty($payload['site_open']) ? '1' : '0';
        }

        if (array_key_exists('read_only_mode', $payload)) {
            $normalized['read_only_mode'] = !empty($payload['read_only_mode']) ? '1' : '0';
        }

        if (array_key_exists('default_currency', $payload)) {
            $currency = strtoupper(trim((string)$payload['default_currency']));
            if ($currency === '' || strlen($currency) > 5) {
                throw new \InvalidArgumentException('default_currency must be 1-5 chars.');
            }
            $normalized['default_currency'] = $currency;
        }

        if (array_key_exists('dashboard_low_stock_limit', $payload)) {
            if (!is_numeric($payload['dashboard_low_stock_limit'])) {
                throw new \InvalidArgumentException('dashboard_low_stock_limit must be numeric.');
            }
            $limit = (int)$payload['dashboard_low_stock_limit'];
            if ($limit < 1 || $limit > 200) {
                throw new \InvalidArgumentException('dashboard_low_stock_limit must be between 1 and 200.');
            }
            $normalized['dashboard_low_stock_limit'] = (string)$limit;
        }

        if (array_key_exists('table_page_size', $payload)) {
            if (!is_numeric($payload['table_page_size'])) {
                throw new \InvalidArgumentException('table_page_size must be numeric.');
            }
            $size = (int)$payload['table_page_size'];
            if ($size < 10 || $size > 100) {
                throw new \InvalidArgumentException('table_page_size must be between 10 and 100.');
            }
            $normalized['table_page_size'] = (string)$size;
        }

        if (array_key_exists('allow_negative_stock', $payload)) {
            $normalized['allow_negative_stock'] = !empty($payload['allow_negative_stock']) ? '1' : '0';
        }

        if ($normalized === []) {
            throw new \InvalidArgumentException('No valid settings keys were provided.');
        }

        return $normalized;
    }

    private function toBool(string $value): bool
    {
        $normalized = strtolower(trim($value));
        return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
    }
}
