<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Repositories\AuditLogRepository;

class AuditLogController
{
    private AuditLogRepository $audit;

    public function __construct()
    {
        $this->audit = new AuditLogRepository();
    }

    public function index(Request $request): array
    {
        $filters = [
            'search' => trim((string)$request->query('search', '')),
            'entity_type' => trim((string)$request->query('entity_type', '')),
            'action' => trim((string)$request->query('action', '')),
            'date_from' => trim((string)$request->query('date_from', '')),
            'date_to' => trim((string)$request->query('date_to', '')),
            'limit' => (int)$request->query('limit', 200),
        ];

        return [
            'status' => 200,
            'body' => [
                'data' => $this->audit->list($filters),
            ],
        ];
    }
}
