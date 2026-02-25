<?php

declare(strict_types=1);

namespace App\Services;

use App\Config;
use App\Db;
use App\Repositories\AppSettingsRepository;
use PDO;

class MigrationService
{
    public static function run(): void
    {
        $conn = Db::conn();

        self::createUsersTable($conn);
        self::createStorageAreasTable($conn);
        self::createItemsTable($conn);
        self::createInventoryLevelsTable($conn);
        self::createStockMovementsTable($conn);
        self::createAppSettingsTable($conn);
        self::createIndexes($conn);

        self::seedAdminUser($conn);
        self::seedStorageAreas($conn);
        self::seedDefaultSettings();
    }

    private static function createUsersTable(PDO $conn): void
    {
        $conn->exec(
            'CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT "owner",
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )'
        );
    }

    private static function createStorageAreasTable(PDO $conn): void
    {
        $conn->exec(
            'CREATE TABLE IF NOT EXISTS storage_areas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )'
        );
    }

    private static function createItemsTable(PDO $conn): void
    {
        $conn->exec(
            'CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                category TEXT,
                unit TEXT NOT NULL DEFAULT "unit",
                reorder_level REAL NOT NULL DEFAULT 0,
                notes TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )'
        );
    }

    private static function createInventoryLevelsTable(PDO $conn): void
    {
        $conn->exec(
            'CREATE TABLE IF NOT EXISTS inventory_levels (
                item_id INTEGER NOT NULL,
                storage_area_id INTEGER NOT NULL,
                quantity REAL NOT NULL DEFAULT 0,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (item_id, storage_area_id),
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
                FOREIGN KEY (storage_area_id) REFERENCES storage_areas(id) ON DELETE CASCADE
            )'
        );
    }

    private static function createStockMovementsTable(PDO $conn): void
    {
        $conn->exec(
            'CREATE TABLE IF NOT EXISTS stock_movements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                movement_type TEXT NOT NULL,
                item_id INTEGER NOT NULL,
                from_storage_area_id INTEGER,
                to_storage_area_id INTEGER,
                quantity REAL NOT NULL,
                note TEXT,
                reference TEXT,
                created_by INTEGER,
                created_at TEXT NOT NULL,
                FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT,
                FOREIGN KEY (from_storage_area_id) REFERENCES storage_areas(id) ON DELETE SET NULL,
                FOREIGN KEY (to_storage_area_id) REFERENCES storage_areas(id) ON DELETE SET NULL,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
            )'
        );
    }

    private static function createAppSettingsTable(PDO $conn): void
    {
        $conn->exec(
            'CREATE TABLE IF NOT EXISTS app_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                updated_by INTEGER,
                FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
            )'
        );
    }

    private static function createIndexes(PDO $conn): void
    {
        $conn->exec('CREATE INDEX IF NOT EXISTS idx_stock_movements_item_created_at ON stock_movements(item_id, created_at)');
        $conn->exec('CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at)');
        $conn->exec('CREATE INDEX IF NOT EXISTS idx_inventory_levels_storage_area ON inventory_levels(storage_area_id)');
    }

    private static function seedAdminUser(PDO $conn): void
    {
        $email = strtolower(trim((string)Config::get('APP_ADMIN_EMAIL', 'admin@inventory.local')));
        $password = (string)Config::get('APP_ADMIN_PASSWORD', 'ChangeMe123!');
        $name = trim((string)Config::get('APP_ADMIN_NAME', 'Inventory Admin'));

        $stmt = $conn->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $existing = $stmt->fetch();

        if ($existing) {
            return;
        }

        $now = gmdate('c');
        $insert = $conn->prepare(
            'INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
             VALUES (:name, :email, :password_hash, :role, 1, :created_at, :updated_at)'
        );
        $insert->execute([
            ':name' => $name !== '' ? $name : 'Inventory Admin',
            ':email' => $email,
            ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ':role' => 'owner',
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
    }

    private static function seedStorageAreas(PDO $conn): void
    {
        $count = (int)$conn->query('SELECT COUNT(*) FROM storage_areas')->fetchColumn();
        if ($count > 0) {
            return;
        }

        $now = gmdate('c');
        $seedAreas = [
            ['MAIN', 'Main Warehouse', 'Primary receiving and bulk storage'],
            ['SHOW', 'Showroom', 'Front-of-house sample and sales units'],
            ['BACK', 'Back Room', 'Quick access and overflow stock'],
        ];

        $stmt = $conn->prepare(
            'INSERT INTO storage_areas (code, name, description, is_active, created_at, updated_at)
             VALUES (:code, :name, :description, 1, :created_at, :updated_at)'
        );

        foreach ($seedAreas as [$code, $name, $description]) {
            $stmt->execute([
                ':code' => $code,
                ':name' => $name,
                ':description' => $description,
                ':created_at' => $now,
                ':updated_at' => $now,
            ]);
        }
    }

    private static function seedDefaultSettings(): void
    {
        $settingsService = new SettingsService();
        $repo = new AppSettingsRepository();

        $existing = $repo->getAll();
        $defaults = $settingsService->defaults();
        $missing = [];

        foreach ($defaults as $key => $value) {
            if (!array_key_exists($key, $existing)) {
                $missing[$key] = $value;
            }
        }

        $repo->upsertMany($missing, null);
    }
}
