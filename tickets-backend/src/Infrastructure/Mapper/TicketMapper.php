<?php

namespace App\Infrastructure\Mapper;

use App\Domain\Ticket\Ticket;
use App\Domain\Ticket\Assignment;
use App\Domain\Ticket\Comment;
use App\Domain\Ticket\Attachment;
use App\Domain\Ticket\Timeline;

class TicketMapper implements EntityMapperInterface
{
    public function mapToEntity(array $data): Ticket
    {
        return new Ticket(
            (int)($data['ID_Service_Request'] ?? $data['id'] ?? null),
            (int)($data['Fk_Office'] ?? $data['fk_office']),
            (int)($data['Fk_User_Requester'] ?? $data['fk_user_requester']),
            (int)($data['Fk_TI_Service'] ?? $data['fk_ti_service']),
            (int)($data['Fk_Problem_Catalog'] ?? $data['fk_problem_catalog']),
            (int)($data['Fk_Boss_Requester'] ?? $data['fk_boss_requester']),
            $data['Subject'] ?? $data['subject'] ?? '',
            $data['System_Priority'] ?? $data['system_priority'] ?? 'Media',
            $data['Fk_Software_System'] ?? $data['fk_software_system'] ?? null,
            $data['Property_number'] ?? $data['property_number'] ?? null,
            $data['Description'] ?? $data['description'] ?? null,
            $data['Resolution_Notes'] ?? $data['resolution_notes'] ?? null,
            $data['Status'] ?? $data['status'] ?? 'Pendiente',
            $data['Ticket_Code'] ?? $data['ticket_code'] ?? null,
            $data['Created_at'] ?? $data['created_at'] ?? null,
            $data['Resolved_at'] ?? $data['resolved_at'] ?? null
        );
    }

    public function mapToArray(object $entity): array
    {
        if ($entity instanceof Ticket) {
            return $entity->toArray();
        }
        throw new \InvalidArgumentException('Expected Ticket entity');
    }

    public function mapToAssignment(array $data): Assignment
    {
        return new Assignment(
            (int)($data['ID_Ticket_Technician'] ?? $data['id'] ?? null),
            (int)($data['Fk_Service_Request'] ?? $data['fk_service_request']),
            (int)($data['Fk_Technician'] ?? $data['fk_technician']),
            (bool)($data['Is_Lead'] ?? $data['is_lead'] ?? false),
            $data['Assignment_Role'] ?? $data['assignment_role'] ?? null,
            $data['Fk_Assigned_By'] ?? $data['fk_assigned_by'] ?? null,
            $data['Status'] ?? $data['status'] ?? 'Activo',
            $data['Assigned_At'] ?? $data['assigned_at'] ?? null
        );
    }

    public function mapToComment(array $data): Comment
    {
        return new Comment(
            (int)($data['ID_Comment'] ?? $data['id'] ?? null),
            (int)($data['Fk_Service_Request'] ?? $data['fk_service_request']),
            (int)($data['Fk_User'] ?? $data['fk_user']),
            $data['Comment'] ?? $data['comment'] ?? '',
            $data['Created_at'] ?? $data['created_at'] ?? null
        );
    }

    public function mapToAttachment(array $data): Attachment
    {
        return new Attachment(
            (int)($data['ID_Attachment'] ?? $data['id'] ?? null),
            (int)($data['Fk_Service_Request'] ?? $data['fk_service_request']),
            $data['File_Name'] ?? $data['file_name'] ?? '',
            $data['File_Path'] ?? $data['file_path'] ?? '',
            $data['Uploaded_at'] ?? $data['uploaded_at'] ?? null
        );
    }

    public function mapToTimeline(array $data): Timeline
    {
        return new Timeline(
            (int)($data['ID_Timeline'] ?? $data['id'] ?? null),
            (int)($data['Fk_Service_Request'] ?? $data['fk_service_request']),
            (int)($data['Fk_User_Actor'] ?? $data['fk_user_actor']),
            $data['Action_Description'] ?? $data['action_description'] ?? '',
            $data['Old_Status'] ?? $data['old_status'] ?? null,
            $data['New_Status'] ?? $data['new_status'] ?? null,
            $data['Event_Date'] ?? $data['event_date'] ?? null
        );
    }
}
