<?php

namespace App\Infrastructure\Persistence;

use App\Core\Database;
use App\Domain\Ticket\Ticket;
use App\Domain\Ticket\Assignment;
use App\Domain\Ticket\Comment;
use App\Domain\Ticket\Attachment;
use App\Domain\Ticket\Timeline;
use App\Domain\Ticket\TicketRepositoryInterface;
use App\Infrastructure\Mapper\TicketMapper;
use PDO;

class PdoTicketRepository implements TicketRepositoryInterface
{
    private PDO $db;
    private TicketMapper $mapper;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->mapper = new TicketMapper();
    }

    public function findById(int $id): ?Ticket
    {
        $stmt = $this->db->prepare("SELECT * FROM Service_Request WHERE ID_Service_Request = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapper->mapToEntity($data) : null;
    }

    public function findByCode(string $code): ?Ticket
    {
        $stmt = $this->db->prepare("SELECT * FROM Service_Request WHERE Ticket_Code = :code");
        $stmt->execute(['code' => $code]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? $this->mapper->mapToEntity($data) : null;
    }

    public function findAll(array $filters = [], int $limit = 50, int $offset = 0): array
    {
        $sql = "SELECT * FROM Service_Request WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND Status = :status";
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['office'])) {
            $sql .= " AND Fk_Office = :office";
            $params['office'] = $filters['office'];
        }
        if (!empty($filters['priority'])) {
            $sql .= " AND System_Priority = :priority";
            $params['priority'] = $filters['priority'];
        }
        if (!empty($filters['user'])) {
            $sql .= " AND Fk_User_Requester = :user";
            $params['user'] = $filters['user'];
        }

        $sql .= " ORDER BY Created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $tickets = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tickets[] = $this->mapper->mapToEntity($data);
        }
        return $tickets;
    }

    public function count(array $filters = []): int
    {
        $sql = "SELECT COUNT(*) FROM Service_Request WHERE 1=1";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND Status = :status";
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['office'])) {
            $sql .= " AND Fk_Office = :office";
            $params['office'] = $filters['office'];
        }

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        return (int)$stmt->fetchColumn();
    }

    public function save(Ticket $ticket): Ticket
    {
        if ($ticket->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Service_Request (Ticket_Code, Fk_Office, Fk_User_Requester, Fk_TI_Service, 
                 Fk_Problem_Catalog, Fk_Boss_Requester, Fk_Software_System, Subject, Property_number, 
                 Description, System_Priority, Resolution_Notes, Status) 
                 VALUES (:ticket_code, :fk_office, :fk_user_requester, :fk_ti_service, 
                 :fk_problem_catalog, :fk_boss_requester, :fk_software_system, :subject, :property_number, 
                 :description, :system_priority, :resolution_notes, :status)"
            );
            $stmt->execute([
                'ticket_code' => $ticket->getTicketCode(),
                'fk_office' => $ticket->getFkOffice(),
                'fk_user_requester' => $ticket->getFkUserRequester(),
                'fk_ti_service' => $ticket->getFkTiService(),
                'fk_problem_catalog' => $ticket->getFkProblemCatalog(),
                'fk_boss_requester' => $ticket->getFkBossRequester(),
                'fk_software_system' => $ticket->getFkSoftwareSystem(),
                'subject' => $ticket->getSubject(),
                'property_number' => $ticket->getPropertyNumber(),
                'description' => $ticket->getDescription(),
                'system_priority' => $ticket->getSystemPriority(),
                'resolution_notes' => $ticket->getResolutionNotes(),
                'status' => $ticket->getStatus(),
            ]);
            $ticket->setId((int)$this->db->lastInsertId());
        } else {
            $stmt = $this->db->prepare(
                "UPDATE Service_Request SET Status = :status, Resolution_Notes = :resolution_notes, 
                 Resolved_at = :resolved_at WHERE ID_Service_Request = :id"
            );
            $stmt->execute([
                'id' => $ticket->getId(),
                'status' => $ticket->getStatus(),
                'resolution_notes' => $ticket->getResolutionNotes(),
                'resolved_at' => $ticket->getResolvedAt(),
            ]);
        }
        return $ticket;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare("DELETE FROM Service_Request WHERE ID_Service_Request = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function findAssignmentsByTicketId(int $ticketId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM Ticket_Technicians WHERE Fk_Service_Request = :ticket_id");
        $stmt->execute(['ticket_id' => $ticketId]);
        $assignments = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $assignments[] = $this->mapper->mapToAssignment($data);
        }
        return $assignments;
    }

    public function saveAssignment(Assignment $assignment): Assignment
    {
        if ($assignment->getId() === null) {
            $stmt = $this->db->prepare(
                "INSERT INTO Ticket_Technicians (Fk_Service_Request, Fk_Technician, Is_Lead, 
                 Assignment_Role, Fk_Assigned_By, Status) 
                 VALUES (:fk_service_request, :fk_technician, :is_lead, 
                 :assignment_role, :fk_assigned_by, :status)"
            );
            $stmt->execute([
                'fk_service_request' => $assignment->getFkServiceRequest(),
                'fk_technician' => $assignment->getFkTechnician(),
                'is_lead' => $assignment->isLead() ? 1 : 0,
                'assignment_role' => $assignment->getAssignmentRole(),
                'fk_assigned_by' => $assignment->getFkAssignedBy(),
                'status' => $assignment->getStatus(),
            ]);
            $assignment->setId((int)$this->db->lastInsertId());
        }
        return $assignment;
    }

    public function deleteAssignmentsByTicketId(int $ticketId): bool
    {
        $stmt = $this->db->prepare("DELETE FROM Ticket_Technicians WHERE Fk_Service_Request = :ticket_id");
        return $stmt->execute(['ticket_id' => $ticketId]);
    }

    public function findCommentsByTicketId(int $ticketId): array
    {
        $stmt = $this->db->prepare("
            SELECT tc.*, u.Email, CONCAT(t.First_Name, ' ', t.Last_Name) as technician_name
            FROM Ticket_Comments tc
            JOIN Users u ON tc.Fk_User = u.ID_Users
            LEFT JOIN Technicians t ON u.ID_Users = t.Fk_Users
            WHERE tc.Fk_Service_Request = :ticket_id
            ORDER BY tc.Created_at ASC
        ");
        $stmt->execute(['ticket_id' => $ticketId]);
        $comments = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $comments[] = $this->mapper->mapToComment($data);
        }
        return $comments;
    }

    public function saveComment(Comment $comment): Comment
    {
        $stmt = $this->db->prepare(
            "INSERT INTO Ticket_Comments (Fk_Service_Request, Fk_User, Comment) 
             VALUES (:fk_service_request, :fk_user, :comment)"
        );
        $stmt->execute([
            'fk_service_request' => $comment->getFkServiceRequest(),
            'fk_user' => $comment->getFkUser(),
            'comment' => $comment->getComment(),
        ]);
        $comment->setId((int)$this->db->lastInsertId());
        return $comment;
    }

    public function findAttachmentsByTicketId(int $ticketId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM Ticket_Attachments WHERE Fk_Service_Request = :ticket_id");
        $stmt->execute(['ticket_id' => $ticketId]);
        $attachments = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $attachments[] = $this->mapper->mapToAttachment($data);
        }
        return $attachments;
    }

    public function saveAttachment(Attachment $attachment): Attachment
    {
        $stmt = $this->db->prepare(
            "INSERT INTO Ticket_Attachments (Fk_Service_Request, File_Name, File_Path) 
             VALUES (:fk_service_request, :file_name, :file_path)"
        );
        $stmt->execute([
            'fk_service_request' => $attachment->getFkServiceRequest(),
            'file_name' => $attachment->getFileName(),
            'file_path' => $attachment->getFilePath(),
        ]);
        $attachment->setId((int)$this->db->lastInsertId());
        return $attachment;
    }

    public function findTimelineByTicketId(int $ticketId): array
    {
        $stmt = $this->db->prepare("
            SELECT tt.*, u.Email, CONCAT(t.First_Name, ' ', t.Last_Name) as actor_name
            FROM Ticket_Timeline tt
            JOIN Users u ON tt.Fk_User_Actor = u.ID_Users
            LEFT JOIN Technicians t ON u.ID_Users = t.Fk_Users
            WHERE tt.Fk_Service_Request = :ticket_id
            ORDER BY tt.Event_Date ASC
        ");
        $stmt->execute(['ticket_id' => $ticketId]);
        $timeline = [];
        while ($data = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $timeline[] = $this->mapper->mapToTimeline($data);
        }
        return $timeline;
    }

    public function saveTimeline(Timeline $timeline): Timeline
    {
        $stmt = $this->db->prepare(
            "INSERT INTO Ticket_Timeline (Fk_Service_Request, Fk_User_Actor, Action_Description, 
             Old_Status, New_Status) 
             VALUES (:fk_service_request, :fk_user_actor, :action_description, :old_status, :new_status)"
        );
        $stmt->execute([
            'fk_service_request' => $timeline->getFkServiceRequest(),
            'fk_user_actor' => $timeline->getFkUserActor(),
            'action_description' => $timeline->getActionDescription(),
            'old_status' => $timeline->getOldStatus(),
            'new_status' => $timeline->getNewStatus(),
        ]);
        $timeline->setId((int)$this->db->lastInsertId());
        return $timeline;
    }

    public function findCompleteTicketById(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM v_tickets_completos WHERE ID_Service_Request = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ?: null;
    }
}
