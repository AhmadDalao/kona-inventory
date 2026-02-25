<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Db;

class AppSettingsRepository
{
    public function getAll(): array
    {
        $stmt = Db::conn()->query('SELECT setting_key, setting_value FROM app_settings');
        $rows = $stmt->fetchAll() ?: [];

        $settings = [];
        foreach ($rows as $row) {
            $settings[(string)$row['setting_key']] = (string)$row['setting_value'];
        }

        return $settings;
    }

    public function upsertMany(array $settings, ?int $updatedBy = null): void
    {
        if ($settings === []) {
            return;
        }

        $stmt = Db::conn()->prepare(
            'INSERT INTO app_settings (setting_key, setting_value, updated_at, updated_by)
             VALUES (:setting_key, :setting_value, :updated_at, :updated_by)
             ON CONFLICT(setting_key)
             DO UPDATE SET
                setting_value = excluded.setting_value,
                updated_at = excluded.updated_at,
                updated_by = excluded.updated_by'
        );

        $now = gmdate('c');
        foreach ($settings as $key => $value) {
            $stmt->execute([
                ':setting_key' => (string)$key,
                ':setting_value' => (string)$value,
                ':updated_at' => $now,
                ':updated_by' => $updatedBy,
            ]);
        }
    }
}
