<?php

declare(strict_types=1);

namespace App\Services;

use App\Db;
use App\Repositories\InventoryRepository;
use App\Repositories\ItemRepository;
use App\Repositories\StockMovementRepository;
use App\Repositories\StorageAreaRepository;

class InventoryService
{
    private InventoryRepository $inventory;
    private ItemRepository $items;
    private StorageAreaRepository $areas;
    private StockMovementRepository $movements;
    private SettingsService $settings;

    public function __construct()
    {
        $this->inventory = new InventoryRepository();
        $this->items = new ItemRepository();
        $this->areas = new StorageAreaRepository();
        $this->movements = new StockMovementRepository();
        $this->settings = new SettingsService();
    }

    public function applyMovement(array $payload, int $actorId): array
    {
        $type = strtolower(trim((string)($payload['movement_type'] ?? '')));
        if (!in_array($type, ['receive', 'issue', 'adjust', 'transfer', 'set'], true)) {
            throw new \InvalidArgumentException('Invalid movement type. Use receive, issue, adjust, transfer, or set.');
        }

        $itemId = (int)($payload['item_id'] ?? 0);
        if ($itemId <= 0 || !$this->items->find($itemId)) {
            throw new \InvalidArgumentException('Valid item_id is required.');
        }

        $settings = $this->settings->normalizeForResponse($this->settings->all());
        $allowNegative = (bool)($settings['allow_negative_stock'] ?? false);

        $conn = Db::conn();
        $conn->beginTransaction();

        try {
            $result = match ($type) {
                'receive' => $this->receive($itemId, $payload, $actorId, $allowNegative),
                'issue' => $this->issue($itemId, $payload, $actorId, $allowNegative),
                'adjust' => $this->adjust($itemId, $payload, $actorId, $allowNegative),
                'transfer' => $this->transfer($itemId, $payload, $actorId, $allowNegative),
                'set' => $this->setAbsolute($itemId, $payload, $actorId),
                default => throw new \InvalidArgumentException('Unsupported movement type.'),
            };

            $conn->commit();
            return $result;
        } catch (\Throwable $exception) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            throw $exception;
        }
    }

    private function receive(int $itemId, array $payload, int $actorId, bool $allowNegative): array
    {
        $toArea = (int)($payload['to_storage_area_id'] ?? 0);
        $quantity = $this->positiveQuantity($payload['quantity'] ?? null);
        $this->assertAreaExists($toArea, 'to_storage_area_id');

        $newQuantity = $this->inventory->adjustQuantity($itemId, $toArea, $quantity, $allowNegative);
        $movement = $this->movements->create([
            'movement_type' => 'receive',
            'item_id' => $itemId,
            'to_storage_area_id' => $toArea,
            'quantity' => $quantity,
            'note' => $payload['note'] ?? '',
            'reference' => $payload['reference'] ?? '',
            'created_by' => $actorId,
        ]);

        return [
            'movement' => $movement,
            'updated_levels' => [
                ['item_id' => $itemId, 'storage_area_id' => $toArea, 'quantity' => $newQuantity],
            ],
        ];
    }

    private function issue(int $itemId, array $payload, int $actorId, bool $allowNegative): array
    {
        $fromArea = (int)($payload['from_storage_area_id'] ?? 0);
        $quantity = $this->positiveQuantity($payload['quantity'] ?? null);
        $this->assertAreaExists($fromArea, 'from_storage_area_id');

        $newQuantity = $this->inventory->adjustQuantity($itemId, $fromArea, -$quantity, $allowNegative);
        $movement = $this->movements->create([
            'movement_type' => 'issue',
            'item_id' => $itemId,
            'from_storage_area_id' => $fromArea,
            'quantity' => -$quantity,
            'note' => $payload['note'] ?? '',
            'reference' => $payload['reference'] ?? '',
            'created_by' => $actorId,
        ]);

        return [
            'movement' => $movement,
            'updated_levels' => [
                ['item_id' => $itemId, 'storage_area_id' => $fromArea, 'quantity' => $newQuantity],
            ],
        ];
    }

    private function adjust(int $itemId, array $payload, int $actorId, bool $allowNegative): array
    {
        $areaId = (int)($payload['to_storage_area_id'] ?? $payload['storage_area_id'] ?? 0);
        if ($areaId <= 0) {
            throw new \InvalidArgumentException('storage_area_id is required for adjust.');
        }

        $delta = $this->nonZeroQuantity($payload['quantity'] ?? null);
        $this->assertAreaExists($areaId, 'storage_area_id');

        $newQuantity = $this->inventory->adjustQuantity($itemId, $areaId, $delta, $allowNegative);
        $movement = $this->movements->create([
            'movement_type' => 'adjust',
            'item_id' => $itemId,
            'to_storage_area_id' => $areaId,
            'quantity' => $delta,
            'note' => $payload['note'] ?? '',
            'reference' => $payload['reference'] ?? '',
            'created_by' => $actorId,
        ]);

        return [
            'movement' => $movement,
            'updated_levels' => [
                ['item_id' => $itemId, 'storage_area_id' => $areaId, 'quantity' => $newQuantity],
            ],
        ];
    }

    private function transfer(int $itemId, array $payload, int $actorId, bool $allowNegative): array
    {
        $fromArea = (int)($payload['from_storage_area_id'] ?? 0);
        $toArea = (int)($payload['to_storage_area_id'] ?? 0);
        $quantity = $this->positiveQuantity($payload['quantity'] ?? null);

        $this->assertAreaExists($fromArea, 'from_storage_area_id');
        $this->assertAreaExists($toArea, 'to_storage_area_id');

        if ($fromArea === $toArea) {
            throw new \InvalidArgumentException('Transfer source and destination must be different.');
        }

        $fromNew = $this->inventory->adjustQuantity($itemId, $fromArea, -$quantity, $allowNegative);
        $toNew = $this->inventory->adjustQuantity($itemId, $toArea, $quantity, $allowNegative);

        $movement = $this->movements->create([
            'movement_type' => 'transfer',
            'item_id' => $itemId,
            'from_storage_area_id' => $fromArea,
            'to_storage_area_id' => $toArea,
            'quantity' => $quantity,
            'note' => $payload['note'] ?? '',
            'reference' => $payload['reference'] ?? '',
            'created_by' => $actorId,
        ]);

        return [
            'movement' => $movement,
            'updated_levels' => [
                ['item_id' => $itemId, 'storage_area_id' => $fromArea, 'quantity' => $fromNew],
                ['item_id' => $itemId, 'storage_area_id' => $toArea, 'quantity' => $toNew],
            ],
        ];
    }

    private function setAbsolute(int $itemId, array $payload, int $actorId): array
    {
        $areaId = (int)($payload['to_storage_area_id'] ?? $payload['storage_area_id'] ?? 0);
        if ($areaId <= 0) {
            throw new \InvalidArgumentException('storage_area_id is required for set.');
        }

        $this->assertAreaExists($areaId, 'storage_area_id');

        $target = (float)($payload['target_quantity'] ?? $payload['quantity'] ?? -1);
        if ($target < 0) {
            throw new \InvalidArgumentException('target_quantity must be 0 or greater.');
        }

        $current = $this->inventory->currentQuantity($itemId, $areaId);
        $delta = $target - $current;
        $this->inventory->upsertQuantity($itemId, $areaId, $target);

        $movement = $this->movements->create([
            'movement_type' => 'set',
            'item_id' => $itemId,
            'to_storage_area_id' => $areaId,
            'quantity' => $delta,
            'note' => $payload['note'] ?? ('Absolute set from ' . $current . ' to ' . $target),
            'reference' => $payload['reference'] ?? '',
            'created_by' => $actorId,
        ]);

        return [
            'movement' => $movement,
            'updated_levels' => [
                ['item_id' => $itemId, 'storage_area_id' => $areaId, 'quantity' => $target],
            ],
        ];
    }

    private function assertAreaExists(int $areaId, string $field): void
    {
        if ($areaId <= 0 || !$this->areas->find($areaId)) {
            throw new \InvalidArgumentException('Valid ' . $field . ' is required.');
        }
    }

    private function positiveQuantity(mixed $value): float
    {
        if (!is_numeric($value)) {
            throw new \InvalidArgumentException('Quantity must be numeric.');
        }

        $quantity = (float)$value;
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0.');
        }

        return round($quantity, 3);
    }

    private function nonZeroQuantity(mixed $value): float
    {
        if (!is_numeric($value)) {
            throw new \InvalidArgumentException('Quantity must be numeric.');
        }

        $quantity = (float)$value;
        if (abs($quantity) < 0.000001) {
            throw new \InvalidArgumentException('Quantity cannot be 0 for adjust.');
        }

        return round($quantity, 3);
    }
}
