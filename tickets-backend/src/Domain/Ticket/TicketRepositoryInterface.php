<?php

namespace App\Domain\Ticket;

interface TicketRepositoryInterface
{
    public function findById(int $id): ?Ticket;
    public function findByCode(string $code): ?Ticket;
    public function findAll(array $filters = [], int $limit = 50, int $offset = 0): array;
    public function count(array $filters = []): int;
    public function save(Ticket $ticket): Ticket;
    public function delete(int $id): bool;
    public function findAssignmentsByTicketId(int $ticketId): array;
    public function saveAssignment(Assignment $assignment): Assignment;
    public function deleteAssignmentsByTicketId(int $ticketId): bool;
    public function findCommentsByTicketId(int $ticketId): array;
    public function saveComment(Comment $comment): Comment;
    public function findAttachmentsByTicketId(int $ticketId): array;
    public function saveAttachment(Attachment $attachment): Attachment;
    public function findTimelineByTicketId(int $ticketId): array;
    public function saveTimeline(Timeline $timeline): Timeline;
    public function findCompleteTicketById(int $id): ?array;
}
