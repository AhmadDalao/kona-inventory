<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Request;
use App\Repositories\AuditLogRepository;

class AuditService
{
    private AuditLogRepository $audit;

    public function __construct()
    {
        $this->audit = new AuditLogRepository();
    }

    public function log(
        Request $request,
        array $actor,
        string $action,
        ?string $entityType,
        string|int|null $entityId,
        int $statusCode,
        ?string $summary = null,
        ?array $metadata = null
    ): void {
        $cleanMetadata = $metadata !== null ? $this->sanitize($metadata) : null;

        $this->audit->create([
            'actor_user_id' => $actor['id'] ?? null,
            'actor_name' => (string)($actor['name'] ?? ''),
            'actor_email' => (string)($actor['email'] ?? ''),
            'actor_role' => strtolower((string)($actor['role'] ?? '')),
            'action' => $action,
            'entity_type' => $entityType ?? 'system',
            'entity_id' => $entityId,
            'status_code' => $statusCode,
            'summary' => $summary ?? '',
            'metadata' => $cleanMetadata,
            'ip_address' => $request->ipAddress(),
            'user_agent' => $request->userAgent(),
            'created_at' => gmdate('c'),
        ]);
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function sanitize(array $data): array
    {
        $sensitive = ['password', 'password_hash', 'current_password', 'new_password'];

        $walk = function (mixed $value, ?string $key = null) use (&$walk, $sensitive): mixed {
            if ($key !== null && in_array(strtolower($key), $sensitive, true)) {
                return '***';
            }

            if (is_array($value)) {
                $clean = [];
                foreach ($value as $k => $v) {
                    $childKey = is_string($k) ? $k : null;
                    $clean[$k] = $walk($v, $childKey);
                }
                return $clean;
            }

            if (is_object($value)) {
                return '[object]';
            }

            return $value;
        };

        return (array)$walk($data);
    }
}
