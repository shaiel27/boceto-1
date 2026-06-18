<?php

declare(strict_types=1);

/**
 * Atomic ticket code generator.
 * Uses MySQL row-level locking (FOR UPDATE) to prevent duplicate codes.
 *
 * Format: TICK-000001, TICK-000002, ...
 * The counter is manually resettable by admins only.
 */
final class TicketCodeGenerator
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        // Ensure the single-row table exists
        $this->db->exec("INSERT IGNORE INTO ticket_sequence (id, current_number) VALUES (1, 0)");
    }

    /**
     * Generate the next ticket code atomically.
     * Uses an existing transaction if one is active, otherwise creates one.
     *
     * @return string e.g. "TICK-000147"
     */
    public function nextCode(): string
    {
        try {
            $inTransaction = $this->db->inTransaction();
            if (!$inTransaction) {
                $this->db->beginTransaction();
            }

            // Row-level lock prevents concurrent increments
            $stmt = $this->db->prepare(
                "SELECT current_number FROM ticket_sequence WHERE id = 1 FOR UPDATE"
            );
            $stmt->execute();
            $next = ((int) $stmt->fetchColumn()) + 1;

            $update = $this->db->prepare(
                "UPDATE ticket_sequence SET current_number = :num WHERE id = 1"
            );
            $update->execute([':num' => $next]);

            if (!$inTransaction) {
                $this->db->commit();
            }

            return 'TICK-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
        } catch (PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("TicketCodeGenerator error: " . $e->getMessage());
            // Fallback: timestamp-based code — better than failing entirely
            return 'TICK-' . date('ymdHis');
        }
    }

    /**
     * Get the current sequence number without incrementing.
     */
    public function currentNumber(): int
    {
        $stmt = $this->db->query("SELECT current_number FROM ticket_sequence WHERE id = 1");
        return (int) ($stmt->fetchColumn() ?: 0);
    }

    /**
     * Reset the ticket sequence to zero.
     * Only callable by admins (enforced in controller).
     *
     * @param int $resetByUserId The admin user ID performing the reset
     * @return bool
     */
    public function reset(int $resetByUserId): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE ticket_sequence
             SET current_number = 0,
                 last_reset_at = NOW(),
                 reset_by = :userId
             WHERE id = 1"
        );
        return $stmt->execute([':userId' => $resetByUserId]);
    }
}
