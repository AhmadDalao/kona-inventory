<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\ItemRepository;
use PDOException;

class ItemController
{
    private ItemRepository $items;

    public function __construct()
    {
        $this->items = new ItemRepository();
    }

    public function index(Request $request): array
    {
        $includeInactive = filter_var((string)$request->query('include_inactive', '0'), FILTER_VALIDATE_BOOLEAN);
        $includeDeleted = filter_var((string)$request->query('include_deleted', '0'), FILTER_VALIDATE_BOOLEAN);
        return ['body' => ['data' => $this->items->all($includeInactive, $includeDeleted)], 'status' => 200];
    }

    public function store(Request $request): array
    {
        $payload = $request->body();
        $sku = strtoupper(trim((string)($payload['sku'] ?? '')));
        $name = trim((string)($payload['name'] ?? ''));
        $reorder = $payload['reorder_level'] ?? 0;
        $imagePath = $this->normalizeImagePath($payload['image_path'] ?? '');

        if ($sku === '' || $name === '') {
            throw new \InvalidArgumentException('sku and name are required.');
        }
        if (!is_numeric($reorder) || (float)$reorder < 0) {
            throw new \InvalidArgumentException('reorder_level must be 0 or greater.');
        }

        try {
            $created = $this->items->create([
                'sku' => $sku,
                'name' => $name,
                'category' => $payload['category'] ?? '',
                'unit' => $payload['unit'] ?? 'unit',
                'reorder_level' => (float)$reorder,
                'image_path' => $imagePath,
                'notes' => $payload['notes'] ?? '',
                'is_active' => array_key_exists('is_active', $payload) ? (int)(bool)$payload['is_active'] : 1,
            ]);
        } catch (PDOException $exception) {
            throw new \RuntimeException('Item SKU must be unique.', 422);
        }

        return ['body' => ['data' => $created], 'status' => 201];
    }

    public function update(Request $request, array $params): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid item id.');
        }

        $payload = $request->body();
        if (array_key_exists('reorder_level', $payload) && (!is_numeric($payload['reorder_level']) || (float)$payload['reorder_level'] < 0)) {
            throw new \InvalidArgumentException('reorder_level must be 0 or greater.');
        }
        if (array_key_exists('image_path', $payload)) {
            $payload['image_path'] = $this->normalizeImagePath($payload['image_path']);
        }

        try {
            $updated = $this->items->update($id, $payload);
        } catch (PDOException $exception) {
            throw new \RuntimeException('Item SKU must be unique.', 422);
        }

        if (!$updated) {
            throw new \RuntimeException('Item not found.', 404);
        }

        return ['body' => ['data' => $updated], 'status' => 200];
    }

    public function delete(Request $request, array $params, array $actor): array
    {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            throw new \InvalidArgumentException('Invalid item id.');
        }

        $existing = $this->items->find($id, true);
        if (!$existing) {
            throw new \RuntimeException('Item not found.', 404);
        }
        if (!empty($existing['deleted_at'])) {
            throw new \RuntimeException('Item is already in trash.', 422);
        }

        $deleted = $this->items->softDelete($id, (int)($actor['id'] ?? 0));
        if (!$deleted) {
            throw new \RuntimeException('Item could not be moved to trash.', 422);
        }

        return ['body' => ['message' => 'Item moved to trash.'], 'status' => 200];
    }

    public function uploadImage(Request $request): array
    {
        $file = $request->file('image');
        if (!is_array($file)) {
            throw new \InvalidArgumentException('image file is required.');
        }

        $errorCode = (int)($file['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($errorCode !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Image upload failed. Please choose a valid file.', 422);
        }

        $size = (int)($file['size'] ?? 0);
        if ($size <= 0 || $size > 5 * 1024 * 1024) {
            throw new \InvalidArgumentException('Image size must be between 1 byte and 5 MB.');
        }

        $tmpPath = (string)($file['tmp_name'] ?? '');
        if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
            throw new \RuntimeException('Invalid uploaded image.', 422);
        }

        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($tmpPath);
        $allowed = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
        ];
        $extension = $allowed[$mime] ?? null;
        if ($extension === null) {
            throw new \InvalidArgumentException('Supported image formats: JPG, PNG, WEBP, GIF.');
        }

        $uploadDir = BASE_PATH . '/public/uploads/items';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true) && !is_dir($uploadDir)) {
            throw new \RuntimeException('Unable to create upload directory.', 500);
        }

        $fileName = gmdate('YmdHis') . '-' . bin2hex(random_bytes(8)) . '.' . $extension;
        $target = $uploadDir . '/' . $fileName;
        if (!move_uploaded_file($tmpPath, $target)) {
            throw new \RuntimeException('Failed to save uploaded image.', 500);
        }

        $publicPath = '/uploads/items/' . $fileName;

        $oldPath = $this->normalizeImagePath($request->input('old_image_path', ''));
        if ($oldPath !== '') {
            $this->deleteImageFile($oldPath);
        }

        return [
            'body' => [
                'data' => [
                    'image_path' => $publicPath,
                    'image_url' => $publicPath,
                ],
            ],
            'status' => 201,
        ];
    }

    private function normalizeImagePath(mixed $value): string
    {
        $path = trim((string)$value);
        if ($path === '') {
            return '';
        }

        if (!str_starts_with($path, '/uploads/items/')) {
            throw new \InvalidArgumentException('image_path must point to /uploads/items/.');
        }

        if (strlen($path) > 220 || str_contains($path, '..')) {
            throw new \InvalidArgumentException('image_path is invalid.');
        }

        return $path;
    }

    private function deleteImageFile(string $publicPath): void
    {
        if ($publicPath === '' || !str_starts_with($publicPath, '/uploads/items/')) {
            return;
        }

        $fileName = basename($publicPath);
        if ($fileName === '' || $fileName === '.' || $fileName === '..') {
            return;
        }

        $absolute = BASE_PATH . '/public/uploads/items/' . $fileName;
        if (is_file($absolute)) {
            @unlink($absolute);
        }
    }
}
