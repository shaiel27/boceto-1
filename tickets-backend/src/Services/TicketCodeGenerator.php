<?php

declare(strict_types=1);

/**
 * Atomic ticket code generator with generation-based reset support.
 *
 * Each "generation" is a reset cycle. Resetting increments the generation
 * and resets current_number to 0, allowing codes to start from TICK-000001
 * again without colliding with previous generations (unique on code + gen).
 */
final class TicketCodeGenerator
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        // Ensure the single-row table exists
        $this->db->exec("INSERT IGNORE INTO ticket_sequence (id, current_number, generation) VALUES (1, 0, 1)");
    }

    /**
     * Generate the next ticket code atomically.
     *
     * @return array{code: string, generation: int} e.g. ['code' => 'TICK-000147', 'generation' => 1]
     */
    public function next(): array
    {
        try {
            $inTransaction = $this->db->inTransaction();
            if (!$inTransaction) {
                $this->db->beginTransaction();
            }

            $stmt = $this->db->prepare(
                "SELECT current_number, generation FROM ticket_sequence WHERE id = 1 FOR UPDATE"
            );
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $next = ((int) ($row['current_number'] ?? 0)) + 1;
            $gen = (int) ($row['generation'] ?? 1);

            $this->db->prepare(
                "UPDATE ticket_sequence SET current_number = :num WHERE id = 1"
            )->execute([':num' => $next]);

            if (!$inTransaction) {
                $this->db->commit();
            }

            $code = 'TICK-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);

            // Collision safety: if code already exists in this generation (e.g. backfill), jump
            $check = $this->db->prepare(
                "SELECT 1 FROM Service_Request WHERE Ticket_Code = :code AND sequence_generation = :gen LIMIT 1"
            );
            $check->execute([':code' => $code, ':gen' => $gen]);
            if ($check->fetchColumn()) {
                $max = $this->db->prepare(
                    "SELECT MAX(CAST(SUBSTRING(Ticket_Code, 6) AS UNSIGNED))
                     FROM Service_Request
                     WHERE Ticket_Code LIKE 'TICK-%' AND sequence_generation = :gen"
                );
                $max->execute([':gen' => $gen]);
                $next = ((int) $max->fetchColumn()) + 1;
                $this->db->exec("UPDATE ticket_sequence SET current_number = {$next} WHERE id = 1");
                $code = 'TICK-' . str_pad((string) $next, 6, '0', STR_PAD_LEFT);
            }

            return ['code' => $code, 'generation' => $gen];
        } catch (PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("TicketCodeGenerator error: " . $e->getMessage());
            return ['code' => 'TICK-' . date('ymdHis'), 'generation' => 1];
        }
    }

    /**
     * Get the current sequence state without incrementing.
     *
     * @return array{current_number: int, generation: int}
     */
    public function current(): array
    {
        $stmt = $this->db->query("SELECT current_number, generation FROM ticket_sequence WHERE id = 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return [
            'current_number' => (int) ($row['current_number'] ?? 0),
            'generation' => (int) ($row['generation'] ?? 1),
        ];
    }

    /**
     * Reset the ticket sequence for a new generation.
     * Only callable by admins (enforced in controller).
     */
    public function reset(int $resetByUserId): bool
    {
        $stmt = $this->db->prepare(
            "UPDATE ticket_sequence
             SET current_number = 0,
                 generation = generation + 1,
                 last_reset_at = NOW(),
                 reset_by = :userId
             WHERE id = 1"
        );
        return $stmt->execute([':userId' => $resetByUserId]);
    }
}
