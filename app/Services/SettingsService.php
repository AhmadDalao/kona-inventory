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
            'company_name' => 'Inventory Management System',
            'site_tagline' => 'Internal stock operations dashboard',
            'site_open' => '1',
            'read_only_mode' => '0',
            'timezone' => 'America/New_York',
            'notify_email' => '1',
            'notify_inapp' => '1',
            'notify_whatsapp' => '0',
            'theme_mode' => 'light',
            'theme_palette' => 'material-indigo',
            'dashboard_style' => 'kona',
            'brand_primary' => '#5B3DF5',
            'icon_primary' => '#4332C6',
            'icon_muted' => '#667085',
            'icon_accent' => '#248DFF',
            'default_currency' => 'USD',
            'dashboard_low_stock_limit' => '25',
            'table_page_size' => '25',
            'allow_negative_stock' => '0',
            'ui_texts' => json_encode($this->defaultUiTexts(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
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
        $siteName = (string)($settings['site_name'] ?? '');
        $companyName = (string)($settings['company_name'] ?? '');
        if ($companyName === '' && $siteName !== '') {
            $companyName = $siteName;
        }
        if ($siteName === '' && $companyName !== '') {
            $siteName = $companyName;
        }

        return [
            'site_name' => $siteName,
            'company_name' => $companyName,
            'site_tagline' => (string)($settings['site_tagline'] ?? ''),
            'site_open' => $this->toBool($settings['site_open'] ?? '1'),
            'read_only_mode' => $this->toBool($settings['read_only_mode'] ?? '0'),
            'timezone' => (string)($settings['timezone'] ?? 'America/New_York'),
            'notify_email' => $this->toBool($settings['notify_email'] ?? '1'),
            'notify_inapp' => $this->toBool($settings['notify_inapp'] ?? '1'),
            'notify_whatsapp' => $this->toBool($settings['notify_whatsapp'] ?? '0'),
            'theme_mode' => $this->normalizeEnum((string)($settings['theme_mode'] ?? 'light'), ['light', 'dark', 'slate'], 'light'),
            'theme_palette' => $this->normalizeEnum((string)($settings['theme_palette'] ?? 'material-indigo'), ['material-indigo', 'material-cyan', 'material-emerald', 'material-rose'], 'material-indigo'),
            'dashboard_style' => $this->normalizeEnum((string)($settings['dashboard_style'] ?? 'kona'), ['kona', 'classic'], 'kona'),
            'brand_primary' => $this->normalizeColor($settings['brand_primary'] ?? '#5B3DF5', '#5B3DF5'),
            'icon_primary' => $this->normalizeColor($settings['icon_primary'] ?? '#4332C6', '#4332C6'),
            'icon_muted' => $this->normalizeColor($settings['icon_muted'] ?? '#667085', '#667085'),
            'icon_accent' => $this->normalizeColor($settings['icon_accent'] ?? '#248DFF', '#248DFF'),
            'default_currency' => strtoupper((string)($settings['default_currency'] ?? 'USD')),
            'dashboard_low_stock_limit' => max(1, (int)($settings['dashboard_low_stock_limit'] ?? 25)),
            'table_page_size' => max(10, min(100, (int)($settings['table_page_size'] ?? 25))),
            'allow_negative_stock' => $this->toBool($settings['allow_negative_stock'] ?? '0'),
            'ui_texts' => $this->normalizeUiTexts($settings['ui_texts'] ?? null),
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

        if (array_key_exists('company_name', $payload)) {
            $value = trim((string)$payload['company_name']);
            if ($value === '') {
                throw new \InvalidArgumentException('company_name cannot be empty.');
            }
            if (strlen($value) > 100) {
                throw new \InvalidArgumentException('company_name must be 100 chars or less.');
            }
            $normalized['company_name'] = $value;
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

        if (array_key_exists('timezone', $payload)) {
            $timezone = trim((string)$payload['timezone']);
            if ($timezone === '' || strlen($timezone) > 80) {
                throw new \InvalidArgumentException('timezone must be 1-80 chars.');
            }
            $normalized['timezone'] = $timezone;
        }

        if (array_key_exists('notify_email', $payload)) {
            $normalized['notify_email'] = !empty($payload['notify_email']) ? '1' : '0';
        }

        if (array_key_exists('notify_inapp', $payload)) {
            $normalized['notify_inapp'] = !empty($payload['notify_inapp']) ? '1' : '0';
        }

        if (array_key_exists('notify_whatsapp', $payload)) {
            $normalized['notify_whatsapp'] = !empty($payload['notify_whatsapp']) ? '1' : '0';
        }

        if (array_key_exists('theme_mode', $payload)) {
            $mode = strtolower(trim((string)$payload['theme_mode']));
            if (!in_array($mode, ['light', 'dark', 'slate'], true)) {
                throw new \InvalidArgumentException('theme_mode must be light, dark, or slate.');
            }
            $normalized['theme_mode'] = $mode;
        }

        if (array_key_exists('theme_palette', $payload)) {
            $palette = strtolower(trim((string)$payload['theme_palette']));
            if (!in_array($palette, ['material-indigo', 'material-cyan', 'material-emerald', 'material-rose'], true)) {
                throw new \InvalidArgumentException('theme_palette is invalid.');
            }
            $normalized['theme_palette'] = $palette;
        }

        if (array_key_exists('dashboard_style', $payload)) {
            $style = strtolower(trim((string)$payload['dashboard_style']));
            if (!in_array($style, ['kona', 'classic'], true)) {
                throw new \InvalidArgumentException('dashboard_style must be kona or classic.');
            }
            $normalized['dashboard_style'] = $style;
        }

        if (array_key_exists('brand_primary', $payload)) {
            $normalized['brand_primary'] = $this->normalizeColor($payload['brand_primary'], '#5B3DF5');
        }

        if (array_key_exists('icon_primary', $payload)) {
            $normalized['icon_primary'] = $this->normalizeColor($payload['icon_primary'], '#4332C6');
        }

        if (array_key_exists('icon_muted', $payload)) {
            $normalized['icon_muted'] = $this->normalizeColor($payload['icon_muted'], '#667085');
        }

        if (array_key_exists('icon_accent', $payload)) {
            $normalized['icon_accent'] = $this->normalizeColor($payload['icon_accent'], '#248DFF');
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

        if (array_key_exists('ui_texts', $payload)) {
            if (!is_array($payload['ui_texts'])) {
                throw new \InvalidArgumentException('ui_texts must be an object map.');
            }

            $updatedTexts = $this->normalizeUiTexts($this->all()['ui_texts'] ?? null);

            foreach ($payload['ui_texts'] as $key => $value) {
                if (!is_string($key) || !array_key_exists($key, $updatedTexts)) {
                    continue;
                }

                if (!(is_scalar($value) || $value === null)) {
                    throw new \InvalidArgumentException(sprintf('ui_texts.%s must be a string value.', $key));
                }

                $text = trim((string)$value);
                if (strlen($text) > 180) {
                    throw new \InvalidArgumentException(sprintf('ui_texts.%s must be 180 chars or less.', $key));
                }

                $updatedTexts[$key] = $text;
            }

            $encodedTexts = json_encode($updatedTexts, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            if (!is_string($encodedTexts)) {
                throw new \InvalidArgumentException('ui_texts could not be serialized.');
            }

            $normalized['ui_texts'] = $encodedTexts;
        }

        if ($normalized === []) {
            throw new \InvalidArgumentException('No valid settings keys were provided.');
        }

        if (array_key_exists('site_name', $normalized) && !array_key_exists('company_name', $normalized)) {
            $normalized['company_name'] = $normalized['site_name'];
        }

        if (array_key_exists('company_name', $normalized) && !array_key_exists('site_name', $normalized)) {
            $normalized['site_name'] = $normalized['company_name'];
        }

        return $normalized;
    }

    private function defaultUiTexts(): array
    {
        return [
            'page.title' => 'Inventory Management System',
            'login.title' => 'Inventory Management System',
            'login.subtitle' => 'Track inventory, movements, controls, and admin actions in one place.',
            'login.email' => 'Email',
            'login.password' => 'Password',
            'login.signin' => 'Sign In',
            'login.hint' => 'Use your company credentials.',
            'nav.main_menu' => 'Main Menu',
            'nav.control' => 'Control',
            'nav.overview' => 'Overview',
            'nav.inventory' => 'Inventory',
            'nav.movements' => 'Movements',
            'nav.areas' => 'Storage Areas',
            'nav.items' => 'Items',
            'nav.analytics' => 'Analytics',
            'nav.admin' => 'Admins',
            'nav.trash' => 'Trash',
            'nav.audit' => 'Audit Log',
            'nav.settings' => 'Settings',
            'nav.docs' => 'Docs',
            'actions.logout' => 'Logout',
            'topbar.search_placeholder' => 'Search current view',
            'topbar.refresh' => 'Refresh',
            'topbar.api' => 'API',
            'badge.read_only_on' => 'Read-only mode is ON',
            'badge.site_open' => 'Site Open',
            'badge.site_closed' => 'Site Closed',
            'settings.texts' => 'Text & Labels',
            'settings.texts_sub' => 'Edit dashboard titles and labels.',
            'settings.texts_search' => 'Search labels...',
            'settings.texts_collapse' => 'Collapse',
            'settings.texts_expand' => 'Expand',
            'settings.texts_page' => 'Page',
            'settings.texts_login' => 'Login',
            'settings.texts_navigation' => 'Navigation',
            'settings.texts_topbar' => 'Top Bar',
            'settings.texts_badges' => 'Badges',
            'settings.texts_views' => 'Views',
            'view.overview.title' => 'Overview',
            'view.overview.subtitle' => 'Snapshot of stock, risk, and movement activity.',
            'view.overview.search' => 'Search inventory records',
            'view.inventory.title' => 'Inventory',
            'view.inventory.subtitle' => 'Live quantity matrix across storage areas.',
            'view.inventory.search' => 'Search product, SKU, category, area',
            'view.movements.title' => 'Movements',
            'view.movements.subtitle' => 'Apply stock changes and monitor movement history.',
            'view.movements.search' => 'Search movement notes, references, items',
            'view.areas.title' => 'Storage Areas',
            'view.areas.subtitle' => 'Define, update, and manage warehouse zones.',
            'view.areas.search' => 'Use filters inside this page',
            'view.items.title' => 'Item Catalog',
            'view.items.subtitle' => 'Manage product SKUs, categories, units, and reorder levels.',
            'view.items.search' => 'Use filters inside this page',
            'view.analytics.title' => 'Analytics',
            'view.analytics.subtitle' => 'Movement and inventory trend analysis.',
            'view.analytics.search' => 'Use filters inside this page',
            'view.admin.title' => 'Admins',
            'view.admin.subtitle' => 'Manage admin accounts.',
            'view.admin.search' => 'Search admin users',
            'view.trash.title' => 'Trash',
            'view.trash.subtitle' => 'Review deleted records and restore them.',
            'view.trash.search' => 'Search deleted records',
            'view.audit.title' => 'Audit Log',
            'view.audit.subtitle' => 'Owner-level write action log and traceability.',
            'view.audit.search' => 'Search audit actor, action, summary',
            'view.settings.title' => 'Settings',
            'view.settings.subtitle' => 'System behavior and dashboard defaults.',
            'view.settings.search' => 'Use filters inside this page',
            'view.docs.title' => 'Docs',
            'view.docs.subtitle' => 'Internal API endpoint reference.',
            'view.docs.search' => 'Search API endpoints in docs table',
        ];
    }

    private function normalizeUiTexts(mixed $value): array
    {
        $defaults = $this->defaultUiTexts();
        $incoming = [];

        if (is_array($value)) {
            $incoming = $value;
        } elseif (is_string($value)) {
            $trimmed = trim($value);
            if ($trimmed !== '') {
                $decoded = json_decode($trimmed, true);
                if (is_array($decoded)) {
                    $incoming = $decoded;
                }
            }
        }

        foreach ($defaults as $key => $fallback) {
            if (!array_key_exists($key, $incoming)) {
                continue;
            }

            $candidate = $incoming[$key];
            if (is_scalar($candidate) || $candidate === null) {
                $defaults[$key] = trim((string)$candidate);
            }
        }

        return $defaults;
    }

    private function toBool(string|int|bool|null $value): bool
    {
        $normalized = strtolower(trim((string)$value));
        return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
    }

    private function normalizeEnum(string $value, array $allowed, string $fallback): string
    {
        $normalized = strtolower(trim($value));
        return in_array($normalized, $allowed, true) ? $normalized : $fallback;
    }

    private function normalizeColor(mixed $value, string $fallback): string
    {
        $candidate = strtoupper(trim((string)$value));
        if (preg_match('/^#[0-9A-F]{6}$/', $candidate) === 1) {
            return $candidate;
        }

        return strtoupper($fallback);
    }
}
