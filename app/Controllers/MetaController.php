<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\ItemRepository;
use App\Repositories\StorageAreaRepository;

class MetaController
{
    private ItemRepository $items;
    private StorageAreaRepository $areas;

    public function __construct()
    {
        $this->items = new ItemRepository();
        $this->areas = new StorageAreaRepository();
    }

    public function options(Request $request): array
    {
        return [
            'body' => [
                'items' => $this->items->all(false),
                'storage_areas' => $this->areas->all(false),
            ],
            'status' => 200,
        ];
    }
}
