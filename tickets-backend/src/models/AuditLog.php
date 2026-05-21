<?php
declare(strict_types=1);

final class AuditLog {
    private PDO $conn;
    private string $table = "audit_logs";

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    public function create(array $data): int {
        $query = "INSERT INTO {$this->table}
                  SET user_id       = :user_id,
                      email         = :email,
                      action        = :action,
                      entity_type   = :entity_type,
                      entity_id     = :entity_id,
                      description   = :description,
                      data          = :data,
                      severity      = :severity,
                      success       = :success,
                      ip_address    = :ip_address,
                      user_agent    = :user_agent,
                      created_at    = NOW()";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $data['user_id'] ?? null, PDO::PARAM_INT);
        $stmt->bindValue(':email', $data['email'] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(':action', $data['action'], PDO::PARAM_STR);
        $stmt->bindValue(':entity_type', $data['entity_type'] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(':entity_id', $data['entity_id'] ?? null, PDO::PARAM_INT);
        $stmt->bindValue(':description', $data['description'] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(':data', isset($data['data']) ? json_encode($data['data'], JSON_UNESCAPED_UNICODE) : null, PDO::PARAM_STR);
        $stmt->bindValue(':severity', $data['severity'] ?? 'info', PDO::PARAM_STR);
        $stmt->bindValue(':success', $data['success'] ?? 1, PDO::PARAM_INT);
        $stmt->bindValue(':ip_address', $data['ip_address'] ?? null, PDO::PARAM_STR);
        $stmt->bindValue(':user_agent', $data['user_agent'] ?? null, PDO::PARAM_STR);

        try {
            $stmt->execute();
            return (int) $this->conn->lastInsertId();
        } catch (PDOException $e) {
            error_log("AuditLog create error: " . $e->getMessage());
            return 0;
        }
    }

    public function getAll(array $filters = [], int $limit = 10, int $offset = 0): array {
        $where = [];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = "(description LIKE :search OR email LIKE :search2 OR entity_type LIKE :search3 OR ip_address LIKE :search4)";
            $s = '%' . $filters['search'] . '%';
            $params[':search'] = $s;
            $params[':search2'] = $s;
            $params[':search3'] = $s;
            $params[':search4'] = $s;
        }
        if (!empty($filters['action'])) {
            $where[] = "action = :action";
            $params[':action'] = $filters['action'];
        }
        if (!empty($filters['severity'])) {
            $where[] = "severity = :severity";
            $params[':severity'] = $filters['severity'];
        }
        if (!empty($filters['from'])) {
            $where[] = "created_at >= :date_from";
            $params[':date_from'] = $filters['from'];
        }
        if (!empty($filters['to'])) {
            $where[] = "created_at <= :date_to";
            $params[':date_to'] = $filters['to'];
        }
        if (!empty($filters['user_id'])) {
            $where[] = "user_id = :user_id";
            $params[':user_id'] = (int) $filters['user_id'];
        }

        $sql = "SELECT * FROM {$this->table}";
        if ($where) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " ORDER BY created_at DESC LIMIT :lim OFFSET :off";

        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);

        try {
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("AuditLog getAll error: " . $e->getMessage());
            return [];
        }
    }

    public function count(array $filters = []): int {
        $where = [];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = "(description LIKE :search OR email LIKE :search2 OR entity_type LIKE :search3 OR ip_address LIKE :search4)";
            $s = '%' . $filters['search'] . '%';
            $params[':search'] = $s;
            $params[':search2'] = $s;
            $params[':search3'] = $s;
            $params[':search4'] = $s;
        }
        if (!empty($filters['action'])) {
            $where[] = "action = :action";
            $params[':action'] = $filters['action'];
        }
        if (!empty($filters['severity'])) {
            $where[] = "severity = :severity";
            $params[':severity'] = $filters['severity'];
        }
        if (!empty($filters['from'])) {
            $where[] = "created_at >= :date_from";
            $params[':date_from'] = $filters['from'];
        }
        if (!empty($filters['to'])) {
            $where[] = "created_at <= :date_to";
            $params[':date_to'] = $filters['to'];
        }

        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        if ($where) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $stmt = $this->conn->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }

        try {
            $stmt->execute();
            return (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        } catch (PDOException $e) {
            error_log("AuditLog count error: " . $e->getMessage());
            return 0;
        }
    }

    public function getById(int $id): ?array {
        $query = "SELECT * FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        try {
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (PDOException $e) {
            error_log("AuditLog getById error: " . $e->getMessage());
            return null;
        }
    }

    public function getStats(): array {
        $stats = [
            'total' => 0,
            'info' => 0,
            'warning' => 0,
            'critical' => 0,
            'logins' => 0,
        ];

        $query = "SELECT
                    COUNT(*) as total,
                    SUM(severity = 'info') as info,
                    SUM(severity = 'warning') as warning,
                    SUM(severity = 'critical') as critical,
                    SUM(action = 'login') as logins
                  FROM {$this->table}";

        try {
            $stmt = $this->conn->query($query);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $stats['total'] = (int) $row['total'];
                $stats['info'] = (int) $row['info'];
                $stats['warning'] = (int) $row['warning'];
                $stats['critical'] = (int) $row['critical'];
                $stats['logins'] = (int) $row['logins'];
            }
        } catch (PDOException $e) {
            error_log("AuditLog getStats error: " . $e->getMessage());
        }

        return $stats;
    }
}
