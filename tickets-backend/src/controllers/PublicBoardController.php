<?php
declare(strict_types=1);

final class PublicBoardController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;

        // Sync PHP and MySQL session timezone to avoid drift in timestamp comparisons
        $phpTz = date_default_timezone_get();
        $offset = (new DateTimeImmutable('now', new DateTimeZone($phpTz)))->format('P');
        $this->db->exec("SET time_zone = '{$offset}'");
    }

    public function getInitialState(): array
    {
        $activeTickets = $this->getActiveTickets();
        $technicians = $this->getTechniciansWithStatus();
        $lunchBlocks = $this->getLunchBlocks();
        $currentLunch = $this->getCurrentLunchBlock();
        $pendingAssistance = $this->getPendingAssistance();
        $stats = $this->getStats();

        return [
            'active_tickets' => $activeTickets,
            'technicians' => $technicians,
            'lunch_blocks' => $lunchBlocks,
            'current_lunch' => $currentLunch,
            'pending_assistance' => $pendingAssistance,
            'stats' => $stats,
            'server_time' => (new DateTimeImmutable('now'))->format(DATE_ATOM),
        ];
    }

    public function streamEvents(?string $since): never
    {
        // ── SSE headers ─────────────────────────────────────────────────
        header('Content-Type: text/event-stream; charset=utf-8');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        // ── Disable all PHP output buffering ────────────────────────────
        @ini_set('output_buffering', 'off');
        @ini_set('zlib.output_compression', '0');
        @ini_set('implicit_flush', '1');
        while (ob_get_level() > 0) {
            @ob_end_clean();
        }
        ob_implicit_flush(true);
        ignore_user_abort(true);
        set_time_limit(0);

        // ── Force initial flush ─────────────────────────────────────────
        echo str_repeat(' ', 4096) . "\n";
        flush();
        echo ": connected\n\n";
        flush();

        // Separate cursors per event type — prevents cross-contamination
        $baseTime = $since ? new DateTimeImmutable($since) : new DateTimeImmutable('now');
        $lastTicketAt = $baseTime;
        $lastAssistanceAt = $baseTime;
        $lastClosedAt = $baseTime;

        $prevTechSnapshot = $this->getTechnicianSnapshot();
        $lastEventAt = time();

        error_log("[SSE] Stream started. since=" . ($since ?? 'now'));

        while (!connection_aborted()) {
            $now = new DateTimeImmutable('now');

            // 1) Nuevos tickets
            $newTickets = $this->getNewTicketsSince($lastTicketAt);
            if (!empty($newTickets)) {
                foreach ($newTickets as $t) {
                    $this->sendSSE('new_ticket', $t, 'ticket-' . $t['id'] . '-' . $t['created_at']);
                    $lastEventAt = time();
                }
                $lastCreated = end($newTickets)['created_at'] ?? null;
                if ($lastCreated !== null) {
                    $lastTicketAt = (new DateTimeImmutable($lastCreated))->modify('+1 second');
                }
            }

            // 2) Technician status changes
            $currentTechs = $this->getTechniciansWithStatus();
            foreach ($currentTechs as $tech) {
                $id = (int)$tech['id'];
                $prev = $prevTechSnapshot[$id] ?? null;
                if ($prev === null || $this->techChanged($prev, $tech)) {
                    $this->sendSSE('technician_status', [
                        'id' => $id,
                        'name' => $tech['name'],
                        'status' => $tech['status'],
                        'status_reason' => $tech['status_reason'] ?? null,
                        'active_tickets_count' => (int)$tech['active_tickets_count'],
                    ], "t{$id}");
                    $lastEventAt = time();
                    $prevTechSnapshot[$id] = $tech;
                }
            }

            // 3) Lunch blocks (deduplicated by DB via INSERT IGNORE — safe)
            $lunchBlocks = $this->getLunchBlocks();
            foreach ($lunchBlocks as $block) {
                $blockId = (int)$block['id'];
                $start = $block['start_time'];
                $end = $block['end_time'];

                if ($this->isNowBetween($start, $end, $now)) {
                    if ($this->tryMarkNotification($blockId, 'start')) {
                        $this->sendSSE('lunch_started', [
                            'block_name' => $block['block_name'],
                            'start_time' => $start,
                            'end_time' => $end,
                        ], "lunch-start-{$blockId}-" . $now->format('Y-m-d'));
                        $lastEventAt = time();
                    }
                } else {
                    $endDT = $this->timeFor($end, $now);
                    if ($now > $endDT && $this->tryMarkNotification($blockId, 'end')) {
                        $this->sendSSE('lunch_ended', [
                            'block_name' => $block['block_name'],
                        ], "lunch-end-{$blockId}-" . $now->format('Y-m-d'));
                        $lastEventAt = time();
                    }
                }
            }

            // 4) Assistance requests — own cursor
            $assistances = $this->getNewAssistanceSince($lastAssistanceAt);
            if (!empty($assistances)) {
                foreach ($assistances as $a) {
                    $this->sendSSE('assistance_request', $a, "a{$a['id']}");
                    $lastEventAt = time();
                }
                $lastReq = end($assistances)['requested_at'] ?? null;
                if ($lastReq !== null) {
                    $lastAssistanceAt = (new DateTimeImmutable($lastReq))->modify('+1 second');
                }
            }

            // 5) Tickets closed — own cursor
            $closed = $this->getTicketsClosedSince($lastClosedAt);
            if (!empty($closed)) {
                foreach ($closed as $c) {
                    $this->sendSSE('ticket_closed', $c, "c{$c['id']}");
                    $lastEventAt = time();
                }
                $lastClosed = end($closed)['created_at'] ?? null;
                if ($lastClosed !== null) {
                    $lastClosedAt = (new DateTimeImmutable($lastClosed))->modify('+1 second');
                }
            }

            // Keepalive every 15s
            if ((time() - $lastEventAt) >= 15) {
                $this->sendSSE('keepalive', [
                    'timestamp' => (new DateTimeImmutable())->format(DATE_ATOM),
                ]);
                $lastEventAt = time();
            }

            sleep(3);
        }

        error_log("[SSE] Stream ended (connection aborted)");
        exit;
    }

    private function sendSSE(string $event, array $data, ?string $id = null): void
    {
        if ($id !== null) {
            echo "id: {$id}\n";
        }
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
        flush();
    }

    private function tryMarkNotification(int $blockId, string $type = 'start'): bool
    {
        $sql = "INSERT IGNORE INTO Lunch_Notifications_Log (Fk_Lunch_Block, Notification_Date, Notification_Type) VALUES (:block, CURDATE(), :type)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':block' => $blockId, ':type' => $type]);
        return $stmt->rowCount() > 0;
    }

    private function getActiveTickets(): array
    {
        $sql = <<<'SQL'
SELECT
  sr.ID_Service_Request as id,
  sr.Ticket_Code as ticket_code,
  sr.Subject as subject,
  o.Name_Office as office_name,
  ts.Type_Service as service_name,
  sr.System_Priority as priority,
  sr.Status as status,
  CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name,
  t.ID_Technicians as technician_id,
  sr.Created_at as created_at,
  TIMESTAMPDIFF(MINUTE, sr.Created_at, NOW()) as elapsed_minutes
FROM Service_Request sr
JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request AND tt.Status = 'Activo'
JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
WHERE sr.Status = 'En Proceso'
ORDER BY sr.Created_at ASC
SQL;
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function getTechniciansWithStatus(): array
    {
        $sql = <<<'SQL'
SELECT
  t.ID_Technicians as id,
  CONCAT(t.First_Name, ' ', t.Last_Name) as name,
  t.Status,
  t.Fk_Lunch_Block,
  lb.Block_Name,
  lb.Start_Time,
  lb.End_Time,
  (SELECT COUNT(*) FROM Ticket_Technicians tt
     JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
     WHERE tt.Fk_Technician = t.ID_Technicians
       AND tt.Status = 'Activo' AND sr.Status != 'Cerrado') as active_tickets_count
FROM Technicians t
LEFT JOIN Lunch_Blocks lb ON t.Fk_Lunch_Block = lb.ID_Lunch_Block
ORDER BY t.First_Name
SQL;
        $stmt = $this->db->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        foreach ($rows as &$r) {
            $r['status'] = $r['Status'] ?? $r['status'] ?? null;
            $r['status_reason'] = $r['status_reason'] ?? null;
        }
        return $rows;
    }

    private function getLunchBlocks(): array
    {
        $sql = "SELECT ID_Lunch_Block as id, Block_Name as block_name, Start_Time as start_time, End_Time as end_time FROM Lunch_Blocks ORDER BY Start_Time";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function getCurrentLunchBlock(): array
    {
        $sql = "SELECT ID_Lunch_Block as id, Block_Name as block_name, Start_Time as start_time, End_Time as end_time
                FROM Lunch_Blocks
                WHERE TIME(NOW()) BETWEEN Start_Time AND End_Time
                LIMIT 1";
        $stmt = $this->db->query($sql);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? ['active' => true, 'block' => $row] : ['active' => false, 'block' => null];
    }

    private function getPendingAssistance(): array
    {
        $sql = "SELECT ar.ID_Request as id,
                       sr.Ticket_Code as ticket_code,
                       u.Full_Name as technician_name,
                       o.Name_Office as office_name,
                       ar.Requested_At as requested_at
                FROM Assistance_Requests ar
                LEFT JOIN Users u ON ar.Fk_Requesting_Technician = u.ID_Users
                LEFT JOIN Service_Request sr ON ar.Fk_Ticket = sr.ID_Service_Request
                LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                WHERE ar.Status = 'PENDIENTE'
                ORDER BY ar.Requested_At ASC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function getStats(): array
    {
        $sql = "SELECT
                 (SELECT COUNT(*) FROM Service_Request WHERE Status = 'Pendiente') as pending,
                 (SELECT COUNT(*) FROM Service_Request WHERE Status = 'En Proceso') as in_progress,
                 (SELECT COUNT(*) FROM Service_Request WHERE DATE(Created_at) = CURDATE()) as today_created
                ";
        $stmt = $this->db->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['pending' => 0, 'in_progress' => 0, 'today_created' => 0];
    }

    private function getNewTicketsSince(DateTimeImmutable $since): array
    {
        $sql = "SELECT sr.ID_Service_Request as id, sr.Ticket_Code as ticket_code, sr.Subject as subject,
                       o.Name_Office as office_name, ts.Type_Service as service_name, sr.System_Priority as priority,
                       CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name, sr.Created_at as created_at
                FROM Service_Request sr
                LEFT JOIN Ticket_Technicians tt ON sr.ID_Service_Request = tt.Fk_Service_Request AND tt.Status = 'Activo'
                LEFT JOIN Technicians t ON tt.Fk_Technician = t.ID_Technicians
                LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                LEFT JOIN TI_Service ts ON sr.Fk_TI_Service = ts.ID_TI_Service
                WHERE sr.Created_at > :since AND sr.Status != 'Cerrado'
                ORDER BY sr.Created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':since' => $since->format('Y-m-d H:i:s')]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function getNewAssistanceSince(DateTimeImmutable $since): array
    {
        $sql = "SELECT ar.ID_Request as id,
                       sr.Ticket_Code as ticket_code,
                       u.Full_Name as technician_name,
                       o.Name_Office as office_name,
                       ar.Requested_At as requested_at
                FROM Assistance_Requests ar
                LEFT JOIN Users u ON ar.Fk_Requesting_Technician = u.ID_Users
                LEFT JOIN Service_Request sr ON ar.Fk_Ticket = sr.ID_Service_Request
                LEFT JOIN Office o ON sr.Fk_Office = o.ID_Office
                WHERE ar.Status = 'PENDIENTE' AND ar.Requested_At > :since
                ORDER BY ar.Requested_At ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':since' => $since->format('Y-m-d H:i:s')]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function getTicketsClosedSince(DateTimeImmutable $since): array
    {
        $sql = "SELECT tt.ID_Timeline as id,
                       sr.Ticket_Code as ticket_code,
                       tt.Event_Date as created_at
                FROM Ticket_Timeline tt
                JOIN Service_Request sr ON tt.Fk_Service_Request = sr.ID_Service_Request
                WHERE tt.New_Status = 'Cerrado' AND tt.Event_Date > :since
                ORDER BY tt.Event_Date ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':since' => $since->format('Y-m-d H:i:s')]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    private function getTechnicianSnapshot(): array
    {
        $rows = $this->getTechniciansWithStatus();
        $snap = [];
        foreach ($rows as $r) {
            $snap[(int)$r['id']] = $r;
        }
        return $snap;
    }

    private function techChanged(array $prev, array $current): bool
    {
        if (($prev['status'] ?? null) !== ($current['status'] ?? null)) {
            return true;
        }
        if ((int)($prev['active_tickets_count'] ?? 0) !== (int)($current['active_tickets_count'] ?? 0)) {
            return true;
        }
        return false;
    }

    private function isNowBetween(string $startStr, string $endStr, DateTimeImmutable $now): bool
    {
        $startDT = $this->timeFor($startStr, $now);
        $endDT = $this->timeFor($endStr, $now);

        if ($endDT <= $startDT) {
            $endDT = $endDT->modify('+1 day');
        }
        return ($now >= $startDT && $now <= $endDT);
    }

    private function timeFor(string $timeStr, ?DateTimeImmutable $ref = null): DateTimeImmutable
    {
        $ref = $ref ?? new DateTimeImmutable('now');
        $date = $ref->format('Y-m-d');
        $dt = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', "{$date} {$timeStr}");
        if (!$dt) {
            $dt = DateTimeImmutable::createFromFormat('Y-m-d H:i', "{$date} {$timeStr}");
        }
        if (!$dt) {
            $dt = new DateTimeImmutable($timeStr);
        }
        return $dt;
    }
}
