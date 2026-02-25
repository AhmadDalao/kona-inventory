<?php

declare(strict_types=1);

namespace App;

use PDO;
use PDOException;

class Db
{
    private static ?PDO $conn = null;

    public static function conn(): PDO
    {
        if (self::$conn !== null) {
            return self::$conn;
        }

        $driver = strtolower((string)Config::get('DB_DRIVER', 'sqlite'));

        try {
            if ($driver !== 'sqlite') {
                throw new PDOException('Only sqlite is supported in this build.');
            }

            $configured = (string)Config::get('DB_DATABASE', 'storage/inventory.sqlite');
            $databasePath = str_starts_with($configured, '/') ? $configured : BASE_PATH . '/' . ltrim($configured, '/');
            $directory = dirname($databasePath);
            if (!is_dir($directory)) {
                mkdir($directory, 0775, true);
            }

            self::$conn = new PDO('sqlite:' . $databasePath);
            self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            self::$conn->exec('PRAGMA foreign_keys = ON');
        } catch (PDOException $exception) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'Database connection failed.',
                'details' => Config::get('APP_ENV', 'local') === 'local' ? $exception->getMessage() : null,
            ]);
            exit;
        }

        return self::$conn;
    }
}
