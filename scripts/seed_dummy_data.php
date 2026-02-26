<?php

declare(strict_types=1);

require dirname(__DIR__) . '/app/bootstrap.php';

use App\Db;

$options = getopt('', ['count::', 'append']);
$count = max(1, min((int)($options['count'] ?? 60), 200));
$append = array_key_exists('append', $options);

$conn = Db::conn();
$now = gmdate('c');

$ownerId = (int)$conn->query('SELECT id FROM users ORDER BY id ASC LIMIT 1')->fetchColumn();
if ($ownerId <= 0) {
    fwrite(STDERR, "No users available.\n");
    exit(1);
}

$existingDummy = (int)$conn->query("SELECT COUNT(*) FROM items WHERE sku LIKE 'DMY-%'")->fetchColumn();
if ($existingDummy > 0 && !$append) {
    fwrite(STDOUT, "Dummy data already exists ({$existingDummy} items). Use --append to add more.\n");
    exit(0);
}

$areas = $conn->query('SELECT id FROM storage_areas WHERE deleted_at IS NULL ORDER BY id ASC')->fetchAll(PDO::FETCH_COLUMN);
if (count($areas) < 4) {
    $extraAreas = [
        ['RECV', 'Receiving Bay', 'Inbound receiving zone'],
        ['A1', 'Aisle 1', 'Primary rack zone'],
        ['A2', 'Aisle 2', 'Secondary rack zone'],
        ['RTN', 'Returns', 'Returned stock holding'],
    ];

    $insertArea = $conn->prepare(
        'INSERT OR IGNORE INTO storage_areas (code, name, description, is_active, deleted_at, deleted_by, created_at, updated_at)
         VALUES (:code, :name, :description, 1, NULL, NULL, :created_at, :updated_at)'
    );

    foreach ($extraAreas as [$code, $name, $description]) {
        $insertArea->execute([
            ':code' => $code,
            ':name' => $name,
            ':description' => $description,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
    }

    $areas = $conn->query('SELECT id FROM storage_areas WHERE deleted_at IS NULL ORDER BY id ASC')->fetchAll(PDO::FETCH_COLUMN);
}

$categories = ['Electronics', 'Apparel', 'Home', 'Kitchen', 'Office', 'Wellness', 'Sports'];
$units = ['pcs', 'box', 'unit', 'pack'];
$prefixes = ['Nova', 'Axis', 'Core', 'Pulse', 'Echo', 'Luma', 'Aero', 'Urban', 'Zen', 'Prime'];
$suffixes = ['Hub', 'Kit', 'Panel', 'Bottle', 'Cable', 'Wrap', 'Pad', 'Tray', 'Case', 'Module'];

$insertItem = $conn->prepare(
    'INSERT INTO items (sku, name, category, unit, reorder_level, notes, is_active, deleted_at, deleted_by, created_at, updated_at)
     VALUES (:sku, :name, :category, :unit, :reorder_level, :notes, 1, NULL, NULL, :created_at, :updated_at)'
);

$upsertLevel = $conn->prepare(
    'INSERT INTO inventory_levels (item_id, storage_area_id, quantity, updated_at)
     VALUES (:item_id, :storage_area_id, :quantity, :updated_at)
     ON CONFLICT(item_id, storage_area_id)
     DO UPDATE SET quantity = excluded.quantity, updated_at = excluded.updated_at'
);

$insertMove = $conn->prepare(
    'INSERT INTO stock_movements (movement_type, item_id, from_storage_area_id, to_storage_area_id, quantity, note, reference, created_by, created_at)
     VALUES (:movement_type, :item_id, :from_storage_area_id, :to_storage_area_id, :quantity, :note, :reference, :created_by, :created_at)'
);

$startIndex = (int)$conn->query("SELECT COALESCE(MAX(CAST(SUBSTR(sku, 5) AS INTEGER)), 0) FROM items WHERE sku LIKE 'DMY-%'")->fetchColumn();

mt_srand(26022026 + $startIndex);
$conn->beginTransaction();

try {
    for ($i = 1; $i <= $count; $i++) {
        $n = $startIndex + $i;
        $sku = sprintf('DMY-%03d', $n);

        $name = $prefixes[array_rand($prefixes)] . ' ' . $suffixes[array_rand($suffixes)] . ' ' . $n;
        $category = $categories[array_rand($categories)];
        $unit = $units[array_rand($units)];
        $reorder = mt_rand(4, 35);

        $insertItem->execute([
            ':sku' => $sku,
            ':name' => $name,
            ':category' => $category,
            ':unit' => $unit,
            ':reorder_level' => $reorder,
            ':notes' => 'Generated dummy inventory data',
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);

        $itemId = (int)$conn->lastInsertId();

        foreach ($areas as $areaId) {
            $qty = (float)mt_rand(0, 180);
            if (mt_rand(1, 100) <= 22) {
                $qty = 0;
            }

            $upsertLevel->execute([
                ':item_id' => $itemId,
                ':storage_area_id' => (int)$areaId,
                ':quantity' => $qty,
                ':updated_at' => $now,
            ]);
        }

        $movements = mt_rand(2, 5);
        for ($m = 1; $m <= $movements; $m++) {
            $typeRoll = mt_rand(1, 100);
            if ($typeRoll <= 35) {
                $type = 'receive';
            } elseif ($typeRoll <= 60) {
                $type = 'issue';
            } elseif ($typeRoll <= 85) {
                $type = 'transfer';
            } else {
                $type = 'adjust';
            }

            $toArea = (int)$areas[array_rand($areas)];
            $fromArea = (int)$areas[array_rand($areas)];
            if ($type === 'transfer' && $fromArea === $toArea) {
                $toArea = (int)$areas[(array_rand($areas) + 1) % count($areas)];
            }

            $quantity = (float)mt_rand(1, 40);
            if ($type === 'issue') {
                $quantity *= -1;
            }
            if ($type === 'adjust' && mt_rand(0, 1) === 1) {
                $quantity *= -1;
            }

            $createdAt = gmdate('c', strtotime('-' . mt_rand(0, 45) . ' days -' . mt_rand(0, 23) . ' hours'));

            $insertMove->execute([
                ':movement_type' => $type,
                ':item_id' => $itemId,
                ':from_storage_area_id' => $type === 'receive' ? null : $fromArea,
                ':to_storage_area_id' => $type === 'issue' ? null : $toArea,
                ':quantity' => $quantity,
                ':note' => 'Dummy seed movement',
                ':reference' => 'DMY-' . $n . '-' . $m,
                ':created_by' => $ownerId,
                ':created_at' => $createdAt,
            ]);
        }
    }

    $conn->commit();
} catch (Throwable $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    fwrite(STDERR, "Seed failed: {$e->getMessage()}\n");
    exit(1);
}

$totalItems = (int)$conn->query('SELECT COUNT(*) FROM items WHERE deleted_at IS NULL')->fetchColumn();
$totalMoves = (int)$conn->query('SELECT COUNT(*) FROM stock_movements')->fetchColumn();

fwrite(STDOUT, "Dummy seed complete. Added {$count} items. Current active items: {$totalItems}. Movements: {$totalMoves}.\n");
